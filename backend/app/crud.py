from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlmodel import Session, select

from app.core.ai.openai import generate_answer_explanation
from app.core.security import get_password_hash, verify_password
from app.models import (
    Answer,
    AnswerExplanation,
    AnswerUpdate,
    Document,
    DocumentCreate,
    DocumentPublic,
    Exam,
    ExamAttempt,
    ExamAttemptCreate,
    ExamCreate,
    ExamPublic,
    Question,
    QuestionCreate,
    QuestionPublic,
    User,
    UserCreate,
    UserUpdate,
)

# -------------------- Users --------------------


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create,
        update={"hashed_password": get_password_hash(user_create.password)},
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        extra_data["hashed_password"] = get_password_hash(user_data["password"])
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    return session.exec(select(User).where(User.email == email)).first()


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(session=session, email=email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


# -------------------- Documents --------------------


def create_document(
    *,
    session: Session,
    document_in: DocumentCreate,
    owner_id: UUID,
    extracted_text: str | None = None,
) -> DocumentPublic:
    update = {"owner_id": str(owner_id)}
    if extracted_text is not None:
        update["extracted_text"] = extracted_text
    db_document = Document.model_validate(document_in, update=update)
    session.add(db_document)
    session.commit()
    session.refresh(db_document)
    return DocumentPublic.model_validate(db_document)


# -------------------- Exams --------------------


def create_question(
    *, session: Session, question_in: QuestionCreate, exam_id: UUID
) -> QuestionPublic:
    db_question = Question(
        question=question_in.question,
        correct_answer=question_in.correct_answer,
        type=question_in.type,
        options=question_in.options or [],
        exam_id=exam_id,
    )
    session.add(db_question)
    session.commit()
    session.refresh(db_question)
    return QuestionPublic.model_validate(db_question)


def create_db_exam(
    *,
    session: Session,
    exam_in: ExamCreate,
    owner_id: UUID,
    source_document_ids: list[str],
) -> Exam:
    db_exam = Exam(
        title=exam_in.title,
        description=exam_in.description,
        duration_minutes=exam_in.duration_minutes,
        is_published=exam_in.is_published,
        owner_id=owner_id,
        source_document_ids=source_document_ids,
    )
    session.add(db_exam)
    session.commit()
    session.refresh(db_exam)
    return db_exam


def create_exam(
    *, session: Session, db_exam: Exam, questions: list[QuestionCreate]
) -> ExamPublic:
    for q in questions:
        create_question(session=session, question_in=q, exam_id=db_exam.id)
    session.refresh(db_exam, attribute_names=["questions"])
    return ExamPublic.model_validate(db_exam)


# -------------------- Exam Attempts --------------------


def create_exam_attempt(
    *,
    session: Session,
    exam_in: ExamAttemptCreate,
    user_id: UUID,
) -> ExamAttempt:
    exam_attempt = ExamAttempt(
        exam_id=exam_in.exam_id,
        owner_id=user_id,
        is_complete=False,
    )
    session.add(exam_attempt)
    session.commit()
    session.refresh(exam_attempt)

    # Pre-create answers
    questions = session.exec(
        select(Question).where(Question.exam_id == exam_attempt.exam_id)
    ).all()

    for q in questions:
        session.add(
            Answer(
                attempt_id=exam_attempt.id,
                question_id=q.id,
                response="",
            )
        )

    session.commit()
    session.refresh(exam_attempt, attribute_names=["answers", "exam"])
    return exam_attempt


def update_answers(
    *,
    session: Session,
    attempt_id: UUID,
    answers_in: list[AnswerUpdate],
) -> list[Answer]:
    updated: list[Answer] = []

    for answer_in in answers_in:
        answer: Answer | None = None

        if answer_in.id is not None:
            answer = session.get(Answer, answer_in.id)

        if answer is None and answer_in.question_id is not None:
            answer = session.exec(
                select(Answer).where(
                    Answer.attempt_id == attempt_id,
                    Answer.question_id == answer_in.question_id,
                )
            ).first()

        if answer is None:
            raise ValueError("Answer not found")

        if answer.attempt_id != attempt_id:
            raise ValueError("Answer does not belong to attempt")

        answer.response = answer_in.response
        session.add(answer)
        updated.append(answer)

    session.commit()
    return updated


def score_answers(
    answers: list[Answer],
) -> tuple[int, int]:
    """
    Returns (correct_count, total_count)
    """
    correct_count = 0
    total = len(answers)

    for answer in answers:
        question = answer.question

        if not question.correct_answer or not answer.response:
            answer.is_correct = False
            continue

        is_correct = (
            answer.response.strip().lower() == question.correct_answer.strip().lower()
        )

        answer.is_correct = is_correct

        if is_correct:
            correct_count += 1

    return correct_count, total


async def generate_explanations_for_incorrect_answers(
    *,
    session: Session,
    exam: Exam,
    answers: list[Answer],
) -> None:
    for answer in answers:
        if answer.is_correct:
            continue

        question = answer.question

        if not question.correct_answer or not answer.response:
            continue

        explanation = await generate_answer_explanation(
            session=session,
            exam=exam,
            question=question.question,
            correct_answer=question.correct_answer,
            user_answer=answer.response,
        )

        answer.explanation = AnswerExplanation(
            explanation=explanation.explanation,
            key_takeaway=explanation.key_takeaway,
            suggested_review=explanation.suggested_review,
        )

        session.add(answer)


async def score_exam_attempt(
    *,
    session: Session,
    exam_attempt: ExamAttempt,
) -> float:
    session.refresh(exam_attempt, attribute_names=["exam"])
    exam = exam_attempt.exam
    assert exam is not None
    answers = exam_attempt.answers

    # 1. Score deterministically
    correct, total = score_answers(answers)

    score = (correct / total) * 100 if total else 0
    exam_attempt.score = score

    # Persist scoring results
    session.add(exam_attempt)
    for a in answers:
        session.add(a)
    session.commit()

    # 2. Generate explanations (AI side-effects)
    await generate_explanations_for_incorrect_answers(
        session=session,
        exam=exam,
        answers=answers,
    )

    session.commit()
    session.refresh(exam_attempt)

    return score


async def finalize_exam_attempt(
    *,
    session: Session,
    exam_attempt: ExamAttempt,
) -> ExamAttempt:
    if exam_attempt.is_complete:
        return exam_attempt

    exam_attempt.is_complete = True
    exam_attempt.completed_at = datetime.now(timezone.utc)
    session.add(exam_attempt)
    session.commit()

    session.refresh(exam_attempt, attribute_names=["answers"])
    for ans in exam_attempt.answers:
        session.refresh(ans, attribute_names=["question"])

    await score_exam_attempt(session=session, exam_attempt=exam_attempt)
    session.refresh(exam_attempt)
    return exam_attempt

import json
import uuid
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlmodel import Session, select

from app.core.ai.openai import generate_answer_explanation
from app.core.security import get_password_hash, verify_password
from app.models import (
    Answer,
    AnswerUpdate,
    Document,
    DocumentCreate,
    DocumentPublic,
    Exam,
    ExamAttempt,
    ExamAttemptCreate,
    ExamCreate,
    ExamPublic,
    Item,
    ItemCreate,
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


# -------------------- Items --------------------


def create_item(*, session: Session, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


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


def create_db_exam(*, session: Session, exam_in: ExamCreate, owner_id: UUID) -> Exam:
    db_exam = Exam(
        title=exam_in.title,
        description=exam_in.description,
        duration_minutes=exam_in.duration_minutes,
        is_published=exam_in.is_published,
        owner_id=owner_id,
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


async def score_exam_attempt(session: Session, exam_attempt: ExamAttempt) -> float:
    total_questions = len(exam_attempt.answers)
    correct_count = 0

    for answer in exam_attempt.answers:
        question = answer.question

        # Skip if no correct answer key
        if not question.correct_answer:
            answer.is_correct = False
            session.add(answer)
            continue

        if not answer.response:
            answer.is_correct = False
            session.add(answer)
            continue

        is_correct = (
            answer.response.strip().lower() == question.correct_answer.strip().lower()
        )

        answer.is_correct = is_correct
        session.add(answer)

        if is_correct:
            correct_count += 1

        else:
            explanation_output = await generate_answer_explanation(
                question=question.question,
                correct_answer=question.correct_answer,
                user_answer=answer.response,
            )
            answer.explanation = json.loads(explanation_output.model_dump())

    score = (correct_count / total_questions) * 100 if total_questions else 0
    exam_attempt.score = score
    session.add(exam_attempt)
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

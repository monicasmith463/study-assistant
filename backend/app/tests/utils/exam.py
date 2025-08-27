from sqlmodel import Session

from app import crud
from app.models import ExamCreate, ExamPublic, QuestionCreate, User
from app.tests.utils.user import create_random_user
from app.tests.utils.utils import random_lower_string


def create_random_exam(
    db: Session, user: User | None = None, with_questions: bool = True
) -> ExamPublic:
    user = user or create_random_user(db)
    owner_id = user.id
    assert owner_id is not None

    title = random_lower_string()
    exam_in = ExamCreate(
        title=title,
        description=f"Randomly generated exam for {title}",
        duration_minutes=30,
        is_published=False,
    )

    db_exam = crud.create_db_exam(session=db, exam_in=exam_in, owner_id=owner_id)

    questions: list[QuestionCreate] = []
    if with_questions:
        for i in range(3):
            questions.append(
                QuestionCreate(
                    question=f"What is the answer to question {i+1} of {title}?",
                    answer=f"Answer {i+1}",
                    exam_id=db_exam.id,
                )
            )

    return crud.create_exam(session=db, db_exam=db_exam, questions=questions)


def create_random_exams(db: Session, user: User | None = None) -> list[ExamPublic]:
    user = user or create_random_user(db)
    return [create_random_exam(db, user) for _ in range(3)]

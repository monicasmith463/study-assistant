from sqlmodel import Session

from app import crud
from app.models import ExamCreate, QuestionCreate, QuestionType, UserCreate
from tests.utils.utils import random_email, random_lower_string


def test_create_exam(db: Session) -> None:
    user = crud.create_user(
        session=db,
        user_create=UserCreate(
            email=random_email(),
            password=random_lower_string(),
        ),
    )

    exam_in = ExamCreate(
        title=random_lower_string(),
        description=random_lower_string(),
        duration_minutes=30,
        is_published=False,
    )

    exam = crud.create_db_exam(
        session=db,
        exam_in=exam_in,
        owner_id=user.id,
        source_document_ids=[],
    )

    assert exam.id is not None
    assert exam.owner_id == user.id
    assert exam.title == exam_in.title
    assert exam.source_document_ids == []


def test_create_exam_with_questions(db: Session) -> None:
    user = crud.create_user(
        session=db,
        user_create=UserCreate(
            email=random_email(),
            password=random_lower_string(),
        ),
    )

    exam = crud.create_db_exam(
        session=db,
        exam_in=ExamCreate(
            title="Test Exam",
            description="Desc",
            duration_minutes=10,
            is_published=False,
        ),
        owner_id=user.id,
        source_document_ids=[],
    )

    questions = [
        QuestionCreate(
            question="Q1",
            correct_answer="True",
            type=QuestionType.true_false,
            options=["True", "False"],
        )
    ]

    exam_public = crud.create_exam(
        session=db,
        db_exam=exam,
        questions=questions,
    )

    assert len(exam_public.questions) == 1
    assert exam_public.questions[0].question == "Q1"

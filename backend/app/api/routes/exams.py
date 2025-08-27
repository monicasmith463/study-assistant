from typing import Any

from fastapi import APIRouter
from sqlmodel import func, select

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.core.ai.openai import generate_questions_from_documents
from app.models import (
    Exam,
    ExamCreate,
    ExamPublic,
    ExamsPublic,
    GenerateQuestionsRequest,
    QuestionCreate,
)

router = APIRouter(prefix="/exams", tags=["exams"])


@router.post("/generate", response_model=ExamPublic)
async def generate_exam(
    *,
    session: SessionDep,
    payload: GenerateQuestionsRequest,
    current_user: CurrentUser,
) -> ExamPublic:
    exam_in = ExamCreate(
        title="Midterm Exam",
        description="generated exam",
        duration_minutes=30,
        is_published=False,
    )
    db_exam = crud.create_db_exam(
        session=session, exam_in=exam_in, owner_id=current_user.id
    )

    # 2. Generate questions
    generated_questions: list[QuestionCreate] = await generate_questions_from_documents(
        session, payload.document_ids
    )

    return crud.create_exam(
        session=session,
        db_exam=db_exam,
        questions=generated_questions,
    )


@router.get("/", response_model=ExamsPublic)
def read_exams(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve exams for the current user.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Exam)
        count = session.exec(count_statement).one()
        statement = select(Exam).offset(skip).limit(limit)
        exams = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Exam)
            .where(Exam.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Exam)
            .where(Exam.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        exams = session.exec(statement).all()

    return ExamsPublic(data=exams, count=count)

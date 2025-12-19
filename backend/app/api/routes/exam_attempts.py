import logging
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Exam,
    ExamAttempt,
    ExamAttemptCreate,
    ExamAttemptPublic,
    ExamAttemptUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/exam-attempts", tags=["exam-attempts"])


def get_exam_by_id(session: SessionDep, exam_in: ExamAttemptCreate) -> Exam | None:
    exam = session.get(Exam, exam_in.exam_id)
    return exam


@router.post("/", response_model=ExamAttemptPublic)
def create_exam_attempt(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    exam_in: ExamAttemptCreate,
) -> Any:
    # 1️⃣ Validate exam
    exam = session.get(Exam, exam_in.exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    if not current_user.is_superuser and exam.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    # 2️⃣ Create attempt + pre-create answers
    exam_attempt = crud.create_exam_attempt(
        session=session,
        user_id=current_user.id,
        exam_in=ExamAttemptCreate(exam_id=exam_in.exam_id),
    )

    # 3️⃣ Update answers (optional)
    if exam_in.answers:
        crud.update_answers(
            session=session,
            attempt_id=exam_attempt.id,
            answers_in=exam_in.answers,
        )

    # 4️⃣ Finalize + score (optional)
    if exam_in.is_complete:
        exam_attempt = crud.finalize_exam_attempt(
            session=session,
            exam_attempt=exam_attempt,
        )

    return exam_attempt


@router.get("/{id}", response_model=ExamAttemptPublic)
def read_exam_attempt(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Get ExamAttempt by ID.
    """
    exam_attempt = session.get(ExamAttempt, id)
    if not exam_attempt:
        raise HTTPException(status_code=404, detail="Exam Attempt not found")
    if not current_user.is_superuser and (exam_attempt.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return exam_attempt


@router.patch("/{attempt_id}", response_model=ExamAttemptPublic)
def update_exam_attempt(
    *,
    attempt_id: uuid.UUID,
    session: SessionDep,
    exam_attempt_in: ExamAttemptUpdate,
    current_user: CurrentUser,
) -> Any:
    """
    Update an exam attempt with answers.
    If `is_complete=True`, compute the score.
    """
    exam_attempt = session.get(ExamAttempt, attempt_id)
    if not exam_attempt:
        logger.warning("Exam attempt %s not found", attempt_id)
        raise HTTPException(status_code=404, detail="Exam attempt not found")

    if not current_user.is_superuser and exam_attempt.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    if exam_attempt.is_complete:
        raise HTTPException(status_code=409, detail="Exam attempt is already completed")

    exam_attempt = crud.update_exam_attempt(
        session=session, db_exam_attempt=exam_attempt, exam_attempt_in=exam_attempt_in
    )
    return exam_attempt

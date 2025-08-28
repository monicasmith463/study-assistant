import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    ExamAttempt,
    ExamAttemptPublic,
)

router = APIRouter(prefix="/exams-attempts", tags=["exam-attempts"])


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

import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import (
    Answer,
    AnswerUpdate,
    ExamAttempt,
    ExamAttemptUpdate,
    Question,
)
from tests.utils.exam import create_random_exam

AnswerUpdate.model_rebuild()
ExamAttemptUpdate.model_rebuild()
Answer.model_rebuild()
ExamAttempt.model_rebuild()
Question.model_rebuild()

_ = [AnswerUpdate, ExamAttemptUpdate, Answer, ExamAttempt, Question]


def test_create_exam_attempt_success(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: Session,
) -> None:
    """Test creating an exam attempt successfully."""
    exam = create_random_exam(db)

    response = client.post(
        f"{settings.API_V1_STR}/exam-attempts/",
        headers=superuser_token_headers,
        json={"exam_id": str(exam.id)},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["exam_id"] == str(exam.id)


def test_create_exam_attempt_not_found(
    client: TestClient,
    superuser_token_headers: dict[str, str],
) -> None:
    """Test creating an attempt for a nonexistent exam."""

    payload = {"exam_id": str(uuid.uuid4())}

    response = client.post(
        f"{settings.API_V1_STR}/exam-attempts/",
        headers=superuser_token_headers,
        json=payload,
    )

    assert response.status_code == 404


def test_create_exam_attempt_not_enough_permissions(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    """Test that a normal user cannot create an attempt for someone else's exam."""

    exam = create_random_exam(db)

    response = client.post(
        f"{settings.API_V1_STR}/exam-attempts/",
        headers=normal_user_token_headers,
        json={"exam_id": str(exam.id)},
    )

    assert response.status_code == 403


def test_read_exam_attempt(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: Session,
) -> None:
    """Test reading an existing exam attempt."""

    # Create an exam and an attempt
    exam = create_random_exam(db)
    exam_attempt = ExamAttempt(exam_id=exam.id, owner_id=exam.owner_id)
    db.add(exam_attempt)
    db.commit()
    db.refresh(exam_attempt)

    response = client.get(
        f"{settings.API_V1_STR}/exam-attempts/{exam_attempt.id}",
        headers=superuser_token_headers,
    )

    assert response.status_code == 200
    content = response.json()
    assert content["id"] == str(exam_attempt.id)
    assert content["exam_id"] == str(exam.id)


def test_read_exam_attempt_not_found(
    client: TestClient,
    superuser_token_headers: dict[str, str],
) -> None:
    """Test reading an exam attempt that does not exist."""

    response = client.get(
        f"{settings.API_V1_STR}/exam-attempts/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Exam Attempt not found"


def test_read_exam_attempt_not_enough_permissions(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    """Test that a normal user cannot read another user's exam attempt."""

    # Create an exam and attempt owned by another user
    exam = create_random_exam(db)
    exam_attempt = ExamAttempt(exam_id=exam.id, owner_id=exam.owner_id)
    db.add(exam_attempt)
    db.commit()
    db.refresh(exam_attempt)

    response = client.get(
        f"{settings.API_V1_STR}/exam-attempts/{exam_attempt.id}",
        headers=normal_user_token_headers,
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Not enough permissions"

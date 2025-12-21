from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, delete

from app.core.config import settings
from app.core.db import engine, init_db
from app.main import app
from app.models import Answer, Document, Exam, Question, User
from tests.utils.user import authentication_token_from_email
from tests.utils.utils import get_superuser_token_headers


@pytest.fixture(scope="session", autouse=True)
def db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        init_db(session)
        yield session
        session.execute(delete(Answer))
        session.execute(delete(Question))
        session.execute(delete(Exam))
        session.execute(delete(Document))
        session.execute(delete(User))
        session.commit()


# 🔑 THIS FIXES THE 404 / PendingRollbackError CASCADE
@pytest.fixture(autouse=True)
def _rollback_after_test(db: Session) -> Generator[None, None, None]:
    yield
    db.rollback()


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


# 🔑 MUST be function-scoped
@pytest.fixture(scope="function")
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.EMAIL_TEST_USER, db=db
    )

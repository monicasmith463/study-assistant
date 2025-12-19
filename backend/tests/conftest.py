from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.core.db import engine, init_db
from app.main import app
from tests.utils.user import authentication_token_from_email
from tests.utils.utils import get_superuser_token_headers


# ---------------------------------------------------------
# 1️⃣ Initialize DB ONCE per test session
# ---------------------------------------------------------
@pytest.fixture(scope="session", autouse=True)
def db_engine():
    with Session(engine) as session:
        init_db(session)
    yield engine


# ---------------------------------------------------------
# 2️⃣ Isolated transactional session PER TEST
#    (prevents poisoned sessions + rollback errors)
# ---------------------------------------------------------
@pytest.fixture(scope="function")
def db(db_engine) -> Generator[Session, None, None]:
    connection = db_engine.connect()
    transaction = connection.begin()

    session = Session(bind=connection)
    session.begin_nested()  # SAVEPOINT

    try:
        yield session
    finally:
        session.rollback()
        session.close()
        transaction.rollback()
        connection.close()


# ---------------------------------------------------------
# 3️⃣ FastAPI test client
# ---------------------------------------------------------
@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


# ---------------------------------------------------------
# 4️⃣ Auth helpers
# ---------------------------------------------------------
@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture(scope="module")
def normal_user_token_headers(
    client: TestClient,
    db_engine,  # ⚠️ IMPORTANT: use engine, not db session
) -> dict[str, str]:
    with Session(db_engine) as session:
        return authentication_token_from_email(
            client=client,
            email=settings.EMAIL_TEST_USER,
            db=session,
        )

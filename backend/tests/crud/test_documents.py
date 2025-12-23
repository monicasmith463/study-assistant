from sqlmodel import Session

from app import crud
from app.models import DocumentCreate, UserCreate
from tests.utils.utils import random_email, random_lower_string


def test_create_document(db: Session) -> None:
    # create a user explicitly
    user = crud.create_user(
        session=db,
        user_create=UserCreate(
            email=random_email(),
            password=random_lower_string(),
        ),
    )

    doc_in = DocumentCreate(
        title="Test doc",
        description="Test description",
        filename="test.pdf",
    )

    doc = crud.create_document(
        session=db,
        document_in=doc_in,
        owner_id=user.id,
    )

    assert doc.id is not None
    assert doc.owner_id == user.id

from sqlmodel import Session

from app import crud
from app.models import Document, DocumentCreate, DocumentPublic, DocumentStatus, User
from tests.utils.user import create_random_user
from tests.utils.utils import random_lower_string


def create_random_document(
    db: Session, user: User | None = None, status: DocumentStatus | None = None
) -> DocumentPublic:
    user = user or create_random_user(db)
    owner_id = user.id
    assert owner_id is not None
    filename_base = random_lower_string()
    extracted_text = f"Extracted text for {filename_base} by {owner_id}"
    document_in = DocumentCreate(
        filename=f"{filename_base}.pdf",
        content_type="application/pdf",
        size=1024,
        s3_url=f"https://example-bucket.s3.amazonaws.com/{filename_base}.pdf",
        s3_key=f"{owner_id}/{filename_base}.pdf",
    )
    document = crud.create_document(
        session=db,
        document_in=document_in,
        owner_id=owner_id,
        extracted_text=extracted_text,
    )

    # Update status if specified, or set to READY if extracted_text is provided
    db_document = db.get(Document, document.id)
    if db_document:
        if status is not None:
            db_document.status = status
        elif extracted_text is not None:
            # If extracted_text is set, document should be READY
            db_document.status = DocumentStatus("ready")
        if status is not None or extracted_text is not None:
            db.add(db_document)
            db.commit()
            db.refresh(db_document)
            return DocumentPublic.model_validate(db_document)

    return document


def create_random_documents(db: Session) -> list[DocumentPublic]:
    user = create_random_user(db)
    return [create_random_document(db, user) for _ in range(3)]

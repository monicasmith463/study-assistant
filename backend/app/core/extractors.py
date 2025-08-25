from sqlmodel import Session, select

from app.core.db import engine
from app.models import Document, DocumentChunk
from app.s3 import extract_text_from_s3_file


def save_chunks_to_db(session: Session, document_id: str, chunks: list[str]) -> None:
    """
    Saves the text chunks to the database.
    """
    for chunk in chunks:
        document_chunk = DocumentChunk(document_id=document_id, text=chunk)
        session.add(document_chunk)
    session.commit()


def chunk_text(text: str, chunk_size: int = 1000) -> list[str]:
    """Splits text into chunks respecting word boundaries."""
    words = text.split()
    chunks = []
    current_chunk = []
    current_size = 0
    
    for word in words:
        word_size = len(word) + 1  # +1 for space
        if current_size + word_size <= chunk_size:
            current_chunk.append(word)
            current_size += word_size
        else:
            if current_chunk:
                chunks.append(' '.join(current_chunk))
            current_chunk = [word]
            current_size = word_size
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks


def extract_text_and_save_to_db(s3_key: str, document_id: str) -> None:
    try:
        with Session(engine) as session:
            text = extract_text_from_s3_file(key=s3_key)

            chunks = chunk_text(text)

            document_query = select(Document).where(Document.id == document_id)
            document = session.exec(document_query).first()

            if not document:
                raise Exception(f"Document with ID {document_id} not found")

            save_chunks_to_db(session, document_id, chunks)

            document.extracted_text = text
            session.add(document)
            session.commit()

    except Exception as e:
        print(f"Failed to extract and chunk text for document {document_id}: {e}")

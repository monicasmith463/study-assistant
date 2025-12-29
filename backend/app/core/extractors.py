from langchain_text_splitters import CharacterTextSplitter
from sqlmodel import Session

from app.core.ai.embeddings import get_embeddings_model
from app.core.db import engine
from app.core.s3 import extract_text_from_s3_file
from app.models import Document, DocumentChunk, DocumentStatus

embeddings_model = get_embeddings_model()


def save_chunks_to_db(session: Session, document_id: str, chunks: list[str]) -> None:
    """
    Saves the text chunks to the database.
    """
    embeddings = embed_chunks(chunks)

    for chunk, embedding in zip(chunks, embeddings, strict=False):
        session.add(
            DocumentChunk(
                document_id=document_id,
                text=chunk,
                size=len(chunk),
                embedding=embedding,
            )
        )


def perform_fixed_size_chunking(
    text: str, chunk_size: int = 1000, chunk_overlap: int = 200
) -> list[str]:
    """
    Performs fixed-size chunking on a document with specified overlap.

    Args:
        document (str): The text document to process
        chunk_size (int): The target size of each chunk in characters
        chunk_overlap (int): The number of characters of overlap between chunks

    Returns:
        list: The chunked documents with metadata
    """
    # Create the text splitter with optimal parameters
    text_splitter = CharacterTextSplitter(
        separator="\n\n",
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
    )

    # Split the text into chunks
    chunks = text_splitter.split_text(text)
    return chunks


def embed_chunks(chunks: list[str]) -> list[list[float]]:
    return embeddings_model.embed_documents(chunks)


def extract_text_and_save_to_db(s3_key: str, document_id: str) -> None:
    with Session(engine) as session:
        document = session.get(Document, document_id)
        if not document:
            raise Exception("Document not found")

        try:
            # Extract text and process (document already has PROCESSING status by default)
            text = extract_text_from_s3_file(key=s3_key)
            chunks = perform_fixed_size_chunking(text)

            save_chunks_to_db(session, document_id, chunks)

            document.extracted_text = text
            document.chunk_count = len(chunks)
            document.status = DocumentStatus.READY

            session.add(document)
            session.commit()

        except Exception as e:
            document.status = DocumentStatus.FAILED
            document.processing_error = str(e)
            session.add(document)
            session.commit()
            raise

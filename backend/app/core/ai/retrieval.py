from sqlmodel import Session, select

from app.models import DocumentChunk

TOP_K = 4


def retrieve_top_k_chunks(
    *,
    session: Session,
    document_ids: list,
    query_embedding: list[float],
    k: int = TOP_K,
) -> list[str]:
    stmt = (
        select(DocumentChunk)
        .where(DocumentChunk.document_id.in_(document_ids))
        .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
        .limit(k)
    )

    chunks = session.exec(stmt).all()
    return [c.text for c in chunks]

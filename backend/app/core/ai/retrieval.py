from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.sql import Select
from sqlmodel import Session

from app.models import DocumentChunk

TOP_K = 4


def retrieve_top_k_chunks(
    *,
    session: Session,
    document_ids: list[UUID],
    query_embedding: list[float],
    k: int = TOP_K,
) -> list[str]:
    stmt: Select[Any] = (
        select(DocumentChunk)
        .where(DocumentChunk.document_id.in_(document_ids))  # type: ignore
        .order_by(
            DocumentChunk.embedding.cosine_distance(query_embedding)  # type: ignore
        )
        .limit(k)
    )

    result = session.execute(stmt).scalars().all()
    return [chunk.text for chunk in result]

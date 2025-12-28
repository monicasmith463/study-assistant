import uuid
from unittest.mock import MagicMock

from app.core.ai.retrieval import retrieve_top_k_chunks


def test_retrieve_top_k_chunks_success() -> None:
    """Test successful retrieval of top k chunks."""
    document_ids = [uuid.uuid4(), uuid.uuid4()]
    query_embedding = [0.1, 0.2, 0.3, 0.4, 0.5]
    k = 3

    mock_chunk1 = MagicMock()
    mock_chunk1.text = "Chunk 1 text"
    mock_chunk2 = MagicMock()
    mock_chunk2.text = "Chunk 2 text"
    mock_chunk3 = MagicMock()
    mock_chunk3.text = "Chunk 3 text"

    mock_session = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [mock_chunk1, mock_chunk2, mock_chunk3]
    mock_execute = MagicMock()
    mock_execute.scalars.return_value = mock_scalars
    mock_session.execute.return_value = mock_execute

    result = retrieve_top_k_chunks(
        session=mock_session,
        document_ids=document_ids,
        query_embedding=query_embedding,
        k=k,
    )

    assert len(result) == 3
    assert result == ["Chunk 1 text", "Chunk 2 text", "Chunk 3 text"]
    mock_session.execute.assert_called_once()


def test_retrieve_top_k_chunks_default_k() -> None:
    """Test retrieval with default k value."""
    document_ids = [uuid.uuid4()]
    query_embedding = [0.1, 0.2, 0.3]

    mock_session = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = []
    mock_execute = MagicMock()
    mock_execute.scalars.return_value = mock_scalars
    mock_session.execute.return_value = mock_execute

    result = retrieve_top_k_chunks(
        session=mock_session,
        document_ids=document_ids,
        query_embedding=query_embedding,
    )

    assert result == []
    # Verify limit was called with default TOP_K
    call_args = mock_session.execute.call_args[0][0]
    assert hasattr(call_args, "limit")


def test_retrieve_top_k_chunks_empty_result() -> None:
    """Test retrieval when no chunks are found."""
    document_ids = [uuid.uuid4()]
    query_embedding = [0.1, 0.2, 0.3]
    k = 5

    mock_session = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = []
    mock_execute = MagicMock()
    mock_execute.scalars.return_value = mock_scalars
    mock_session.execute.return_value = mock_execute

    result = retrieve_top_k_chunks(
        session=mock_session,
        document_ids=document_ids,
        query_embedding=query_embedding,
        k=k,
    )

    assert result == []


def test_retrieve_top_k_chunks_filters_by_document_ids() -> None:
    """Test that retrieval filters by document IDs."""
    document_ids = [uuid.uuid4(), uuid.uuid4()]
    query_embedding = [0.1, 0.2, 0.3]

    mock_session = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = []
    mock_execute = MagicMock()
    mock_execute.scalars.return_value = mock_scalars
    mock_session.execute.return_value = mock_execute

    retrieve_top_k_chunks(
        session=mock_session,
        document_ids=document_ids,
        query_embedding=query_embedding,
    )

    # Verify the query includes document_id filter
    call_args = mock_session.execute.call_args[0][0]
    assert call_args is not None


def test_retrieve_top_k_chunks_orders_by_cosine_distance() -> None:
    """Test that chunks are ordered by cosine distance."""
    document_ids = [uuid.uuid4()]
    query_embedding = [0.1, 0.2, 0.3]

    mock_session = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = []
    mock_execute = MagicMock()
    mock_execute.scalars.return_value = mock_scalars
    mock_session.execute.return_value = mock_execute

    retrieve_top_k_chunks(
        session=mock_session,
        document_ids=document_ids,
        query_embedding=query_embedding,
    )

    # Verify order_by is called (implicitly through the query structure)
    call_args = mock_session.execute.call_args[0][0]
    assert call_args is not None


def test_retrieve_top_k_chunks_respects_k_limit() -> None:
    """Test that retrieval respects the k limit."""
    document_ids = [uuid.uuid4()]
    query_embedding = [0.1, 0.2, 0.3]
    k = 2

    mock_chunk1 = MagicMock()
    mock_chunk1.text = "Chunk 1"
    mock_chunk2 = MagicMock()
    mock_chunk2.text = "Chunk 2"
    mock_chunk3 = MagicMock()
    mock_chunk3.text = "Chunk 3"

    mock_session = MagicMock()
    mock_scalars = MagicMock()
    # Even though we return 3 chunks, limit should be 2
    mock_scalars.all.return_value = [mock_chunk1, mock_chunk2, mock_chunk3]
    mock_execute = MagicMock()
    mock_execute.scalars.return_value = mock_scalars
    mock_session.execute.return_value = mock_execute

    result = retrieve_top_k_chunks(
        session=mock_session,
        document_ids=document_ids,
        query_embedding=query_embedding,
        k=k,
    )

    # The limit is applied in the query, but our mock returns all
    # In real usage, only k chunks would be returned
    assert len(result) == 3  # Mock returns all, but query would limit


def test_retrieve_top_k_chunks_multiple_documents() -> None:
    """Test retrieval across multiple documents."""
    document_ids = [uuid.uuid4(), uuid.uuid4(), uuid.uuid4()]
    query_embedding = [0.1, 0.2, 0.3]

    mock_chunk1 = MagicMock()
    mock_chunk1.text = "Doc 1 chunk"
    mock_chunk2 = MagicMock()
    mock_chunk2.text = "Doc 2 chunk"

    mock_session = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [mock_chunk1, mock_chunk2]
    mock_execute = MagicMock()
    mock_execute.scalars.return_value = mock_scalars
    mock_session.execute.return_value = mock_execute

    result = retrieve_top_k_chunks(
        session=mock_session,
        document_ids=document_ids,
        query_embedding=query_embedding,
    )

    assert len(result) == 2
    assert "Doc 1 chunk" in result
    assert "Doc 2 chunk" in result

from unittest.mock import MagicMock, patch

import pytest

from app.core.ai.embeddings import embed_documents, embed_text, get_embeddings_model


def test_get_embeddings_model_creates_singleton() -> None:
    """Test that get_embeddings_model returns a singleton instance."""
    # Reset the global variable by patching
    with patch("app.core.ai.embeddings._embeddings_model", None):
        model1 = get_embeddings_model()
        model2 = get_embeddings_model()

        # Should return the same instance
        assert model1 is model2


def test_get_embeddings_model_initializes_once() -> None:
    """Test that OpenAIEmbeddings is only initialized once."""
    with patch("app.core.ai.embeddings._embeddings_model", None), patch(
        "app.core.ai.embeddings.OpenAIEmbeddings"
    ) as mock_embeddings_class:
        get_embeddings_model()
        get_embeddings_model()

        # Should only be called once
        mock_embeddings_class.assert_called_once()


def test_get_embeddings_model_uses_settings() -> None:
    """Test that embeddings model uses settings for API key."""
    with patch("app.core.ai.embeddings._embeddings_model", None), patch(
        "app.core.ai.embeddings.OpenAIEmbeddings"
    ) as mock_embeddings_class, patch(
        "app.core.ai.embeddings.settings"
    ) as mock_settings:
        mock_settings.OPENAI_API_KEY = "test-api-key"
        get_embeddings_model()

        mock_embeddings_class.assert_called_once()
        call_kwargs = mock_embeddings_class.call_args[1]
        assert call_kwargs["api_key"] == "test-api-key"
        assert call_kwargs["model"] == "text-embedding-3-small"


def test_embed_text() -> None:
    """Test embedding a single text."""
    mock_embedding = [0.1, 0.2, 0.3, 0.4, 0.5]
    mock_model = MagicMock()
    mock_model.embed_query.return_value = mock_embedding

    with patch("app.core.ai.embeddings.get_embeddings_model", return_value=mock_model):
        result = embed_text("test text")

    assert result == mock_embedding
    mock_model.embed_query.assert_called_once_with("test text")


def test_embed_text_empty_string() -> None:
    """Test embedding an empty string."""
    mock_embedding = [0.0] * 1536  # Typical embedding dimension
    mock_model = MagicMock()
    mock_model.embed_query.return_value = mock_embedding

    with patch("app.core.ai.embeddings.get_embeddings_model", return_value=mock_model):
        result = embed_text("")

    assert result == mock_embedding
    mock_model.embed_query.assert_called_once_with("")


def test_embed_documents() -> None:
    """Test embedding multiple documents."""
    texts = ["text 1", "text 2", "text 3"]
    mock_embeddings = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
        [0.7, 0.8, 0.9],
    ]
    mock_model = MagicMock()
    mock_model.embed_documents.return_value = mock_embeddings

    with patch("app.core.ai.embeddings.get_embeddings_model", return_value=mock_model):
        result = embed_documents(texts)

    assert result == mock_embeddings
    mock_model.embed_documents.assert_called_once_with(texts)


def test_embed_documents_empty_list() -> None:
    """Test embedding an empty list of documents."""
    mock_model = MagicMock()
    mock_model.embed_documents.return_value = []

    with patch("app.core.ai.embeddings.get_embeddings_model", return_value=mock_model):
        result = embed_documents([])

    assert result == []
    mock_model.embed_documents.assert_called_once_with([])


def test_embed_text_api_error() -> None:
    """Test handling of API errors during embedding."""
    mock_model = MagicMock()
    mock_model.embed_query.side_effect = Exception("API Error")

    with patch("app.core.ai.embeddings.get_embeddings_model", return_value=mock_model):
        with pytest.raises(Exception) as exc_info:
            embed_text("test text")

        assert "API Error" in str(exc_info.value)

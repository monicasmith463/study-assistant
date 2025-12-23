from langchain_openai import OpenAIEmbeddings

from app.core.config import settings

_embeddings_model: OpenAIEmbeddings | None = None


def get_embeddings_model() -> OpenAIEmbeddings:
    global _embeddings_model
    if _embeddings_model is None:
        _embeddings_model = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=settings.OPENAI_API_KEY,  # type: ignore
        )
    return _embeddings_model


def embed_text(text: str) -> list[float]:
    model = get_embeddings_model()
    return model.embed_query(text)


def embed_documents(texts: list[str]) -> list[list[float]]:
    model = get_embeddings_model()
    return model.embed_documents(texts)

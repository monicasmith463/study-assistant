from langchain_openai import OpenAIEmbeddings

embeddings_model = OpenAIEmbeddings(model="text-embedding-3-small")


def embed_text(text: str) -> list[float]:
    # returns list[float]
    return embeddings_model.embed_query(text)

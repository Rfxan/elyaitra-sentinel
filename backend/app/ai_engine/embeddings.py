from langchain_community.embeddings import HuggingFaceEmbeddings

def get_embeddings():
    """
    Centralized embedding provider using HuggingFace (Native Python).
    Runs in memory without an external server.
    Shared across ingestion and retrieval.
    """
    print("🔥 Using Native Python embeddings (SentenceTransformers)")
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

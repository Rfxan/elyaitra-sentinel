import os
import chromadb
from chromadb.config import Settings

# --------------------------------------------------
# Base default path (LOCAL fallback)
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CHROMA_PATH = os.path.join(BASE_DIR, "storage")

# --------------------------------------------------
# Final path (Railway override)
# --------------------------------------------------
CHROMA_PATH = os.getenv("CHROMA_PATH", DEFAULT_CHROMA_PATH)

# Ensure directory exists
print(f"📂 CHROMA_PATH IN USE: {CHROMA_PATH}")
os.makedirs(CHROMA_PATH, exist_ok=True)

_client = None

def _create_client():
    """
    Create a persistent Chroma client.
    Supports both modern and legacy ChromaDB versions.
    """
    # New API (ChromaDB >= 0.4.15)
    if hasattr(chromadb, "PersistentClient"):
        return chromadb.PersistentClient(path=CHROMA_PATH)

    # Legacy API (older ChromaDB)
    return chromadb.Client(
        Settings(
            persist_directory=CHROMA_PATH,
            anonymized_telemetry=False,
        )
    )


def get_client():
    global _client
    if _client is None:
        _client = _create_client()
    return _client


def get_collection(name: str):
    """
    Get or create a Chroma collection.
    Collection name MUST match subject folder name.
    """
    return get_client().get_or_create_collection(name=name)

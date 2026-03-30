import os
from dotenv import load_dotenv

load_dotenv()

# Provider selection
# Options: 'gemini' | 'ollama'
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini").lower()

# Model Names
GEMINI_DEFAULT_MODEL = "models/gemini-2.5-flash"
GEMINI_EMBEDDING_MODEL = "models/gemini-embedding-001"

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_DEFAULT_MODEL = "llama3.1:8b"
OLLAMA_EMBEDDING_MODEL = "nomic-embed-text:latest"

# safety fallback
FALLBACK_TO_GEMINI = os.getenv("FALLBACK_TO_GEMINI", "true").lower() == "true"

# Hybrid Retrieval Settings
HYBRID_RETRIEVAL = True
RRF_K = 60
INITIAL_RETRIEVAL_K = 20
FINAL_RETRIEVAL_K = 5
RERANKER_ENABLED = False
QUERY_EXPANSION_ENABLED = False

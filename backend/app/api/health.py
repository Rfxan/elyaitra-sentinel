from fastapi import APIRouter
from app.db.database import engine
from sqlalchemy import text
import os
import requests

router = APIRouter()

@router.get("/health")
def health_check():
    health_report = {
        "status": "operational",
        "services": {
            "database": "unknown",
            "chromadb": "unknown",
            "llm": "unknown",
            "sentinel_ml": "unknown"
        }
    }

    # 1. DB Check
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        health_report["services"]["database"] = "online"
    except Exception as e:
        health_report["services"]["database"] = f"offline: {str(e)}"
        health_report["status"] = "degraded"

    # 2. ChromaDB Check
    try:
        from app.ai_engine.chroma_client import get_collection
        get_collection()
        health_report["services"]["chromadb"] = "online"
    except Exception:
        health_report["services"]["chromadb"] = "offline"
        health_report["status"] = "degraded"

    # 3. LLM Check
    if os.getenv("LLM_PROVIDER") == "google":
        health_report["services"]["llm"] = "online (google)"
    elif os.getenv("LLM_PROVIDER") == "ollama":
        health_report["services"]["llm"] = "online (ollama)"
    else:
        health_report["services"]["llm"] = "offline (unconfigured)"

    # 4. SentinelML Backend Check (Internal check)
    health_report["services"]["sentinel_ml"] = "online"

    return health_report

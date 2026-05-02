from fastapi import APIRouter, HTTPException, Security, Depends
from fastapi.security import APIKeyHeader
import os
from app.ai_engine.ingest import ingest

API_KEY_NAME = "X-Admin-Token"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_admin_key(api_key_header: str = Security(api_key_header)):
    if not api_key_header:
        raise HTTPException(status_code=403, detail="Admin token missing")
    if api_key_header != os.getenv("ADMIN_TOKEN", "sentinel_admin_2026"):
        raise HTTPException(status_code=403, detail="Invalid admin token")
    return api_key_header

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/ingest")
def run_ingest(admin_key: str = Depends(get_admin_key)):
    try:
        ingest()
        return {"status": "ok", "message": "Ingestion completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

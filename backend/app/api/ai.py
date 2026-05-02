# backend/app/api/ai.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

from app.ai_engine.tutor_engine import TutorEngine
from app.security.logger import get_honeypot_response
from fastapi import Request
from app.utils.limiter import limiter

router = APIRouter(prefix="/ai", tags=["AI"])

tutor_engine = TutorEngine()

# --------------------------------------------------
# REQUEST / RESPONSE SCHEMAS
# --------------------------------------------------

class TutorRequest(BaseModel):
    user_id: int = Field(..., example=1)
    subject: str = Field(..., example="chemistry")
    unit: str = Field(..., example="2")
    topic: str = Field(..., example="electrolysis")
    mode: str = Field(..., example="chat")  # chat | flowchart | flashcard | quiz
    message: str = Field("", example="Explain Faraday’s first law")


class TutorResponse(BaseModel):
    answer: str
    events: List[str]


# --------------------------------------------------
# MAIN TUTOR ENDPOINT
# --------------------------------------------------

@router.post("/tutor", response_model=TutorResponse)
@limiter.limit("5/minute")
def tutor_endpoint(payload: TutorRequest, request: Request):
    try:
        ip = request.client.host if request.client else "unknown"
        
        # 🛡️ SENTINEL BLOCK CHECK (Handled globally in middleware)

        print(
            f"🧠 TUTOR | user={payload.user_id} | "
            f"{payload.subject}-{payload.unit} | "
            f"topic={payload.topic} | mode={payload.mode}"
        )

        result = tutor_engine.respond(
            user_id=payload.user_id,
            subject=payload.subject,
            unit=payload.unit,
            topic=payload.topic,
            mode=payload.mode,
            message=payload.message
        )

        return TutorResponse(
            answer=result["answer"],
            events=result["events"]
        )

    except ValueError as ve:
        # Invalid mode, etc.
        raise HTTPException(status_code=400, detail=str(ve))

    except Exception as e:
        print("❌ TUTOR ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Tutor engine failed to respond."
        )
# --------------------------------------------------
# TEMP ADMIN INGEST ENDPOINT (REMOVE AFTER USE)
# --------------------------------------------------
from app.ai_engine.ingest import ingest

@router.post("/admin/ingest")
def admin_ingest():
    try:
        ingest()
        return {"status": "ok", "message": "Ingest completed"}
    except Exception as e:
        return {"status": "error", "error": str(e)}

# backend/app/api/ai.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional

from app.ai_engine.tutor_engine import TutorEngine
from app.security.logger import get_honeypot_response
from fastapi import Request
from app.utils.limiter import limiter
from app.db.database import get_db
from sqlalchemy.orm import Session
from app.models.room import Room
from app.models.user_request import UserRequest

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
    room_code: Optional[str] = Field(None, example="room_123456")


class TutorResponse(BaseModel):
    answer: str
    events: List[str]


# --------------------------------------------------
# MAIN TUTOR ENDPOINT
# --------------------------------------------------

@router.post("/tutor", response_model=TutorResponse)
@limiter.limit("5/minute")
def tutor_endpoint(payload: TutorRequest, request: Request, db: Session = Depends(get_db)):
    try:
        ip = request.client.host if request.client else "unknown"
        
        # 🛡️ SENTINEL BLOCK CHECK (Handled globally in middleware)

        print(
            f"🧠 TUTOR | user={payload.user_id} | "
            f"{payload.subject}-{payload.unit} | "
            f"topic={payload.topic} | mode={payload.mode}"
        )

        collection_name = None
        if payload.room_code:
            room = db.query(Room).filter(Room.shared_token == payload.room_code).first()
            if not room:
                raise HTTPException(status_code=404, detail="Room not found")
            collection_name = room.chroma_namespace

        result = tutor_engine.respond(
            user_id=payload.user_id,
            subject=payload.subject,
            unit=payload.unit,
            topic=payload.topic,
            mode=payload.mode,
            message=payload.message,
            collection_name=collection_name
        )
        
        # GAP-3 Step 3: Wire into ai.py
        try:
            session_id = request.headers.get("X-Session-ID")
            if session_id:
                recent_req = db.query(UserRequest).filter(
                    UserRequest.user_id == payload.user_id,
                    UserRequest.query_text == payload.message
                ).order_by(UserRequest.timestamp.desc()).first()
                if recent_req:
                    recent_req.session_id = session_id
                    db.commit()
        except Exception as e:
            print(f"Failed to update session_id on UserRequest: {e}")

        return TutorResponse(
            answer=result["answer"],
            events=result["events"]
        )

    except ValueError as ve:
        # Invalid mode, etc.
        raise HTTPException(status_code=400, detail=str(ve))

    except Exception as e:
        print("❌ TUTOR ERROR:", repr(e))
        if isinstance(e, HTTPException):
            raise e
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

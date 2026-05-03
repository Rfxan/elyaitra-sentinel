from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import uuid
import os
import tempfile
from typing import List, Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.models.room import Room, RoomMessage
from app.ai_engine.chroma_client import get_collection, get_client
from app.ai_engine.ingest import extract_text_from_pdf, splitter
from app.ai_engine.embeddings import get_embeddings

router = APIRouter(prefix="/rooms", tags=["Syllabus Rooms"])

embeddings = get_embeddings()

# ── Pydantic Models (GAP-4) ──

class CreateRoomPayload(BaseModel):
    name: str
    syllabus_id: int
    user_id: int

class JoinRoomPayload(BaseModel):
    token: str

class SendMessagePayload(BaseModel):
    content: str
    user_id: Optional[int] = None

# ── Endpoints ──

@router.post("/create")
def create_room(payload: CreateRoomPayload, db: Session = Depends(get_db)):
    token = f"room_{uuid.uuid4().hex[:6]}"
    chroma_namespace = f"room_{token}"

    new_room = Room(
        name=payload.name,
        syllabus_id=payload.syllabus_id,
        created_by=payload.user_id,
        shared_token=token,
        chroma_namespace=chroma_namespace,
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return new_room

@router.post("/join")
def join_room(payload: JoinRoomPayload, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.shared_token == payload.token).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found with provided token")

    return room

@router.get("/{room_id}/messages")
def get_room_messages(room_id: int, db: Session = Depends(get_db)):
    messages = db.query(RoomMessage).filter(RoomMessage.room_id == room_id).order_by(RoomMessage.timestamp.asc()).all()
    return messages

@router.post("/{room_id}/messages")
def send_room_message(room_id: int, payload: SendMessagePayload, db: Session = Depends(get_db)):
    new_msg = RoomMessage(
        room_id=room_id,
        user_id=payload.user_id,
        role="user" if payload.user_id else "assistant",
        content=payload.content,
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg

@router.get("/list")
def list_rooms(db: Session = Depends(get_db)):
    return db.query(Room).all()

# ── GAP-2 Step 4: Upload syllabus to room namespace ──

@router.post("/{room_code}/upload-syllabus")
def upload_syllabus(room_code: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.shared_token == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    namespace = room.chroma_namespace or f"room_{room_code}"

    # Save uploaded PDF to temp file
    suffix = os.path.splitext(file.filename or "upload.pdf")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = file.file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        text = extract_text_from_pdf(tmp_path)
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the uploaded PDF")

        chunks = splitter.split_text(text)
        collection = get_collection(namespace)

        batch_size = 50
        total_indexed = 0
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            chunk_embeddings = embeddings.embed_documents(batch)
            collection.add(
                documents=batch,
                embeddings=chunk_embeddings,
                metadatas=[{"source": file.filename, "room": room_code} for _ in batch],
                ids=[f"{namespace}_{i + j}" for j in range(len(batch))],
            )
            total_indexed += len(batch)

        return {"status": "success", "chunks_indexed": total_indexed, "namespace": namespace}
    finally:
        os.unlink(tmp_path)

# ── GAP-2 Step 5: Room info with document count ──

@router.get("/{room_code}/info")
def get_room_info(room_code: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.shared_token == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    document_count = 0
    try:
        client = get_client()
        col = client.get_collection(name=room.chroma_namespace or f"room_{room_code}")
        document_count = col.count()
    except Exception:
        pass

    return {
        "name": room.name,
        "room_code": room.shared_token,
        "created_at": room.created_at,
        "chroma_namespace": room.chroma_namespace,
        "document_count": document_count,
    }

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List

from app.db.database import get_db
from app.models.room import Room, RoomMessage

router = APIRouter(prefix="/rooms", tags=["Syllabus Rooms"])

@router.post("/create")
def create_room(payload: dict, db: Session = Depends(get_db)):
    name = payload.get("name")
    syllabus_id = payload.get("syllabus_id")
    user_id = payload.get("user_id")
    
    if not name or not syllabus_id or not user_id:
        raise HTTPException(status_code=400, detail="Missing required fields: name, syllabus_id, user_id")
        
    token = f"room_{uuid.uuid4().hex[:6]}"
    
    new_room = Room(
        name=name,
        syllabus_id=syllabus_id,
        created_by=user_id,
        shared_token=token
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    
    return new_room

@router.post("/join")
def join_room(payload: dict, db: Session = Depends(get_db)):
    token = payload.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token required")
        
    room = db.query(Room).filter(Room.shared_token == token).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found with provided token")
        
    return room

@router.get("/{room_id}/messages")
def get_room_messages(room_id: int, db: Session = Depends(get_db)):
    messages = db.query(RoomMessage).filter(RoomMessage.room_id == room_id).order_by(RoomMessage.timestamp.asc()).all()
    return messages

@router.post("/{room_id}/messages")
def send_room_message(room_id: int, payload: dict, db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    role = payload.get("role", "user")
    content = payload.get("content")
    
    if not content:
        raise HTTPException(status_code=400, detail="Content cannot be empty")
        
    new_msg = RoomMessage(
        room_id=room_id,
        user_id=user_id,
        role=role,
        content=content
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg

@router.get("/list")
def list_rooms(db: Session = Depends(get_db)):
    return db.query(Room).all()

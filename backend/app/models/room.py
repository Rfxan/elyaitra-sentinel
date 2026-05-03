from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from app.db.database import Base
from datetime import datetime

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    syllabus_id = Column(Integer, index=True)
    created_by = Column(Integer, index=True) # user_id
    shared_token = Column(String(50), unique=True, index=True)
    chroma_namespace = Column(String(100), unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class RoomMessage(Base):
    __tablename__ = "room_messages"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), index=True)
    user_id = Column(Integer, index=True, nullable=True) # If null, it's AI
    role = Column(String(20)) # user | assistant
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

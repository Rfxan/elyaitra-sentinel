from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from app.db.database import Base
from datetime import datetime

class UserRequest(Base):
    __tablename__ = "user_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_malicious = Column(Boolean, default=False)
    query_text = Column(Text, nullable=True)
    path = Column(String(200))
    ip = Column(String(50))
    session_id = Column(String(100), nullable=True, index=True)

from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.db.database import Base
from datetime import datetime

class RedTeamSession(Base):
    __tablename__ = "redteam_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, index=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    score = Column(Integer, default=0)
    challenges_completed = Column(JSON, default=[]) # List of challenge IDs
    total_challenges = Column(Integer, default=5)
    status = Column(String(20), default="active") # active | finished

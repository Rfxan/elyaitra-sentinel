from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from app.db.database import Base
from datetime import datetime

class AttackEvent(Base):
    __tablename__ = "attack_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip = Column(String(50))
    attack_type = Column(String(100))
    mitre_technique = Column(String(100))
    raw_query = Column(Text)
    honeypot_served = Column(String(20)) # static | dynamic | None
    response_snippet = Column(Text)
    session_id = Column(String(100), index=True)
    is_demo_seed = Column(Boolean, default=False)

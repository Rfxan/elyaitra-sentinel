from sqlalchemy import Column, Integer, String
from app.db.database import Base

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)

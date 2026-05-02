from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.flashcard import Flashcard
from app.schemas.flashcard import FlashcardOut

router = APIRouter(
    prefix="/flashcards",
    tags=["Flashcards"]
)

@router.get("/", response_model=List[FlashcardOut])
def get_flashcards(
    subject: Optional[str] = None,
    unit: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Flashcard)

    if subject:
        query = query.filter(Flashcard.subject == subject)
    if unit:
        query = query.filter(Flashcard.unit == unit)

    return query.all()

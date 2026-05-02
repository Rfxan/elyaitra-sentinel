from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.payment import Payment
from app.models.flashcard import Flashcard
from app.ai_engine.retriever import retrieve
from app.ai_engine.flashcard_generator import generate_flashcards

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/flashcards")
def get_flashcards(
    subject: str,
    unit: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    # 🔐 STEP 1: Check payment
    paid = (
        db.query(Payment)
        .filter(
            Payment.user_id == user_id,
            Payment.status == "success"
        )
        .first()
    )

    if not paid:
        raise HTTPException(status_code=403, detail="Payment required")

    # 🔁 STEP 2: Check existing flashcards
    existing_flashcards = (
        db.query(Flashcard)
        .filter(
            Flashcard.subject == subject,
            Flashcard.unit == str(unit)
        )
        .all()
    )

    if existing_flashcards:
        return [
            {
                "question": f.question,
                "answer": f.answer
            }
            for f in existing_flashcards
        ]

    # 🧠 STEP 3: Retrieve syllabus chunks
    try:
        docs = retrieve(
            question="important exam concepts",
            subject=subject,
            unit=unit
        )
    except Exception as e:
        print("❌ Retrieval failed:", e)
        return []

    if not docs:
        return []

    # 🧠 STEP 4: Generate flashcards
    try:
        flashcards = generate_flashcards(docs)
    except Exception as e:
        print("❌ Generation failed:", e)
        return []

    if not flashcards:
        return []

    # 💾 STEP 5: Save generated flashcards
    for fc in flashcards:
        if "question" not in fc or "answer" not in fc:
            continue

        record = Flashcard(
            subject=subject,
            unit=str(unit),
            question=fc["question"],
            answer=fc["answer"]
        )

        db.add(record)

    db.commit()

    # ✅ STEP 6: Return generated flashcards
    return flashcards

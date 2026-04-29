from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.payment import Payment

router = APIRouter(prefix="/access", tags=["access"])


@router.get("/subjects")
def check_access(user_id: int, db: Session = Depends(get_db)):
    paid = (
        db.query(Payment)
        .filter(
            Payment.user_id == user_id,
            Payment.status == "success"
        )
        .first()
    )

    return {
        "allowed": True
    }

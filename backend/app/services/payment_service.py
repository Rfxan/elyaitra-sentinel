from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.payment import Payment

class PaymentService:
    @staticmethod
    def create_order(db: Session, user_id: int, amount: int) -> Payment:
        new_payment = Payment(
            user_id=user_id,
            amount=amount,
            status="pending"
        )
        db.add(new_payment)
        db.commit()
        db.refresh(new_payment)
        return new_payment

    @staticmethod
    def verify_payment(db: Session, payment_id: int, success: bool) -> Optional[Payment]:
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if payment:
            payment.status = "completed" if success else "failed"
            db.commit()
            db.refresh(payment)
        return payment

    @staticmethod
    def get_payment_status(db: Session, payment_id: int) -> Optional[str]:
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        return payment.status if payment else None

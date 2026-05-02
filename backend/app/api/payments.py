from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import razorpay
import os
import hmac
import hashlib

from app.db.database import get_db
from app.models.payment import Payment

router = APIRouter(prefix="/payments", tags=["payments"])

# -------------------------
# DEV MODE
# -------------------------
DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"

# -------------------------
# Razorpay client
# -------------------------
client = razorpay.Client(
    auth=(
        os.getenv("RAZORPAY_KEY_ID"),
        os.getenv("RAZORPAY_KEY_SECRET")
    )
)

# -------------------------
# Request schema
# -------------------------
class PaymentRequest(BaseModel):
    user_id: int
    amount: int
    razorpay_payment_id: str | None = None
    razorpay_order_id: str | None = None
    razorpay_signature: str | None = None


# -------------------------
# Create Razorpay Order
# -------------------------
@router.post("/create-order")
def create_order():

    if DEV_MODE:
        return {
            "id": "dev_order",
            "amount": 100,
            "currency": "INR",
            "dev_mode": True
        }

    amount_rupees = 1
    amount_paise = amount_rupees * 100

    order = client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "payment_capture": True
    })

    return order
# def create_order():

#     # DEV MODE → fake order
#     if DEV_MODE:
#         return {
#             "id": "dev_order_123",
#             "amount": 100,
#             "currency": "INR",
#             "status": "created"
#         }

#     amount_rupees = 1
#     amount_paise = amount_rupees * 100

#     order = client.order.create({
#         "amount": amount_paise,
#         "currency": "INR",
#         "payment_capture": True
#     })

#     return order


# -------------------------
# Record Payment
# -------------------------
@router.post("/record")
def record_payment(
    data: PaymentRequest,
    db: Session = Depends(get_db)
):

    # -------------------------
    # DEV MODE → bypass payment
    # -------------------------
    if DEV_MODE:

        already_paid = (
            db.query(Payment)
            .filter(
                Payment.user_id == data.user_id,
                Payment.status == "success"
            )
            .first()
        )

        if already_paid:
            return {"status": "success", "message": "Already paid (DEV MODE)"}

        payment = Payment(
            user_id=data.user_id,
            amount=data.amount,
            status="success"
        )

        db.add(payment)
        db.commit()

        return {
            "status": "success",
            "message": "Payment bypassed in DEV_MODE"
        }

    # -------------------------
    # Production verification
    # -------------------------
    message = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"
    secret = os.getenv("RAZORPAY_KEY_SECRET")

    generated_signature = hmac.new(
        secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

    if generated_signature != data.razorpay_signature:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # -------------------------
    # Check if already paid
    # -------------------------
    already_paid = (
        db.query(Payment)
        .filter(
            Payment.user_id == data.user_id,
            Payment.status == "success"
        )
        .first()
    )

    if already_paid:
        return {"status": "success", "message": "Already paid"}

    payment = Payment(
        user_id=data.user_id,
        amount=data.amount,
        status="success"
    )

    db.add(payment)
    db.commit()

    return {"status": "success"}
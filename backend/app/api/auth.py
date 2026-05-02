from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, constr
from sqlalchemy.orm import Session
import bcrypt
import hashlib
from app.db.database import get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

# -------------------------
# PASSWORD HANDLING
# -------------------------

def hash_password(password: str) -> str:
    # Pre-hash with SHA256 to handle long passwords and maintain consistency
    password_hash = hashlib.sha256(password.encode()).hexdigest().encode()
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_hash, salt).decode()


def verify_password(password: str, hashed_password: str) -> bool:
    password_hash = hashlib.sha256(password.encode()).hexdigest().encode()
    return bcrypt.checkpw(password_hash, hashed_password.encode())


# -------------------------
# REQUEST SCHEMAS
# -------------------------
class SignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: constr(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# -------------------------
# SIGNUP (CREATE ACCOUNT)
# -------------------------
@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    # 1️⃣ Check if email already exists
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # 2️⃣ Create new user
    user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
    )

    # 3️⃣ Save to database
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.id,
        "email": user.email
    }


# -------------------------
# LOGIN
# -------------------------
@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # 1️⃣ Find user by email
    user = db.query(User).filter(User.email == data.email).first()

    # 2️⃣ Validate credentials
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "user_id": user.id,
        "email": user.email
    }

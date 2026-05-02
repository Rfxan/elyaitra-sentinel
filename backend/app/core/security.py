import bcrypt
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import jwt
from app.core.config import settings

# JWT Configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

def hash_password(password: str) -> str:
    # Pre-hash with SHA256 to handle long passwords and maintain consistency with auth.py
    password_hash = hashlib.sha256(password.encode()).hexdigest().encode()
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_hash, salt).decode()

def verify_password(password: str, hashed_password: str) -> bool:
    password_hash = hashlib.sha256(password.encode()).hexdigest().encode()
    return bcrypt.checkpw(password_hash, hashed_password.encode())

def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

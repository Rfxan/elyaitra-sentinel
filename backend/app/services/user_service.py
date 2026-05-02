from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User

class UserService:
    @staticmethod
    def get_user(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def update_user(db: Session, user_id: int, full_name: Optional[str] = None) -> Optional[User]:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            if full_name:
                user.full_name = full_name
            db.commit()
            db.refresh(user)
        return user

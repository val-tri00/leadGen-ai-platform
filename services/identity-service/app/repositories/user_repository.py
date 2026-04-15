from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        email: str,
        password_hash: str,
        full_name: str,
        role: str,
        is_active: bool = True,
    ) -> User:
        user = User(
            email=email.lower(),
            password_hash=password_hash,
            full_name=full_name,
            role=role,
            is_active=is_active,
        )
        self.db.add(user)
        return user

    def get_by_email(self, email: str) -> User | None:
        statement = select(User).where(User.email == email.lower())
        return self.db.scalar(statement)

    def get_by_id(self, user_id: str | UUID) -> User | None:
        statement = select(User).where(User.id == user_id)
        return self.db.scalar(statement)


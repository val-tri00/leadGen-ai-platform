from dataclasses import dataclass
from typing import Annotated
from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal


@dataclass(frozen=True)
class UserContext:
    id: UUID
    email: str | None
    role: str
    is_mock: bool = False


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user_context(
    x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
    x_user_email: Annotated[str | None, Header(alias="X-User-Email")] = None,
    x_user_role: Annotated[str | None, Header(alias="X-User-Role")] = None,
) -> UserContext:
    if x_user_id:
        try:
            user_id = UUID(x_user_id)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-User-Id must be a valid UUID",
            ) from exc

        return UserContext(
            id=user_id,
            email=x_user_email,
            role=x_user_role or "user",
        )

    if settings.allow_mock_user:
        return UserContext(
            id=settings.mock_user_id,
            email=settings.mock_user_email,
            role=settings.mock_user_role,
            is_mock=True,
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="User context headers are required",
    )

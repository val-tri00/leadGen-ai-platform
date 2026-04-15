from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.core.config import settings
from app.models.user import User

password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except (InvalidHashError, VerificationError, VerifyMismatchError):
        return False


def create_access_token(user: User) -> str:
    now = datetime.now(UTC)
    expires_at = now + timedelta(minutes=settings.jwt_access_expires_minutes)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.jwt_access_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(user: User) -> tuple[str, str, datetime]:
    now = datetime.now(UTC)
    expires_at = now + timedelta(days=settings.jwt_refresh_expires_days)
    token_jti = str(uuid4())
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "type": "refresh",
        "jti": token_jti,
        "iat": int(now.timestamp()),
        "exp": expires_at,
    }
    token = jwt.encode(payload, settings.jwt_refresh_secret, algorithm=settings.jwt_algorithm)
    return token, token_jti, expires_at


def decode_token(token: str, *, refresh: bool = False) -> dict[str, Any]:
    secret = settings.jwt_refresh_secret if refresh else settings.jwt_access_secret
    return jwt.decode(token, secret, algorithms=[settings.jwt_algorithm])

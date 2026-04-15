from uuid import UUID

from fastapi import HTTPException, status
from jwt import InvalidTokenError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import USER_ROLE, User
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.users = UserRepository(db)
        self.refresh_tokens = RefreshTokenRepository(db)

    def register(self, payload: RegisterRequest) -> TokenResponse:
        if self.users.get_by_email(payload.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            )

        user = self.users.create(
            email=payload.email,
            password_hash=hash_password(payload.password),
            full_name=payload.full_name,
            role=USER_ROLE,
        )

        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            ) from exc

        self.db.refresh(user)
        return self._issue_tokens(user)

    def login(self, payload: LoginRequest) -> TokenResponse:
        user = self.users.get_by_email(payload.email)
        if user is None or not user.is_active or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        return self._issue_tokens(user)

    def refresh(self, refresh_token: str) -> TokenResponse:
        payload = self._decode_refresh_token(refresh_token)
        token_jti = payload.get("jti")
        user_id = payload.get("sub")

        if not token_jti or not user_id:
            raise self._invalid_refresh_token()

        persisted_token = self.refresh_tokens.get_active_by_jti(token_jti)
        if persisted_token is None:
            raise self._invalid_refresh_token()

        try:
            parsed_user_id = UUID(user_id)
        except ValueError as exc:
            raise self._invalid_refresh_token() from exc

        user = self.users.get_by_id(parsed_user_id)
        if user is None or not user.is_active:
            raise self._invalid_refresh_token()

        return self._issue_tokens(user, include_refresh_token=refresh_token)

    def logout(self, refresh_token: str) -> None:
        payload = self._decode_refresh_token(refresh_token)
        token_jti = payload.get("jti")
        if not token_jti:
            raise self._invalid_refresh_token()

        persisted_token = self.refresh_tokens.get_active_by_jti(token_jti)
        if persisted_token is None:
            return

        self.refresh_tokens.revoke(persisted_token)
        self.db.commit()

    def _issue_tokens(self, user: User, *, include_refresh_token: str | None = None) -> TokenResponse:
        access_token = create_access_token(user)

        if include_refresh_token is None:
            refresh_token, token_jti, expires_at = create_refresh_token(user)
            self.refresh_tokens.create(
                user_id=user.id,
                token_jti=token_jti,
                expires_at=expires_at,
            )
            self.db.commit()
        else:
            refresh_token = include_refresh_token

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user,
        )

    def _decode_refresh_token(self, refresh_token: str) -> dict:
        try:
            payload = decode_token(refresh_token, refresh=True)
        except InvalidTokenError as exc:
            raise self._invalid_refresh_token() from exc

        if payload.get("type") != "refresh":
            raise self._invalid_refresh_token()

        return payload

    @staticmethod
    def _invalid_refresh_token() -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

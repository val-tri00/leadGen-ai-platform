from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken


class RefreshTokenRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, *, user_id: UUID, token_jti: str, expires_at: datetime) -> RefreshToken:
        refresh_token = RefreshToken(
            user_id=user_id,
            token_jti=token_jti,
            expires_at=expires_at,
        )
        self.db.add(refresh_token)
        return refresh_token

    def get_active_by_jti(self, token_jti: str) -> RefreshToken | None:
        statement = select(RefreshToken).where(
            RefreshToken.token_jti == token_jti,
            RefreshToken.is_revoked.is_(False),
            RefreshToken.expires_at > datetime.now(UTC),
        )
        return self.db.scalar(statement)

    def revoke(self, refresh_token: RefreshToken) -> None:
        refresh_token.is_revoked = True
        self.db.add(refresh_token)


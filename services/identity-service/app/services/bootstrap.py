from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import ADMIN_ROLE
from app.repositories.user_repository import UserRepository


def bootstrap_admin_user(db: Session) -> None:
    if not settings.bootstrap_admin_email or not settings.bootstrap_admin_password:
        return

    users = UserRepository(db)
    existing_user = users.get_by_email(settings.bootstrap_admin_email)
    if existing_user is not None:
        return

    users.create(
        email=settings.bootstrap_admin_email,
        password_hash=hash_password(settings.bootstrap_admin_password),
        full_name=settings.bootstrap_admin_name or "Bootstrap Admin",
        role=ADMIN_ROLE,
    )
    db.commit()


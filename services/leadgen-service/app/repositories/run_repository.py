from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.run import Run


class RunRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, run: Run) -> Run:
        self.db.add(run)
        return run

    def get_by_id(self, run_id: UUID) -> Run | None:
        return self.db.get(Run, run_id)

    def list_for_user(self, user_id: UUID, *, limit: int, offset: int) -> list[Run]:
        statement = (
            select(Run)
            .where(Run.user_id == user_id)
            .order_by(Run.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(self.db.scalars(statement))

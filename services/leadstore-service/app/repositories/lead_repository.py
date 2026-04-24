from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.lead import Lead


class LeadRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_many(self, leads: list[Lead]) -> list[Lead]:
        self.db.add_all(leads)
        self.db.flush()
        return leads

    def get_by_id(self, lead_id: UUID) -> Lead | None:
        return self.db.get(Lead, lead_id)

    def list_leads(
        self,
        *,
        user_id: UUID | None,
        run_id: UUID | None,
        limit: int,
        offset: int,
    ) -> list[Lead]:
        stmt = select(Lead)
        if user_id is not None:
            stmt = stmt.where(Lead.user_id == user_id)
        if run_id is not None:
            stmt = stmt.where(Lead.run_id == run_id)

        stmt = stmt.order_by(Lead.created_at.desc()).limit(limit).offset(offset)
        return list(self.db.scalars(stmt).all())

    def list_for_run(self, run_id: UUID, *, user_id: UUID | None) -> list[Lead]:
        stmt = select(Lead).where(Lead.run_id == run_id)
        if user_id is not None:
            stmt = stmt.where(Lead.user_id == user_id)
        stmt = stmt.order_by(Lead.created_at.desc())
        return list(self.db.scalars(stmt).all())

    def existing_dedupe_keys(self, run_id: UUID, dedupe_keys: set[str]) -> set[str]:
        if not dedupe_keys:
            return set()

        stmt = select(Lead.dedupe_key).where(Lead.run_id == run_id, Lead.dedupe_key.in_(dedupe_keys))
        return set(self.db.scalars(stmt).all())

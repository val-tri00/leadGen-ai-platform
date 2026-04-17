from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.run_event import RunEvent


class RunEventRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, event: RunEvent) -> RunEvent:
        self.db.add(event)
        return event

    def list_for_run(self, run_id: UUID) -> list[RunEvent]:
        statement = (
            select(RunEvent)
            .where(RunEvent.run_id == run_id)
            .order_by(RunEvent.created_at.asc())
        )
        return list(self.db.scalars(statement))

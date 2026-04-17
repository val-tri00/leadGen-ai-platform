import logging

from sqlalchemy.orm import Session

from app.models.run import Run
from app.repositories.run_event_repository import RunEventRepository
from app.services.run_events import build_run_event

logger = logging.getLogger(__name__)


class RunQueueService:
    def __init__(self, db: Session) -> None:
        self.events = RunEventRepository(db)

    def enqueue_run_processing(self, run: Run) -> None:
        logger.info("Prepared lead generation run %s for future async processing", run.id)
        self.events.create(
            build_run_event(
                run=run,
                step="enqueue_prepared",
                message="Placeholder enqueue hook executed for future async pipeline processing",
                metadata_json={"placeholder": True},
            )
        )

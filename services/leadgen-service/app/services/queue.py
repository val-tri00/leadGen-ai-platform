import logging
from datetime import UTC, datetime
from uuid import uuid4

from celery import Celery

from app.api.deps import UserContext
from app.core.config import settings
from app.models.run import Run

logger = logging.getLogger(__name__)


class RunQueueService:
    def __init__(self) -> None:
        self.celery_app = Celery(
            "leadgen-service",
            broker=settings.celery_broker_url,
            backend=settings.celery_result_backend,
        )

    def enqueue_run_processing(self, run: Run, user_context: UserContext) -> str:
        payload = self._build_payload(run, user_context)
        result = self.celery_app.send_task(
            settings.pipeline_run_task_name,
            kwargs={"payload": payload},
            queue=settings.pipeline_run_queue,
        )
        logger.info(
            "service=%s run_id=%s status=%s queue=%s task_id=%s message=published_pipeline_task",
            settings.service_name,
            run.id,
            run.status,
            settings.pipeline_run_queue,
            result.id,
        )
        return str(result.id)

    def _build_payload(self, run: Run, user_context: UserContext) -> dict:
        # Queue contract for pipeline.run:
        # run_id/user_id identify the run owner, input summarizes the generation request,
        # and correlation_id ties worker logs/callbacks back to this enqueue attempt.
        return {
            "run_id": str(run.id),
            "user_id": str(run.user_id),
            "user_email": user_context.email,
            "user_role": user_context.role,
            "correlation_id": str(uuid4()),
            "queued_at": datetime.now(UTC).isoformat(),
            "input": {
                "industry": run.industry,
                "offering": run.offering,
                "country": run.country,
                "region": run.region,
                "search_query": run.search_query,
                "requested_leads_count": run.requested_leads_count,
            },
        }

import logging

from pydantic import ValidationError

from app.celery_app import celery_app
from app.contracts.pipeline_run import PipelineRunPayload
from app.core.config import settings
from app.services.pipeline import PipelineOrchestrator, PipelineStepFailure

logger = logging.getLogger(__name__)


@celery_app.task(name=settings.pipeline_run_task_name, bind=True)
def process_run(self, payload: dict) -> dict[str, str]:
    try:
        parsed_payload = PipelineRunPayload.model_validate(payload)
    except ValidationError:
        logger.exception("service=%s task_id=%s message=invalid_pipeline_payload", settings.service_name, self.request.id)
        raise

    orchestrator = PipelineOrchestrator()
    logger.info(
        "service=%s run_id=%s task_id=%s queue=%s message=started_pipeline_run",
        settings.service_name,
        parsed_payload.run_id,
        self.request.id,
        settings.pipeline_run_queue,
    )

    try:
        return orchestrator.process(parsed_payload)
    except PipelineStepFailure as exc:
        logger.exception(
            "service=%s run_id=%s step=%s task_id=%s message=simulated_pipeline_failure",
            settings.service_name,
            parsed_payload.run_id,
            exc.step,
            self.request.id,
        )
        orchestrator.mark_failed(
            parsed_payload,
            step=exc.step,
            message=str(exc),
            error_code="PIPELINE_SIMULATED_FAILURE",
        )
        raise
    except Exception as exc:
        logger.exception(
            "service=%s run_id=%s task_id=%s message=pipeline_run_failed",
            settings.service_name,
            parsed_payload.run_id,
            self.request.id,
        )
        orchestrator.mark_failed(
            parsed_payload,
            step="pipeline",
            message="Pipeline worker failed while processing the run",
            error_code="PIPELINE_WORKER_ERROR",
        )
        raise exc

import logging
import time

from app.clients.leadgen import LeadgenClient
from app.contracts.pipeline_run import PipelineRunPayload
from app.core.config import settings

logger = logging.getLogger(__name__)

PIPELINE_STEPS = (
    "crawling",
    "cleaning",
    "embedding",
    "extracting",
    "storing",
    "verifying",
    "done",
)


class PipelineStepFailure(Exception):
    def __init__(self, step: str, message: str) -> None:
        self.step = step
        super().__init__(message)


class PipelineOrchestrator:
    def __init__(self) -> None:
        self.leadgen = LeadgenClient()

    def process(self, payload: PipelineRunPayload) -> dict[str, str]:
        for step in PIPELINE_STEPS:
            if settings.pipeline_simulate_fail_step == step and step == "done":
                raise PipelineStepFailure(step=step, message=f"Simulated pipeline failure at step: {step}")

            self._report_step(payload, step)

            if settings.pipeline_simulate_fail_step == step:
                raise PipelineStepFailure(step=step, message=f"Simulated pipeline failure at step: {step}")

            if step != "done" and settings.pipeline_step_delay_seconds > 0:
                time.sleep(settings.pipeline_step_delay_seconds)

        return {
            "run_id": str(payload.run_id),
            "status": "done",
            "correlation_id": str(payload.correlation_id),
        }

    def mark_failed(self, payload: PipelineRunPayload, *, step: str, message: str, error_code: str) -> None:
        self.leadgen.update_run_status(
            payload,
            status="failed",
            step=step,
            message=message,
            error_code=error_code,
            metadata_json={"failed_step": step},
        )

    def _report_step(self, payload: PipelineRunPayload, step: str) -> None:
        logger.info(
            "service=%s run_id=%s step=%s status=%s correlation_id=%s message=processing_step",
            settings.service_name,
            payload.run_id,
            step,
            step,
            payload.correlation_id,
        )
        self.leadgen.update_run_status(
            payload,
            status=step,
            step=step,
            message=f"Placeholder pipeline step started: {step}",
            metadata_json={
                "placeholder": True,
                "requested_leads_count": payload.input.requested_leads_count,
            },
        )

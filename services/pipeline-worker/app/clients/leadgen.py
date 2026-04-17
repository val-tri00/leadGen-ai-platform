import logging
from uuid import UUID

import httpx

from app.contracts.pipeline_run import PipelineRunPayload
from app.core.config import settings

logger = logging.getLogger(__name__)


class LeadgenClient:
    def __init__(self) -> None:
        self.base_url = settings.leadgen_service_url.rstrip("/")

    def update_run_status(
        self,
        payload: PipelineRunPayload,
        *,
        status: str,
        step: str,
        message: str,
        error_code: str | None = None,
        metadata_json: dict | None = None,
    ) -> None:
        run_id: UUID = payload.run_id
        url = f"{self.base_url}/runs/{run_id}/status"
        request_payload = {
            "status": status,
            "step": step,
            "message": message,
            "error_code": error_code,
            "metadata_json": {
                "correlation_id": str(payload.correlation_id),
                **(metadata_json or {}),
            },
        }
        headers = {
            "X-User-Id": str(payload.user_id),
            "X-User-Role": payload.user_role,
        }
        if payload.user_email:
            headers["X-User-Email"] = payload.user_email

        logger.info(
            "service=%s run_id=%s step=%s status=%s message=sending_status_callback",
            settings.service_name,
            run_id,
            step,
            status,
        )
        with httpx.Client(timeout=10.0) as client:
            response = client.patch(url, json=request_payload, headers=headers)
            response.raise_for_status()

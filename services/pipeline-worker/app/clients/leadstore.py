import logging

import httpx

from app.contracts.leadstore import LeadBulkIngestPayload
from app.contracts.pipeline_run import PipelineRunPayload
from app.core.config import settings

logger = logging.getLogger(__name__)


class LeadstoreClient:
    def __init__(self) -> None:
        self.base_url = settings.leadstore_service_url.rstrip("/")

    def bulk_store_leads(
        self,
        payload: PipelineRunPayload,
        leads_payload: LeadBulkIngestPayload,
    ) -> dict:
        url = f"{self.base_url}/leads/bulk"
        headers = {
            "X-User-Id": str(payload.user_id),
            "X-User-Role": payload.user_role,
        }
        if payload.user_email:
            headers["X-User-Email"] = payload.user_email

        logger.info(
            "service=%s run_id=%s lead_count=%s message=sending_lead_bulk_ingest",
            settings.service_name,
            payload.run_id,
            len(leads_payload.leads),
        )
        with httpx.Client(timeout=15.0) as client:
            response = client.post(url, json=leads_payload.model_dump(mode="json"), headers=headers)
            response.raise_for_status()
            return response.json()

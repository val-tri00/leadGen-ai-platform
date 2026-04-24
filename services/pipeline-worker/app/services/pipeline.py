import logging
import time
from re import sub

from app.clients.leadgen import LeadgenClient
from app.clients.leadstore import LeadstoreClient
from app.contracts.leadstore import LeadBulkIngestPayload, LeadRecordPayload
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
        self.leadstore = LeadstoreClient()

    def process(self, payload: PipelineRunPayload) -> dict[str, str]:
        extracted_leads: list[LeadRecordPayload] = []

        for step in PIPELINE_STEPS:
            if settings.pipeline_simulate_fail_step == step and step == "done":
                raise PipelineStepFailure(step=step, message=f"Simulated pipeline failure at step: {step}")

            metadata = {
                "placeholder": True,
                "requested_leads_count": payload.input.requested_leads_count,
            }
            message = f"Placeholder pipeline step started: {step}"

            if step == "extracting":
                extracted_leads = self._build_mock_leads(payload)
                metadata["prepared_leads_count"] = len(extracted_leads)
                message = f"Prepared {len(extracted_leads)} mocked lead records for storage"
            elif step == "storing":
                storage_response = self.leadstore.bulk_store_leads(
                    payload,
                    LeadBulkIngestPayload(
                        run_id=payload.run_id,
                        leads=extracted_leads,
                    ),
                )
                metadata.update(
                    {
                        "stored_leads_count": storage_response.get("created_count", 0),
                        "duplicate_leads_count": storage_response.get("duplicate_count", 0),
                        "prepared_leads_count": len(extracted_leads),
                    }
                )
                message = (
                    f"Stored {storage_response.get('created_count', 0)} lead records "
                    f"and skipped {storage_response.get('duplicate_count', 0)} duplicates"
                )

            self._report_step(payload, step, message=message, metadata_json=metadata)

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

    def _report_step(
        self,
        payload: PipelineRunPayload,
        step: str,
        *,
        message: str,
        metadata_json: dict,
    ) -> None:
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
            message=message,
            metadata_json=metadata_json,
        )

    def _build_mock_leads(self, payload: PipelineRunPayload) -> list[LeadRecordPayload]:
        sample_size = min(max(payload.input.requested_leads_count, 0), 3)
        if sample_size == 0:
            return []

        industry = payload.input.industry.strip()
        offering = payload.input.offering.strip()
        country = payload.input.country.strip()
        run_token = str(payload.run_id).split("-")[0]

        templates = (
            ("Northstar", "Avery Sloan", "Head of Growth", 91.0),
            ("SignalForge", "Mila Petrescu", "Revenue Operations Lead", 84.0),
            ("Atlas Harbor", "Daniel Ionescu", "Founder", 77.0),
        )

        records: list[LeadRecordPayload] = []
        for index in range(sample_size):
            company_prefix, contact_name, job_title, alignment_score = templates[index]
            company_name = f"{company_prefix} {industry}"
            company_slug = self._slugify(company_name)

            records.append(
                LeadRecordPayload(
                    company_name=company_name,
                    industry=industry,
                    contact_name=contact_name,
                    job_title=job_title,
                    email=f"{contact_name.split()[0].lower()}@{company_slug}.example.com",
                    phone=f"+1-202-555-01{index + 10}",
                    linkedin_url=f"https://www.linkedin.com/in/{self._slugify(contact_name)}-{run_token[:6]}",
                    alignment_score=alignment_score,
                    canonical_url=f"https://{company_slug}.example.com/{self._slugify(country)}",
                    source_doc_id=f"doc-{run_token}-{index + 1}",
                    source_chunk_ids=[
                        f"chunk-{run_token}-{index + 1}-a",
                        f"chunk-{run_token}-{index + 1}-b",
                    ],
                )
            )

        if sample_size >= 2:
            records[1].job_title = f"{offering} Lead"

        return records

    def _slugify(self, value: str) -> str:
        normalized = sub(r"[^a-z0-9]+", "-", value.strip().lower())
        return normalized.strip("-") or "lead"

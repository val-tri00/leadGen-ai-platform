from uuid import UUID

from pydantic import BaseModel, Field


class LeadRecordPayload(BaseModel):
    company_name: str
    industry: str | None = None
    contact_name: str | None = None
    job_title: str | None = None
    email: str | None = None
    phone: str | None = None
    linkedin_url: str | None = None
    alignment_score: float | None = Field(default=None, ge=0, le=100)
    canonical_url: str | None = None
    source_doc_id: str | None = None
    source_chunk_ids: list[str] | None = None


class LeadBulkIngestPayload(BaseModel):
    run_id: UUID
    leads: list[LeadRecordPayload]

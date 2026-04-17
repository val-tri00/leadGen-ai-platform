from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class GenerationInputSummary(BaseModel):
    industry: str
    offering: str
    country: str
    region: str | None = None
    search_query: str
    requested_leads_count: int = Field(ge=1, le=500)


class PipelineRunPayload(BaseModel):
    """Payload accepted by the pipeline.run queue for the pipeline.process_run task."""

    run_id: UUID
    user_id: UUID
    user_email: str | None = None
    user_role: str = "user"
    correlation_id: UUID
    queued_at: datetime
    input: GenerationInputSummary

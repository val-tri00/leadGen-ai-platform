from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def _clean_required_text(value: str) -> str:
    cleaned = " ".join(value.strip().split())
    if not cleaned:
        raise ValueError("Value cannot be empty")
    return cleaned


def _clean_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = " ".join(value.strip().split())
    return cleaned or None


class LeadBulkItem(BaseModel):
    company_name: str = Field(min_length=2, max_length=240)
    industry: str | None = Field(default=None, max_length=120)
    contact_name: str | None = Field(default=None, max_length=200)
    job_title: str | None = Field(default=None, max_length=200)
    email: str | None = Field(default=None, max_length=320)
    phone: str | None = Field(default=None, max_length=64)
    linkedin_url: str | None = Field(default=None, max_length=1000)
    alignment_score: float | None = Field(default=None, ge=0, le=100)
    canonical_url: str | None = Field(default=None, max_length=1000)
    source_doc_id: str | None = Field(default=None, max_length=120)
    source_chunk_ids: list[str] | None = None

    @field_validator("company_name")
    @classmethod
    def trim_company_name(cls, value: str) -> str:
        return _clean_required_text(value)

    @field_validator(
        "industry",
        "contact_name",
        "job_title",
        "email",
        "phone",
        "linkedin_url",
        "canonical_url",
        "source_doc_id",
    )
    @classmethod
    def trim_optional_text_fields(cls, value: str | None) -> str | None:
        return _clean_optional_text(value)

    @field_validator("source_chunk_ids")
    @classmethod
    def normalize_chunk_ids(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return None

        cleaned = [_clean_optional_text(item) for item in value]
        normalized = [item for item in cleaned if item]
        return normalized or None


class LeadBulkCreateRequest(BaseModel):
    run_id: UUID
    leads: list[LeadBulkItem] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_batch_size(self) -> "LeadBulkCreateRequest":
        if len(self.leads) > 500:
            raise ValueError("Cannot ingest more than 500 leads in one batch")
        return self


class LeadBulkCreateResponse(BaseModel):
    run_id: UUID
    created_count: int
    duplicate_count: int
    lead_ids: list[UUID]


class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    run_id: UUID
    user_id: UUID
    company_name: str
    industry: str | None
    contact_name: str | None
    job_title: str | None
    email: str | None
    phone: str | None
    linkedin_url: str | None
    alignment_score: float | None
    canonical_url: str | None
    source_doc_id: str | None
    source_chunk_ids: list[str] | None
    created_at: datetime
    updated_at: datetime

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.status import RunStatus


def _clean_text(value: str) -> str:
    cleaned = " ".join(value.strip().split())
    if not cleaned:
        raise ValueError("Value cannot be empty")
    return cleaned


class RunCreateRequest(BaseModel):
    industry: str = Field(min_length=2, max_length=120)
    offering: str = Field(min_length=2, max_length=240)
    country: str = Field(min_length=2, max_length=120)
    region: str | None = Field(default=None, max_length=120)
    search_query: str = Field(min_length=3, max_length=1000)
    requested_leads_count: int = Field(default=25, ge=1, le=500)

    @field_validator("industry", "offering", "country", "search_query")
    @classmethod
    def trim_required_text(cls, value: str) -> str:
        return _clean_text(value)

    @field_validator("region")
    @classmethod
    def trim_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = " ".join(value.strip().split())
        return cleaned or None


class RunStatusUpdateRequest(BaseModel):
    status: RunStatus
    step: str | None = Field(default=None, min_length=1, max_length=80)
    message: str | None = Field(default=None, max_length=1000)
    error_code: str | None = Field(default=None, max_length=80)
    metadata_json: dict[str, Any] | None = None

    @field_validator("step", "message", "error_code")
    @classmethod
    def trim_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = " ".join(value.strip().split())
        return cleaned or None


class RunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    industry: str
    offering: str
    country: str
    region: str | None
    search_query: str
    status: RunStatus
    requested_leads_count: int
    credits_reserved: int
    credits_consumed: int
    created_at: datetime
    updated_at: datetime


class RunEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    run_id: UUID
    step: str
    status: RunStatus
    message: str | None
    error_code: str | None
    metadata_json: dict[str, Any] | None
    created_at: datetime

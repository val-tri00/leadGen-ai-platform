from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import UserContext, get_db, get_user_context
from app.schemas.leads import LeadBulkCreateRequest, LeadBulkCreateResponse, LeadResponse
from app.services.lead_service import LeadService

router = APIRouter(tags=["leads"])


@router.post("/leads/bulk", response_model=LeadBulkCreateResponse, status_code=status.HTTP_201_CREATED)
def bulk_create_leads(
    payload: LeadBulkCreateRequest,
    db: Annotated[Session, Depends(get_db)],
    user_context: Annotated[UserContext, Depends(get_user_context)],
) -> LeadBulkCreateResponse:
    return LeadService(db).bulk_ingest(payload, user_context)


@router.get("/leads", response_model=list[LeadResponse])
def list_leads(
    db: Annotated[Session, Depends(get_db)],
    user_context: Annotated[UserContext, Depends(get_user_context)],
    run_id: UUID | None = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[LeadResponse]:
    return LeadService(db).list_leads(user_context, run_id=run_id, limit=limit, offset=offset)


@router.get("/leads/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    user_context: Annotated[UserContext, Depends(get_user_context)],
) -> LeadResponse:
    return LeadService(db).get_lead(lead_id, user_context)


@router.get("/runs/{run_id}/leads", response_model=list[LeadResponse])
def list_run_leads(
    run_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    user_context: Annotated[UserContext, Depends(get_user_context)],
) -> list[LeadResponse]:
    return LeadService(db).list_run_leads(run_id, user_context)

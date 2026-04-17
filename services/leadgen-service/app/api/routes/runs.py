from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import UserContext, get_db, get_user_context
from app.schemas.runs import (
    RunCreateRequest,
    RunEventResponse,
    RunResponse,
    RunStatusUpdateRequest,
)
from app.services.run_service import RunService

router = APIRouter(prefix="/runs", tags=["runs"])


@router.post("", response_model=RunResponse, status_code=status.HTTP_201_CREATED)
def create_run(
    payload: RunCreateRequest,
    db: Annotated[Session, Depends(get_db)],
    user_context: Annotated[UserContext, Depends(get_user_context)],
) -> RunResponse:
    return RunService(db).create_run(payload, user_context)


@router.get("", response_model=list[RunResponse])
def list_runs(
    db: Annotated[Session, Depends(get_db)],
    user_context: Annotated[UserContext, Depends(get_user_context)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[RunResponse]:
    return RunService(db).list_runs(user_context, limit=limit, offset=offset)


@router.get("/{run_id}", response_model=RunResponse)
def get_run(
    run_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    user_context: Annotated[UserContext, Depends(get_user_context)],
) -> RunResponse:
    return RunService(db).get_run(run_id, user_context)


@router.get("/{run_id}/events", response_model=list[RunEventResponse])
def list_run_events(
    run_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    user_context: Annotated[UserContext, Depends(get_user_context)],
) -> list[RunEventResponse]:
    return RunService(db).list_events(run_id, user_context)


@router.patch("/{run_id}/status", response_model=RunResponse)
def update_run_status(
    run_id: UUID,
    payload: RunStatusUpdateRequest,
    db: Annotated[Session, Depends(get_db)],
    user_context: Annotated[UserContext, Depends(get_user_context)],
) -> RunResponse:
    return RunService(db).update_status(run_id, payload, user_context)

from uuid import UUID

from celery.exceptions import CeleryError
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import UserContext
from app.core.status import RunStatus, can_transition
from app.models.run import Run
from app.repositories.run_event_repository import RunEventRepository
from app.repositories.run_repository import RunRepository
from app.schemas.runs import RunCreateRequest, RunStatusUpdateRequest
from app.services.credits import CreditReservationService
from app.services.queue import RunQueueService
from app.services.run_events import build_run_event


class RunService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.runs = RunRepository(db)
        self.events = RunEventRepository(db)
        self.credits = CreditReservationService()
        self.queue = RunQueueService()

    def create_run(self, payload: RunCreateRequest, user_context: UserContext) -> Run:
        credits_reserved = self.credits.reserve_for_requested_leads(payload.requested_leads_count)
        run = self.runs.create(
            Run(
                user_id=user_context.id,
                industry=payload.industry,
                offering=payload.offering,
                country=payload.country,
                region=payload.region,
                search_query=payload.search_query,
                status=RunStatus.CREATED.value,
                requested_leads_count=payload.requested_leads_count,
                credits_reserved=credits_reserved,
                credits_consumed=0,
            )
        )
        self.events.create(
            build_run_event(
                run=run,
                step="created",
                message="Lead generation run created",
                metadata_json={
                    "requested_leads_count": payload.requested_leads_count,
                    "credits_reserved": credits_reserved,
                    "mock_user": user_context.is_mock,
                },
            )
        )

        self._transition(run, RunStatus.QUEUED, step="queue", message="Run accepted for pipeline processing")
        self.db.commit()
        self.db.refresh(run)

        try:
            task_id = self.queue.enqueue_run_processing(run, user_context)
        except CeleryError as exc:
            self._mark_enqueue_failed(run, exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Pipeline worker queue is unavailable",
            ) from exc
        except Exception as exc:
            self._mark_enqueue_failed(run, exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Pipeline worker queue could not accept the run",
            ) from exc

        self.events.create(
            build_run_event(
                run=run,
                step="enqueue_published",
                message="Run published to async pipeline queue",
                metadata_json={"celery_task_id": task_id},
            )
        )
        self.db.commit()
        self.db.refresh(run)
        return run

    def list_runs(self, user_context: UserContext, *, limit: int, offset: int) -> list[Run]:
        return self.runs.list_for_user(user_context.id, limit=limit, offset=offset)

    def get_run(self, run_id: UUID, user_context: UserContext) -> Run:
        run = self._get_accessible_run(run_id, user_context)
        return run

    def list_events(self, run_id: UUID, user_context: UserContext):
        self._get_accessible_run(run_id, user_context)
        return self.events.list_for_run(run_id)

    def update_status(
        self,
        run_id: UUID,
        payload: RunStatusUpdateRequest,
        user_context: UserContext,
    ) -> Run:
        run = self._get_accessible_run(run_id, user_context)
        next_status = payload.status

        self._transition(
            run,
            next_status,
            step=payload.step or next_status.value,
            message=payload.message or f"Run status changed to {next_status.value}",
            error_code=payload.error_code,
            metadata_json=payload.metadata_json,
        )
        self.db.commit()
        self.db.refresh(run)
        return run

    def _transition(
        self,
        run: Run,
        next_status: RunStatus,
        *,
        step: str,
        message: str | None = None,
        error_code: str | None = None,
        metadata_json: dict | None = None,
    ) -> None:
        current_status = RunStatus(run.status)
        if not can_transition(current_status, next_status):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Invalid run status transition: {current_status.value} -> {next_status.value}",
            )

        run.status = next_status.value
        self.events.create(
            build_run_event(
                run=run,
                step=step,
                message=message,
                error_code=error_code,
                metadata_json=metadata_json,
            )
        )

    def _get_accessible_run(self, run_id: UUID, user_context: UserContext) -> Run:
        run = self.runs.get_by_id(run_id)
        if run is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
        if run.user_id != user_context.id and user_context.role != "admin":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
        return run

    def _mark_enqueue_failed(self, run: Run, exc: Exception) -> None:
        self._transition(
            run,
            RunStatus.FAILED,
            step="enqueue_failed",
            message="Failed to publish run to async pipeline queue",
            error_code="PIPELINE_ENQUEUE_FAILED",
            metadata_json={"error": str(exc)},
        )
        self.db.commit()

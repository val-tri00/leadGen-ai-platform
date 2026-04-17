from typing import Any

from app.models.run import Run
from app.models.run_event import RunEvent


def build_run_event(
    *,
    run: Run,
    step: str,
    message: str | None = None,
    error_code: str | None = None,
    metadata_json: dict[str, Any] | None = None,
) -> RunEvent:
    return RunEvent(
        run=run,
        step=step,
        status=run.status,
        message=message,
        error_code=error_code,
        metadata_json=metadata_json,
    )

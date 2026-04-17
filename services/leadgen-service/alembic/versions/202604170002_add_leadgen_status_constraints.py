"""add leadgen status constraints

Revision ID: 202604170002
Revises: 202604170001
Create Date: 2026-04-17 00:05:00.000000
"""

from collections.abc import Sequence

from alembic import op

revision: str = "202604170002"
down_revision: str | None = "202604170001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

RUN_STATUSES = "'created', 'queued', 'crawling', 'cleaning', 'embedding', 'extracting', 'storing', 'verifying', 'done', 'failed'"


def upgrade() -> None:
    op.create_check_constraint(
        "ck_leadgen_runs_status",
        "leadgen_runs",
        f"status in ({RUN_STATUSES})",
    )
    op.create_check_constraint(
        "ck_leadgen_run_events_status",
        "leadgen_run_events",
        f"status in ({RUN_STATUSES})",
    )


def downgrade() -> None:
    op.drop_constraint("ck_leadgen_run_events_status", "leadgen_run_events", type_="check")
    op.drop_constraint("ck_leadgen_runs_status", "leadgen_runs", type_="check")

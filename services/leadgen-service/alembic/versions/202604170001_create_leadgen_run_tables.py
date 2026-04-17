"""create leadgen run tables

Revision ID: 202604170001
Revises:
Create Date: 2026-04-17 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "202604170001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "leadgen_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("industry", sa.String(length=120), nullable=False),
        sa.Column("offering", sa.String(length=240), nullable=False),
        sa.Column("country", sa.String(length=120), nullable=False),
        sa.Column("region", sa.String(length=120), nullable=True),
        sa.Column("search_query", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("requested_leads_count", sa.Integer(), nullable=False),
        sa.Column("credits_reserved", sa.Integer(), nullable=False),
        sa.Column("credits_consumed", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("requested_leads_count between 1 and 500", name="ck_leadgen_runs_requested_count"),
        sa.CheckConstraint("credits_reserved >= 0", name="ck_leadgen_runs_credits_reserved"),
        sa.CheckConstraint("credits_consumed >= 0", name="ck_leadgen_runs_credits_consumed"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_leadgen_runs_status"), "leadgen_runs", ["status"], unique=False)
    op.create_index(op.f("ix_leadgen_runs_user_id"), "leadgen_runs", ["user_id"], unique=False)

    op.create_table(
        "leadgen_run_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("step", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("error_code", sa.String(length=80), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["run_id"], ["leadgen_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_leadgen_run_events_run_id"), "leadgen_run_events", ["run_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_leadgen_run_events_run_id"), table_name="leadgen_run_events")
    op.drop_table("leadgen_run_events")
    op.drop_index(op.f("ix_leadgen_runs_user_id"), table_name="leadgen_runs")
    op.drop_index(op.f("ix_leadgen_runs_status"), table_name="leadgen_runs")
    op.drop_table("leadgen_runs")

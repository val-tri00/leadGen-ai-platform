"""create leadstore leads table

Revision ID: 202604230001
Revises:
Create Date: 2026-04-23 00:01:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "202604230001"
down_revision: str | None = None
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "stored_leads",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("company_name", sa.String(length=240), nullable=False),
        sa.Column("industry", sa.String(length=120), nullable=True),
        sa.Column("contact_name", sa.String(length=200), nullable=True),
        sa.Column("job_title", sa.String(length=200), nullable=True),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("phone", sa.String(length=64), nullable=True),
        sa.Column("linkedin_url", sa.Text(), nullable=True),
        sa.Column("alignment_score", sa.Numeric(5, 2), nullable=True),
        sa.Column("canonical_url", sa.Text(), nullable=True),
        sa.Column("source_doc_id", sa.String(length=120), nullable=True),
        sa.Column("source_chunk_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("dedupe_key", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "alignment_score is null or (alignment_score >= 0 and alignment_score <= 100)",
            name="ck_stored_leads_alignment_score",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("run_id", "dedupe_key", name="uq_stored_leads_run_dedupe_key"),
    )
    op.create_index(op.f("ix_stored_leads_email"), "stored_leads", ["email"], unique=False)
    op.create_index(op.f("ix_stored_leads_run_id"), "stored_leads", ["run_id"], unique=False)
    op.create_index(op.f("ix_stored_leads_user_id"), "stored_leads", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_stored_leads_user_id"), table_name="stored_leads")
    op.drop_index(op.f("ix_stored_leads_run_id"), table_name="stored_leads")
    op.drop_index(op.f("ix_stored_leads_email"), table_name="stored_leads")
    op.drop_table("stored_leads")

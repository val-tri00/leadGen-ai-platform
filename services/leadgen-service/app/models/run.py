from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.status import RunStatus
from app.db.base import Base


class Run(Base):
    __tablename__ = "leadgen_runs"
    __table_args__ = (
        CheckConstraint("requested_leads_count between 1 and 500", name="ck_leadgen_runs_requested_count"),
        CheckConstraint("credits_reserved >= 0", name="ck_leadgen_runs_credits_reserved"),
        CheckConstraint("credits_consumed >= 0", name="ck_leadgen_runs_credits_consumed"),
        CheckConstraint(
            "status in ('created', 'queued', 'crawling', 'cleaning', 'embedding', "
            "'extracting', 'storing', 'verifying', 'done', 'failed')",
            name="ck_leadgen_runs_status",
        ),
    )

    id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), nullable=False, index=True)
    industry: Mapped[str] = mapped_column(String(120), nullable=False)
    offering: Mapped[str] = mapped_column(String(240), nullable=False)
    country: Mapped[str] = mapped_column(String(120), nullable=False)
    region: Mapped[str | None] = mapped_column(String(120), nullable=True)
    search_query: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default=RunStatus.CREATED.value, index=True)
    requested_leads_count: Mapped[int] = mapped_column(Integer, nullable=False)
    credits_reserved: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    credits_consumed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    events = relationship(
        "RunEvent",
        back_populates="run",
        cascade="all, delete-orphan",
    )

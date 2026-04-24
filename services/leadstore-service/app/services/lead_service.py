import hashlib
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import UserContext
from app.models.lead import Lead
from app.repositories.lead_repository import LeadRepository
from app.schemas.leads import LeadBulkCreateRequest, LeadBulkCreateResponse, LeadBulkItem


class LeadService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.leads = LeadRepository(db)

    def bulk_ingest(self, payload: LeadBulkCreateRequest, user_context: UserContext) -> LeadBulkCreateResponse:
        if not payload.leads:
            return LeadBulkCreateResponse(
                run_id=payload.run_id,
                created_count=0,
                duplicate_count=0,
                lead_ids=[],
            )

        dedupe_keys = {self._build_dedupe_key(payload.run_id, item) for item in payload.leads}
        existing_keys = self.leads.existing_dedupe_keys(payload.run_id, dedupe_keys)

        created: list[Lead] = []
        seen_batch_keys: set[str] = set()
        duplicate_count = 0

        for item in payload.leads:
            dedupe_key = self._build_dedupe_key(payload.run_id, item)
            if dedupe_key in existing_keys or dedupe_key in seen_batch_keys:
                duplicate_count += 1
                continue

            seen_batch_keys.add(dedupe_key)
            created.append(
                Lead(
                    run_id=payload.run_id,
                    user_id=user_context.id,
                    company_name=item.company_name,
                    industry=item.industry,
                    contact_name=item.contact_name,
                    job_title=item.job_title,
                    email=item.email,
                    phone=item.phone,
                    linkedin_url=item.linkedin_url,
                    alignment_score=Decimal(str(item.alignment_score)) if item.alignment_score is not None else None,
                    canonical_url=item.canonical_url,
                    source_doc_id=item.source_doc_id,
                    source_chunk_ids=item.source_chunk_ids,
                    dedupe_key=dedupe_key,
                )
            )

        if created:
            self.leads.create_many(created)
            self.db.commit()
        else:
            self.db.rollback()

        return LeadBulkCreateResponse(
            run_id=payload.run_id,
            created_count=len(created),
            duplicate_count=duplicate_count,
            lead_ids=[lead.id for lead in created],
        )

    def list_leads(
        self,
        user_context: UserContext,
        *,
        run_id: UUID | None,
        limit: int,
        offset: int,
    ) -> list[Lead]:
        user_id = None if user_context.role == "admin" else user_context.id
        return self.leads.list_leads(user_id=user_id, run_id=run_id, limit=limit, offset=offset)

    def get_lead(self, lead_id: UUID, user_context: UserContext) -> Lead:
        lead = self.leads.get_by_id(lead_id)
        if lead is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
        if lead.user_id != user_context.id and user_context.role != "admin":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
        return lead

    def list_run_leads(self, run_id: UUID, user_context: UserContext) -> list[Lead]:
        user_id = None if user_context.role == "admin" else user_context.id
        return self.leads.list_for_run(run_id, user_id=user_id)

    def _build_dedupe_key(self, run_id: UUID, item: LeadBulkItem) -> str:
        normalized_email = (item.email or "").strip().lower()
        normalized_company = item.company_name.strip().lower()
        normalized_contact = (item.contact_name or "").strip().lower()
        normalized_url = (item.canonical_url or "").strip().lower()

        seed = normalized_email or "|".join(
            part for part in (normalized_company, normalized_contact, normalized_url) if part
        )
        if not seed:
            seed = normalized_company

        digest = hashlib.sha256(f"{run_id}:{seed}".encode("utf-8")).hexdigest()
        return digest

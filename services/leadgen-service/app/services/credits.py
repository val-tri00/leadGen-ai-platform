from app.core.config import settings


class CreditReservationService:
    def reserve_for_requested_leads(self, requested_leads_count: int) -> int:
        return requested_leads_count * settings.credit_units_per_lead

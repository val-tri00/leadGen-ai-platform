from fastapi import FastAPI

from app.api.routes.leads import router as leads_router
from app.core.config import settings

app = FastAPI(
    title="LeadGen Leadstore Service",
    version="0.1.0",
)

app.include_router(leads_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": settings.service_name, "status": "ok"}

from fastapi import FastAPI

from app.api.routes.runs import router as runs_router
from app.core.config import settings

app = FastAPI(
    title="LeadGen Service",
    version="0.1.0",
)

app.include_router(runs_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": settings.service_name, "status": "ok"}

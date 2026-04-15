from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.core.config import settings
from app.db.session import SessionLocal
from app.services.bootstrap import bootstrap_admin_user

app = FastAPI(
    title="LeadGen Identity Service",
    version="0.1.0",
)

app.include_router(auth_router)


@app.on_event("startup")
def on_startup() -> None:
    with SessionLocal() as db:
        bootstrap_admin_user(db)


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": settings.service_name, "status": "ok"}

import os

from fastapi import FastAPI

SERVICE_NAME = os.getenv("SERVICE_NAME", "leadstore-service")

app = FastAPI(
    title="LeadGen Leadstore Service",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": SERVICE_NAME, "status": "ok"}


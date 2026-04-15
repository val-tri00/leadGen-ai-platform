import os

from fastapi import FastAPI

SERVICE_NAME = os.getenv("SERVICE_NAME", "identity-service")

app = FastAPI(
    title="LeadGen Identity Service",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": SERVICE_NAME, "status": "ok"}


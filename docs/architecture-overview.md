# Architecture Overview

LeadGen AI is organized as a service-oriented monorepo. The current foundation focuses on clear boundaries, local development ergonomics, and containerized startup.

## Runtime Components

- `web`: Next.js frontend served on port `3000`.
- `api-gateway`: FastAPI entry point intended to coordinate backend calls.
- `identity-service`: FastAPI service reserved for authentication and user identity.
- `leadgen-service`: FastAPI service reserved for lead generation workflows.
- `pipeline-worker`: FastAPI placeholder for future async pipeline execution.
- `leadstore-service`: FastAPI service reserved for lead persistence and retrieval.
- `postgres`: Relational data store.
- `redis`: Cache and queue dependency.
- `nginx`: Local reverse proxy.

## Network Model

Docker Compose creates a shared `leadgen` bridge network. Services communicate with each other using Compose service names such as `postgres`, `redis`, `identity-service`, and `leadgen-service`.

## Local Request Flow

NGINX is the public entrypoint for the local MVP environment. It exposes one host port and forwards browser traffic to the correct container by using internal Docker service names instead of container-local `localhost` assumptions.

Requests to `/` are proxied to the `web` service, which runs the Next.js frontend. Requests to `/api/` are proxied to the `api-gateway` service, which owns the public backend API surface for the MVP. The gateway currently exposes `GET /health` for internal container health checks and `GET /api/v1/status` as a placeholder versioned API route.

The API Gateway sits in front of the internal services so the frontend and nginx do not need to know about each backend service directly. Future routing, authentication, request validation, and service orchestration can be added at the gateway without changing the public local entrypoint.

## Identity And Auth

Authentication is isolated in `identity-service` so user credentials, password hashing, token issuance, and session revocation stay behind a focused service boundary. This keeps the API Gateway ready to coordinate requests later without owning sensitive identity persistence directly.

Refresh tokens are persisted in PostgreSQL using a token JTI so sessions can be revoked safely during logout and later security workflows. Access tokens remain short lived, while refresh tokens provide controlled continuity without storing password material.

JWTs and a small RBAC foundation were chosen for the MVP because they keep service-to-service integration simple while still carrying user identity, token type, and role claims. The current roles are `user` and `admin`; admin-only behavior is intentionally deferred.

## Frontend Auth Flow

The web app sends auth requests through relative `/api/auth/...` paths so browser traffic enters through NGINX and the API Gateway before reaching `identity-service`. This keeps backend service locations out of frontend code and preserves one public request flow for local development.

Auth state is intentionally lightweight in the MVP. The web app uses a React context, a small API client, and a centralized session storage helper for access and refresh tokens. This is practical for local browser testing while keeping token handling isolated for a later migration.

The `/dashboard` route is protected with a client-side guard. On app load, the auth provider restores a stored session, calls `/api/auth/me`, attempts refresh when needed, and clears invalid sessions before redirecting unauthenticated users to `/login`. In a production hardening pass, this flow can move refresh tokens into HttpOnly cookies and shift more enforcement to middleware/server-side boundaries.

## Lead Generation Runs

`leadgen-service` owns the lead generation run domain. A run represents one user-submitted generation request with explicit criteria such as industry, offering, location, search query, and requested lead count. Keeping run creation and lifecycle state in this service gives the MVP one clear owner for orchestration decisions while downstream services can later report progress or results.

Run events are persisted in a separate timeline table so every lifecycle step is traceable. This gives operators and future UI screens a simple way to inspect what happened during a run, including queue preparation, pipeline progress, failures, and debug metadata.

The current implementation prepares the async pipeline flow without performing real crawling, LLM calls, lead extraction, or storage. Run creation reserves placeholder credits, writes initial events, transitions the run into `queued`, and executes a lightweight enqueue hook that can later be replaced by Redis/Celery-style background orchestration.

For auth compatibility, `leadgen-service` reads user context from gateway-style headers such as `X-User-Id`, `X-User-Email`, and `X-User-Role`. Local development can use a controlled mock user fallback; production-like environments should disable that fallback and let the API Gateway provide verified identity context.

## Async Pipeline Orchestration

Run processing is asynchronous. After `leadgen-service` persists a run and moves it to `queued`, it publishes a Celery task named `pipeline.process_run` to the `pipeline.run` Redis-backed queue. The task payload includes the run ID, user identity context, correlation ID, enqueue timestamp, and a compact summary of the generation input.

`pipeline-worker` consumes the `pipeline.run` queue and simulates the future processing lifecycle in deterministic order: `crawling`, `cleaning`, `embedding`, `extracting`, `storing`, `verifying`, and `done`. Each step sends an internal callback to `leadgen-service` with `PATCH /runs/{run_id}/status` using Docker service DNS (`http://leadgen-service:8000`) rather than host-local addresses.

Callback-based updates keep `leadgen-service` as the run owner while allowing the worker to execute slow processing independently. Every accepted callback creates a run event, so querying `/runs/{run_id}/events` shows the visible timeline from creation through completion. The worker can simulate local failure with `PIPELINE_SIMULATE_FAIL_STEP`, which reports `failed` and records the failed step in event metadata.

`pipeline-worker` now runs as a Celery worker instead of an HTTP API. Its Docker readiness check uses Celery inspect against Redis, while `leadgen-service` keeps the HTTP health endpoint and depends on Redis for publishing queue messages.

## Current Scope

The current milestone adds the identity foundation, frontend auth shell, lead generation run foundation, and placeholder async pipeline orchestration. Broader product workflows, real crawling, R2 raw content, chunking, embeddings, lead extraction, lead storage, email verification, OAuth providers, pgvector storage, billing provider integration, and gateway-level auth enforcement are intentionally deferred.

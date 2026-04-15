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

## Current Scope

The current milestone adds the identity foundation with local PostgreSQL persistence, password hashing, JWT issuance, and refresh token revocation. Broader product workflows, background jobs, AI integrations, email verification, OAuth providers, and gateway-level auth enforcement are intentionally deferred.

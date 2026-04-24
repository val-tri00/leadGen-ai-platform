# LeadGen AI Portfolio

LeadGen AI is a portfolio-ready monorepo for experimenting with AI-assisted lead generation workflows. The current MVP includes a Next.js SaaS-style dashboard, FastAPI backend services, shared packages, Docker Compose infrastructure, PostgreSQL, Redis, and nginx.

The platform already supports auth bootstrap, protected dashboard pages, lead generation runs, async pipeline simulation, and stored lead results. Real crawling, extraction, enrichment, and billing logic will be added in later milestones.

## Planned Architecture

The project is planned as a containerized monorepo with a Next.js frontend, a FastAPI API gateway, focused FastAPI microservices, Redis-backed asynchronous workflows, PostgreSQL persistence, and nginx as the local reverse proxy. Shared TypeScript packages will hold cross-app configuration and domain types as the MVP grows.

## Monorepo Structure

```text
apps/
  web/                     Next.js TypeScript app using the App Router
services/
  api-gateway/             Public API entry point for backend traffic
  identity-service/        Authentication and user identity service
  leadgen-service/         Lead generation orchestration service
  pipeline-worker/         Worker service for async pipeline execution
  leadstore-service/       Lead storage and retrieval service
packages/
  shared-config/           Shared TypeScript configuration placeholders
  shared-types/            Shared TypeScript domain type placeholders
infra/
  docker/                  Shared Dockerfiles
  nginx/                   Local nginx reverse proxy
docs/                      Project documentation
```

## Run Locally

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Start the stack:

   ```bash
   docker compose up --build
   ```

3. Open the local services:

   - Main app through nginx: http://localhost:8080
   - Web container directly: http://localhost:3000
   - API gateway health: http://localhost:8000/health
   - Identity service health: http://localhost:8001/health
   - Leadgen service health: http://localhost:8002/health
   - Leadstore service health: http://localhost:8004/health

4. Recommended browser flow:

   - open `http://localhost:8080`
   - register or log in
   - land on `/dashboard`
   - create a run from `/generate`
   - inspect timeline and stored leads from `/runs/[runId]`

## Current MVP Services

- `web`: Next.js SaaS dashboard shell for auth, runs, and lead results.
- `api-gateway`: FastAPI gateway for public `/api/...` traffic.
- `identity-service`: FastAPI auth service for register/login/refresh/logout/me.
- `leadgen-service`: FastAPI run owner for lead generation orchestration.
- `pipeline-worker`: Celery worker that simulates async pipeline progression.
- `leadstore-service`: FastAPI lead storage service for persisted extracted leads.
- `postgres`: Primary relational database.
- `redis`: Queue/cache dependency backing Celery orchestration.
- `nginx`: Local reverse proxy and public browser entrypoint.

## Development Notes

- Services communicate over the internal Docker network by Compose service name.
- Backend service containers expose FastAPI on port `8000` internally.
- Host ports are mapped only for local development and health check convenience.
- Shared packages are placeholders for future cross-service configuration and types.
- Frontend structure and reusable UI components are documented in `docs/frontend-ui-structure.md`.

## Development Workflow

Use `main` as the default branch. Keep `main` stable and create focused branches for each change.

Recommended branch names:

- `dev/<short-feature-name>` for new features.
- `fix/<short-bug-name>` for bug fixes.
- `chore/<short-maintenance-name>` for maintenance tasks.

Recommended commit message style:

- `feat: add lead scoring endpoint`
- `fix: correct service health response`
- `chore: update docker compose configuration`
- `docs: expand architecture overview`

Before opening a pull request, run the relevant local checks and confirm Docker Compose still renders cleanly:

```bash
docker compose config --quiet
```

Pull requests should include a short summary, completed checks, and any notes that help reviewers understand the change.

## License

The project license is not finalized yet. See `LICENSE` for the current placeholder notice.

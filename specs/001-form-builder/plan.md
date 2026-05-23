# Implementation Plan: Full-Stack Form Builder and Filling Application

**Branch**: `001-form-builder` | **Date**: 2026-05-24 | **Spec**: [specs/001-form-builder/spec.md](spec.md)

**Input**: Feature specification from `/specs/001-form-builder/spec.md`

## Summary

We are building a full-stack, single-repository, dual-application Form Creation and Filling platform. 
*   **Frontend**: Built with Next.js (TypeScript, App Router, Tailwind/Vanilla CSS). It contains pages for sign-up, sign-in, dynamic form creator, public form filling, and a creator dashboard for response analytics.
*   **Backend**: Built with Python (FastAPI/SQLAlchemy) utilizing PostgreSQL on GCP Cloud SQL for data persistence.
*   **DevOps & Deployment**: Orchestrated locally via Docker Compose. Deployments are handled via a GitHub Actions CI/CD pipeline which builds two lightweight Docker containers (frontend, backend) and deploys them onto a secure GCP Compute Engine VM.

## Technical Context

**Language/Version**: Python 3.11, TypeScript 5.0+, Node.js 20.x

**Primary Dependencies**: FastAPI, Uvicorn, SQLAlchemy, Alembic, PyJWT, Passlib (bcrypt), Next.js, React, Axios

**Storage**: GCP Cloud SQL PostgreSQL

**Testing**: pytest (backend), Vitest/Playwright (frontend)

**Target Platform**: GCP Compute Engine VM (Debian/Ubuntu running Docker & Docker Compose)

**Project Type**: Single-repo web-service (dual app structure: `/frontend` and `/backend`)

**Performance Goals**: Frontend Page Load < 1.5s, API Response times < 200ms p95, Submissions persisted under 500ms.

**Constraints**: Security-first database queries, secure JWT token validation, secure environmental configurations.

**Scale/Scope**: ~10,000 requests/day, single VM instance.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Simple Dual-App Architecture**: Passed. Frontend is fully detached from backend. Shared schema is defined at the database level.
- **Docker-first & Infrastructure-as-Code**: Passed. Local development runs identical containers to production.
- **Security & RBAC**: Passed. User sessions utilize stateless cryptographically-signed JWTs. Database connections utilize secure GCP IAM or password-based TLS connections.

## Project Structure

### Documentation (this feature)

```text
specs/001-form-builder/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output: GCP, Auth, and Docker deployment strategy
├── data-model.md        # Phase 1 output: PostgreSQL Database Schema
├── quickstart.md        # Phase 1 output: Local Docker Compose Guide
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── contracts/
    └── api-spec.json    # Phase 1 output: FastAPI OpenAPI Specification export
```

### Source Code (repository root)

```text
backend/
├── Dockerfile
├── requirements.txt
├── alembic.ini
├── src/
│   ├── main.py          # FastAPI application entrypoint
│   ├── config.py        # Environmental variables and setup
│   ├── database.py      # SQLAlchemy connection pool and engine
│   ├── models/          # DB models (User, Form, Question, Submission, Answer)
│   ├── schemas/         # Pydantic schemas (Request/Response validation)
│   ├── api/             # API Router endpoints
│   │   ├── auth.py      # Signup, Signin endpoints
│   │   ├── forms.py     # Create, Read, Update, Delete Form, Questions
│   │   └── fills.py     # Public Form fill submissions
│   └── utils/           # Password hashing, JWT creation & validation
└── tests/               # pytest suite

frontend/
├── Dockerfile
├── package.json
├── next.config.js
├── tailwind.config.js   # (If requested, or Vanilla CSS variables)
├── src/
│   ├── app/             # Next.js App Router (pages & layouts)
│   │   ├── page.tsx          # Homepage
│   │   ├── signup/           # Register page
│   │   ├── login/            # Signin page
│   │   ├── dashboard/        # Creator panel listing forms & analytics
│   │   ├── create/           # Incremental Form Builder page
│   │   └── fill/[id]/        # Public Form filling route (UUID id)
│   ├── components/      # UI components (FormBuilder, QuestionCard, Charts)
│   ├── services/        # API client modules
│   └── utils/           # Auth and token storage
└── tests/               # Testing suite

.github/
└── workflows/
    └── deploy.yml       # GitHub Actions YAML for Docker builds and GCP deploy

docker-compose.yml       # Local development orchestration
```

**Structure Decision**: Option 2: Dual Web Application. A clear separation of concerns with Next.js serving as the client and FastAPI serving as the stateless JSON API. Both apps are fully independent, containerized, and share database endpoints only.

## Complexity Tracking

*No current constitutional violations are identified. A standard 2-tier application with standard JWT authentication is highly optimal.*

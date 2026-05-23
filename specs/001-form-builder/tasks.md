# Tasks: Full-Stack Form Builder and Filling Platform

**Input**: Design documents from `/specs/001-form-builder/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are optional in this phase unless unit validation is required before production builds.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Dual web-app paths:
  - `/backend/src/`
  - `/frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initial project directory and environment configuration bootstrapping.

- [x] T001 Create core project layout folders `/frontend` and `/backend`
- [x] T002 Initialize Python FastAPI configuration and requirements at `/backend/requirements.txt`
- [x] T003 Initialize Next.js project with TypeScript and styling inside `/frontend/package.json`
- [x] T004 [P] Configure environment templates `/backend/.env.template` and `/frontend/.env.template`
- [x] T005 [P] Setup root orchestration file `/docker-compose.yml` for local development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core engine setup (database connection, routing middleware, and security utility blocks).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Setup SQLAlchemy PostgreSQL engine connection pooling at `/backend/src/database.py`
- [ ] T007 Initialize database migration management and scripts with Alembic at `/backend/alembic.ini`
- [ ] T008 [P] Configure standard routing configurations and error middleware inside `/backend/src/main.py`
- [ ] T009 [P] Implement password hashing and stateless JWT utilities in `/backend/src/utils/security.py`
- [ ] T010 Implement current authenticated user resolution in `/backend/src/utils/auth_deps.py`
- [ ] T011 Create shared HTTP Axios fetch client module at `/frontend/src/services/api.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - User Authentication & Identity (Priority: P1) 🎯 MVP

**Goal**: Support signup, login, and profile fetching for form creators.

**Independent Test**: Hit registration and session creation endpoints via Swagger. Confirm JWT token returned in responses allows pulling the active identity.

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create User database model inside `/backend/src/models/user.py`
- [ ] T013 [P] [US1] Implement User authentication validation schemas at `/backend/src/schemas/user.py`
- [ ] T014 [US1] Create User registration and signin router endpoints in `/backend/src/api/auth.py`
- [ ] T015 [P] [US1] Build Register page form UI component in `/frontend/src/app/signup/page.tsx`
- [ ] T016 [P] [US1] Build Login page form UI component in `/frontend/src/app/login/page.tsx`
- [ ] T017 [US1] Integrate client authorization API fetch scripts inside `/frontend/src/services/auth.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Incremental Form Creation (Priority: P1)

**Goal**: Enable dynamic question additions (text, checkbox, radio) to construct customized questionnaires.

**Independent Test**: Logged-in user builds a form layout, clicks "Publish", and verifies UUID redirection.

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create Form and Question database models inside `/backend/src/models/form.py`
- [ ] T019 [P] [US2] Implement Form and Question schemas at `/backend/src/schemas/form.py`
- [ ] T020 [US2] Implement Form publication endpoint and database persistence at `/backend/src/api/forms.py`
- [ ] T021 [P] [US2] Create dynamic Question Addition interactive component at `/frontend/src/components/FormBuilder.tsx`
- [ ] T022 [P] [US2] Build Form Creation dashboard workspace page wrapper at `/frontend/src/app/create/page.tsx`
- [ ] T023 [US2] Integrate Form designer client fetch handlers inside `/frontend/src/services/forms.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Form Filling (Priority: P1)

**Goal**: Render public forms dynamically and validate submission inputs on submit.

**Independent Test**: Enter public URL `/fill/[id]`. Confirm fields render based on JSON spec. Submit form and confirm persistence.

### Implementation for User Story 3

- [ ] T024 [P] [US3] Create Submission and Answer database models inside `/backend/src/models/submission.py`
- [ ] T025 [P] [US3] Implement Submission and Answer validation schemas in `/backend/src/schemas/submission.py`
- [ ] T026 [US3] Create public Form retriever and Submission post router at `/backend/src/api/fills.py`
- [ ] T027 [P] [US3] Build dynamic Question Rendering component inside `/frontend/src/components/FormViewer.tsx`
- [ ] T028 [P] [US3] Create dynamic route wrapper page for form filling at `/frontend/src/app/fill/[id]/page.tsx`
- [ ] T029 [US3] Integrate public form response dispatcher scripts inside `/frontend/src/services/fills.ts`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: User Story 4 - Creator Dashboard & Analytics (Priority: P2)

**Goal**: Tabulate submitted responder answers to analyze feedback.

**Independent Test**: Log in as creator, access main dashboard, select a form, and verify answers render in a clear grid.

### Implementation for User Story 4

- [ ] T030 [US4] Create creator dashboard aggregated forms and metrics router inside `/backend/src/api/dashboard.py`
- [ ] T031 [P] [US4] Build main Dashboard layout displaying forms and submission tallies at `/frontend/src/app/dashboard/page.tsx`
- [ ] T032 [P] [US4] Build responses grid viewer table at `/frontend/src/components/SubmissionTable.tsx`
- [ ] T033 [US4] Integrate metrics client API service queries inside `/frontend/src/services/dashboard.ts`

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Production deployment container configurations and workflow actions.

- [ ] T034 Implement Python lightweight Dockerfile at `/backend/Dockerfile`
- [ ] T035 Implement Next.js multi-stage Dockerfile at `/frontend/Dockerfile`
- [ ] T036 [P] Build continuous integration and VM delivery actions at `/.github/workflows/deploy.yml`
- [ ] T037 Validate local docker compose setups following instructions inside `specs/001-form-builder/quickstart.md`
- [ ] T038 Conduct complete end-to-end user signup, form creation, filling, and dashboard audit verification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all User Stories.
- **User Stories (Phase 3+)**: All depend on Foundational (Phase 2).
  - Can proceed in parallel once Phase 2 is complete.
- **Polish (Phase N)**: Depends on all User Stories completion.

### Parallel Opportunities

- Phase 1 Setup scripts can be formulated concurrently.
- Models and Pydantic schemas within each story can be developed concurrently.
- Frontend views and components (`/frontend`) can be written in parallel with Backend models and endpoints (`/backend`).

---

## Parallel Example: User Story 1

```bash
# Launch User Story 1 Models and Schemas concurrently:
Task: "Create User database model inside /backend/src/models/user.py"
Task: "Implement User authentication validation schemas at /backend/src/schemas/user.py"

# Build Signup and Signin page interfaces concurrently:
Task: "Build Register page form UI component in /frontend/src/app/signup/page.tsx"
Task: "Build Login page form UI component in /frontend/src/app/login/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1 (Sign up, login, user context resolution).
4. Run authentication manual tests locally to verify success.

### Incremental Delivery

1. Setup + Foundation → Core API layout configured.
2. Add User Story 1 → Users register and authenticate securely (MVP).
3. Add User Story 2 → Users build dynamic forms.
4. Add User Story 3 → Visitors fill forms publicly.
5. Add User Story 4 → Creators view responses.
6. Containerize and push via GitHub Actions CI/CD to live Compute Engine.

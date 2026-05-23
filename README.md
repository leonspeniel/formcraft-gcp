# FormCraft - Dynamic Form Builder & Filling Platform

FormCraft is a premium, full-stack dynamic questionnaire and analytics platform designed with a glassmorphism dark theme. Build interactive forms with incremental question additions, distribute shareable UUID links, and track responses in real time.

---

## 🏗️ Dual-App Architecture

*   **Frontend**: Next.js 14 (App Router, TypeScript, Vanilla CSS variable design system).
*   **Backend**: FastAPI (Python 3.11, SQLAlchemy, Alembic, PostgreSQL, stateless JWT sessions).
*   **DevOps**: Orchestrated with Docker Compose locally, deployable to a secure GCP Compute Engine VM and Cloud SQL instance via GitHub Actions CI/CD workflows.

---

## ⚡ Quickstart (Local Orchestration)

To spin up the entire database, backend, and frontend containers locally:

1.  **Configure environment files**: Create a `.env` file in the root directory:
    ```env
    POSTGRES_USER=form_user
    POSTGRES_PASSWORD=secure_dev_password
    POSTGRES_DB=form_db
    DATABASE_URL=postgresql://form_user:secure_dev_password@db:5432/form_db
    JWT_SECRET=super_secret_local_dev_key_12345
    JWT_ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=1440
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

2.  **Boot services**:
    ```bash
    docker compose up --build -d
    ```

3.  **Access Apps**:
    *   **Frontend client**: [http://localhost:3000](http://localhost:3000)
    *   **Interactive backend API docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🚀 Native Development Workflow (Without Docker)

### Frontend (Next.js)
1.  Navigate to the `/frontend` directory.
2.  Install dependencies and start development server:
    ```bash
    npm install
    npm run dev
    ```

### Backend (FastAPI)
1.  Navigate to the `/backend` directory.
2.  Set up your virtual environment and run the server:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    uvicorn src.main:app --reload --port 8000
    ```

---

## 📂 Repository Structure

```text
├── .github/workflows/   # CI/CD deployment pipelines to GCP
├── backend/             # FastAPI application modules
│   ├── Dockerfile
│   ├── src/             # API Router, DB models, schemas, utilities
│   └── alembic.ini      # Alembic migration engine
├── frontend/            # Next.js App Router client
│   ├── Dockerfile
│   ├── src/             # App views, layouts, services, global styles
│   └── tsconfig.json
├── docker-compose.yml   # Multi-container local manifest
└── README.md            # Project blueprint and onboarding guide
```

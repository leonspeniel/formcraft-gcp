# Quickstart Guide: Full-Stack Form Builder and Filling Application

This guide helps you spin up the Next.js frontend, Python FastAPI backend, and local PostgreSQL database in a unified Docker environment for local development and testing.

---

## Prerequisites

Ensure you have the following installed on your development machine:
*   [Docker](https://www.docker.com/products/docker-desktop/) (Docker Engine 20.x+)
*   [Docker Compose](https://docs.docker.com/compose/install/) (Compose v2.x+)
*   [Git](https://git-scm.com/)

---

## 1. Local Configuration Setup

Create an `.env` file in the root of the repository to manage environmental variables:

```env
# Database Settings
POSTGRES_USER=form_user
POSTGRES_PASSWORD=secure_dev_password
POSTGRES_DB=form_db
DATABASE_URL=postgresql://form_user:secure_dev_password@db:5432/form_db

# JWT Security
JWT_SECRET=super_secret_local_dev_key_12345
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# NEXTJS Environment
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 2. Bootstrapping with Docker Compose

Run the following command in the repository root to build and boot all containers (frontend, backend, database):

```bash
docker compose up --build -d
```

This starts three services:
1.  **db**: PostgreSQL 15 database instance listening on port `5432` internally.
2.  **backend**: Python FastAPI server listening on port `8000` (`http://localhost:8000`).
3.  **frontend**: Next.js client listening on port `3000` (`http://localhost:3000`).

To monitor service logs:
```bash
docker compose logs -f
```

To shut down services:
```bash
docker compose down -v
```

---

## 3. Verifying Local Installation

1.  **Frontend Clients**: Navigate to `http://localhost:3000` in your web browser. You should see the landing page and have access to Signup / Signin routes.
2.  **Backend Interactive API Docs**: Go to `http://localhost:8000/docs` or `http://localhost:8000/redoc`. You can test endpoints interactively via Swagger UI.
3.  **Database Connection**: Connect directly to your local database using any client (like DBeaver or pgAdmin) at `localhost:5432` with username `form_user` and password `secure_dev_password`.

---

## 4. Local Development Workflow

*   **Hot Reloading**: File changes inside `/frontend` and `/backend` directories will automatically reload the application thanks to Docker volume mounts.
*   **Database Migrations**: When changing models in `/backend/src/models/`, run database migrations locally:
    ```bash
    docker compose exec backend alembic revision --autogenerate -m "describe_change"
    docker compose exec backend alembic upgrade head
    ```

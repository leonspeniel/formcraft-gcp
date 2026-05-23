# Research & Decisions: Full-Stack Form Builder and Filling Application

This document outlines the architectural decisions, rationale, and configuration details for deploying the Next.js and Python (FastAPI) applications on Google Cloud Platform (GCP).

---

## 1. GCP Cloud SQL Access & Database Integration

### Decision
Connect the FastAPI backend to a Cloud SQL PostgreSQL instance using the **Cloud SQL Auth Proxy** running as a background service on the GCP VM.

### Rationale
*   **Security**: The proxy automatically encrypts traffic using TLS 1.3 with 254-bit encryption and handles authentication via IAM, eliminating the need to whitelist the VM's public IP address in the database access control list.
*   **Ease of Configuration**: FastAPI connects to `127.0.0.1:5432` locally (routed by the proxy), requiring no complex SSL certificate configuration in the application code.

### Alternatives Considered
*   *Direct Connection over SSL/TLS with Whitelisted IP*: Rejected because the VM's IP might change if not static, and managing client certificates within the Docker container is prone to operational errors.
*   *GCP Serverless VPC Access*: Only applicable if using Cloud Run or Cloud Functions, but we are deploying directly to a Compute Engine VM.

---

## 2. Authentication Flow (JWT)

### Decision
Implement stateless, token-based authentication using **JSON Web Tokens (JWT)**:
1.  **Hashing**: Passwords hashed on signup using `bcrypt` (via `passlib`).
2.  **Issuance**: Upon successful signin, the backend issues an HS256-signed JWT containing the user's ID, email, and expiration claim.
3.  **Storage**: The Next.js frontend receives the JWT and stores it in secure, HttpOnly, SameSite cookies to protect against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).

### Rationale
*   Stateless authentication removes the need for database sessions, allowing the API to scale easily.
*   `HttpOnly` cookies prevent client-side JavaScript from accessing the session token, highly mitigating theft.

---

## 3. Dual-Application Dockerization

### Decision
Use multi-stage Docker builds to compile lightweight, optimized, and secure production containers.

*   **Frontend (Next.js)**:
    *   *Stage 1*: Node base image to build assets (`next build`).
    *   *Stage 2*: Minimal `node:20-alpine` base image copying only public assets, `.next/standalone`, and `.next/static`. This reduces container size from >1GB to ~120MB.
*   **Backend (FastAPI)**:
    *   *Stage 1*: `python:3.11-slim` with necessary compilation tools to install requirements.
    *   *Stage 2*: Copy installed dependencies and Python code. Run as a non-root user for security hardening.

---

## 4. GCP CLI Configuration & Setup Guide

Below are the exact `gcloud` commands to set up the GCP project resources:

### A. Initialize Project & Enable APIs
Ensure you are authenticated and have the target project selected:
```bash
# Set project configuration
gcloud config set project [PROJECT_ID]

# Enable required GCP APIs
gcloud services enable compute.googleapis.com \
                       sqladmin.googleapis.com \
                       artifactregistry.googleapis.com \
                       iam.googleapis.com
```

### B. Create Cloud SQL PostgreSQL Instance
```bash
# Create the PostgreSQL database instance
gcloud sql instances create form-builder-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1

# Create the database inside the instance
gcloud sql databases create form_db --instance=form-builder-db

# Set a secure password for the postgres default user
gcloud sql users set-password postgres \
    --instance=form-builder-db \
    --password=[DATABASE_PASSWORD]
```

### C. Set Up GCP Artifact Registry for Docker Containers
```bash
# Create an Artifact Registry repository for our Docker images
gcloud artifacts repositories create form-builder-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker repository for Form Builder apps"
```

### D. Set Up VM Service Account & IAM Permissions
To allow the VM instance to securely pull images from Artifact Registry and access Cloud SQL without embedded keys:
```bash
# Create a dedicated Service Account for the VM
gcloud iam service-accounts create form-builder-sa \
    --display-name="Form Builder VM Service Account"

# Grant the SA access to Cloud SQL Admin (required for SQL Proxy)
gcloud projects add-iam-policy-binding [PROJECT_ID] \
    --member="serviceAccount:form-builder-sa@[PROJECT_ID].iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

# Grant the SA access to pull from Artifact Registry
gcloud projects add-iam-policy-binding [PROJECT_ID] \
    --member="serviceAccount:form-builder-sa@[PROJECT_ID].iam.gserviceaccount.com" \
    --role="roles/artifactregistry.reader"
```

### E. Create the Compute Engine VM Instance
```bash
# Create a small virtual machine instance
gcloud compute instances create form-builder-vm \
    --zone=us-central1-a \
    --machine-type=e2-micro \
    --service-account="form-builder-sa@[PROJECT_ID].iam.gserviceaccount.com" \
    --scopes="https://www.googleapis.com/auth/cloud-platform" \
    --image-family=debian-11 \
    --image-project=debian-cloud \
    --boot-disk-size=20GB \
    --tags=http-server,https-server
```

### F. Create Firewall Rules for Web Traffic
```bash
# Create firewall rule to allow standard HTTP (Port 80) and HTTPS (Port 443) traffic
gcloud compute firewall-rules create allow-http-https \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:80,tcp:443 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=http-server,https-server
```

---

## 5. CI/CD Deployment Strategy (GitHub Actions)

The deployment pipeline automates builds and delivery:

1.  **Trigger**: Triggered on push to the `main` branch.
2.  **Authenticate**: Authenticates with Google Cloud using a Service Account Key stored in GitHub secrets (`GCP_SA_KEY`).
3.  **Build & Push**:
    *   Builds `frontend/Dockerfile` → pushes tag to GCP Artifact Registry as `us-central1-docker.pkg.dev/[PROJECT_ID]/form-builder-repo/frontend:latest`.
    *   Builds `backend/Dockerfile` → pushes tag to GCP Artifact Registry as `us-central1-docker.pkg.dev/[PROJECT_ID]/form-builder-repo/backend:latest`.
4.  **Deploy**:
    *   SSH connects to the Compute Engine VM.
    *   Pulls the updated Docker images.
    *   Updates the production `docker-compose.yml` configuration.
    *   Restarts the services gracefully (`docker compose up -d --force-recreate`).

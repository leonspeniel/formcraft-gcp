FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install requirements
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application configuration and source code
COPY src /app/src
COPY alembic.ini /app/

EXPOSE 8000

# Start the uvicorn API web server
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

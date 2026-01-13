# ------------------------------
# Stage 1: Build Frontend (React)
# ------------------------------
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
# Copy package files first for cache efficiency
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
# Copy source code
COPY frontend/ ./
# Build the application
# We need to pass the API URL at build time for Vite
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build
# Output is typically in /app/frontend/dist

# ------------------------------
# Stage 2: Build Backend Environment (Poetry)
# ------------------------------
# Using python 3.13 as closest stable to 3.14
FROM python:3.14-slim AS backend-build
WORKDIR /app/backend

# Install Poetry
# Ensure pip is up to date
RUN pip install --upgrade pip && pip install poetry

# Copy dependency definition matches the structure: root/fastapi/pyproject.toml
COPY fastapi/pyproject.toml fastapi/poetry.lock* ./

# Configure poetry to create venv in project
ENV POETRY_VIRTUALENVS_IN_PROJECT=true

# Install dependencies (no dev dependencies for production)
RUN poetry install --no-root --no-interaction --no-ansi --only main

# ------------------------------
# Stage 3: Final Runtime Image
# ------------------------------
FROM python:3.14-slim

# Install Nginx and Supervisor
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Copy Frontend Build to Nginx default directory
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy Backend Venv from builder
COPY --from=backend-build /app/backend/.venv /app/backend/.venv

# Add venv to PATH so we can use 'uvicorn', 'alembic', etc. directly
ENV PATH="/app/backend/.venv/bin:$PATH"
ENV PYTHONPATH="/app/backend"

# Set default Environment Variables
ENV LITTLE_DATABASE=true
ENV SQLITE_DB_NAME=sqlite/faustoauth.db
# Optional: Set this if you need generated URLs to use HTTPS or a specific domain
# ENV PUBLIC_URL=http://localhost

# Copy Backend Code
WORKDIR /app
COPY fastapi /app/backend
RUN mkdir -p /app/backend/sqlite

# Copy Configs
# Nginx Config
COPY docker/nginx.conf /etc/nginx/sites-enabled/default
# Supervisord Config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
# Entrypoint Script
COPY fastapi/entrypoint.sh /app/entrypoint.sh

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

# Remove default nginx index page if it conflicts (optional, but good practice)
RUN rm -f /usr/share/nginx/html/index.nginx-debian.html

# Exposure
EXPOSE 80

# Start via Entrypoint (Run Migrations -> Start Supervisor)
CMD ["/app/entrypoint.sh"]

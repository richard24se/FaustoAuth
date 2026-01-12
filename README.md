# FaustoAuth

FaustoAuth is a comprehensive authentication and authorization library/service built with FastAPI. It provides a robust solution for handling JWT tokens, OAuth2 standards, Role-Based Access Control (RBAC), and audit logging.

## Features

- **JWT Authentication**: Secure token-based authentication with access and refresh tokens.
- **OAuth2 Support**: Implements OAuth2 standards for secure authorization flows.
- **RBAC (Role-Based Access Control)**: Granular permission management with Roles, Permissions, and Object types.
- **Audit Logging**: Tracks user actions and system events for security and compliance.
- **High Performance**: Built on FastAPI and SQLAlchemy (Async), utilizing Redis for token management and caching.
- **Containerized**: Ready for deployment with Docker and Vagrant support.

## Prerequisites

- Python 3.10+
- PostgreSQL
- Redis
- [Poetry](https://python-poetry.org/) (for dependency management)
- Docker & Vagrant (optional, for containerized development)

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd FaustoAuth
    ```

2.  **Install dependencies using Poetry:**

    ```bash
    cd fastapi
    poetry install
    ```

3.  **Set up Environment Variables:**

    Create a `.env` file in the `fastapi` directory. You can use the default settings in `fastapi/config/settings.py` as a reference.

    ```env
    DEBUG=True
    DB_NAME=Fausto
    DB_USER=root
    DB_PASSWORD=your_password
    DB_HOST=localhost
    DB_PORT=5432
    REDIS_HOST=localhost
    REDIS_PORT=6379
    JWT_SECRET_KEY=your_secret_key
    ```

## Usage

### Running the Application

You can run the FastAPI application using the `fastapi` CLI or `uvicorn`.

```bash
cd fastapi
# Standard dev run
poetry run fastapi dev run.py

# Custom Uvicorn command with debug logging on port 9024
uvicorn run:app --reload --host 0.0.0.0 --port 9024 --log-level 'debug'
```

### Local Environment Setup

To start the local environment services (PostgreSQL, PgAdmin, Redis):

```bash
docker compose -f api-dev.yml up db db_admin redis -d
```

### Running the Frontend

To run the frontend application:

```bash
cd frontend
npm install  # Install dependencies if not already installed
npm run dev
```

The frontend will be available at `http://localhost:5173`.

The API will be available at `http://localhost:8000` (or `http://localhost:9024` if using the custom command).

### Testing

To run tests with coverage reports (HTML and Terminal):

```bash
cd fastapi
pytest --cov=. --cov-report=html --cov-report=term-missing
```

### API Documentation

Once the application is running, you can access the interactive API documentation at:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

- **Authentication**:
    - `POST /auth/login`: Authenticate user and receive access/refresh tokens.
    - `POST /auth/logout`: Revoke current access token.
    - `POST /auth/token/refresh`: Get a new access token using a refresh token.
    - `GET /auth/token/validate`: Check if a token is valid.

- **User Management**:
    - `POST /user/`: Create a new user.
    - `GET /user/`: List users.
    - `GET /user/{id}`: Get user details.

## Development Setup (Vagrant/Docker)

If you prefer using Vagrant and Docker for a consistent development environment:

1.  **Start Vagrant:**

    ```bash
    vagrant up
    ```

2.  **Reload Vagrant (after first up):**

    ```bash
    vagrant reload
    ```

3.  **SSH into Vagrant:**

    ```bash
    vagrant ssh <id>
    ```

See `instrucciones.txt` for more detailed Vagrant and Docker commands, including database backups and schema generation.

## Project Structure

```
FaustoAuth/
├── fastapi/              # Main application code
│   ├── auth/             # Authentication logic (routers, services, models)
│   ├── config/           # Configuration settings
│   ├── fausto/           # Core utilities and wrappers
│   └── run.py            # Application entry point
├── docker/               # Docker configuration files
└── ...
```

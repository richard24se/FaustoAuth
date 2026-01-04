"""Main application file for the Fausto Auth FastAPI service.

This file initializes the FastAPI application, configures middleware,
includes all the API routers, and sets up logging and event handlers.
"""

import logging
from contextlib import asynccontextmanager
from logging.config import dictConfig

from auth.router import (
    router_audit,
    router_audit_type,
    router_auth,
    router_object,
    router_object_type,
    router_permission,
    router_permission_type,
    router_role,
    router_role_permission,
    router_tenant,
    router_user,
)
from config.databases import (  # Import AsyncSessionFactory
    AsyncSessionFactory,
    async_engine,
    async_redis_pool,
    async_token_store,
)
from config.settings import settings
from fausto import ControllerError
from fausto.exceptions import controller_error_handler
from middleware.exception_handler import GlobalExceptionMiddleware
from middleware.tenant import TenantMiddleware
from sqlalchemy import text  # Added import
from starlette.exceptions import HTTPException as StarletteHTTPException

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# --- OpenAPI Metadata ---
tags_metadata = [
    {"name": "Authentication", "description": "User login, logout, and token management."},
    {"name": "Users", "description": "Operations to manage users."},
    {"name": "Roles", "description": "Manage user roles."},
    {"name": "Permissions", "description": "Manage system permissions."},
    {
        "name": "Role Permissions",
        "description": "View permissions associated with roles.",
    },
    {"name": "Permission Types", "description": "Manage types of permissions (e.g., read, write)."},
    {"name": "Objects", "description": "Manage system objects that can be permissioned."},
    {"name": "Object Types", "description": "Manage types of objects (e.g., page, component)."},
    {"name": "Audit", "description": "View the audit trail of user actions."},
    {"name": "Audit Types", "description": "Manage the types of audit events."},
]


# --- Application Lifespan Events ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles application startup and shutdown events.

    Args:
        app (FastAPI): The FastAPI application instance.
    """
    # Startup
    logging.info("--- Starting Fausto Auth Service ---")
    logging.info("Connecting to database and Redis...")
    try:
        # Test database connection
        async with AsyncSessionFactory() as session:  # Use AsyncSessionFactory directly
            await session.execute(text("SELECT 1"))  # Await execute
        logging.info("Database connection successful.")
        # Test Redis connection
        await async_token_store.ping()
        logging.info("Redis connection successful.")
    except Exception as e:
        logging.critical("Failed to connect to database or Redis on startup: %s", e)

    yield

    # Shutdown
    logging.info("--- Shutting down Fausto Auth Service ---")
    await async_engine.dispose()  # Dispose of the async engine
    await async_redis_pool.disconnect()
    logging.info("Connections closed.")


# --- FastAPI Application Initialization ---
app = FastAPI(
    title="Fausto Auth API",
    description="Authentication and authorization service for the Fausto platform.",
    version="1.0.0",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)

app.add_exception_handler(ControllerError, controller_error_handler)


# --- Middleware ---
app.add_middleware(GlobalExceptionMiddleware)
app.add_middleware(TenantMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Custom Exception Handler ---
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Custom handler to ensure all HTTP exceptions return a consistent JSON format.

    Args:
        request (Request): The incoming request.
        exc (StarletteHTTPException): The exception that occurred.

    Returns:
        JSONResponse: A JSON response with consistent error format.
    """
    content = {"error": True, "message": exc.detail, "data": None}
    if isinstance(exc.detail, dict):
        # If the detail is already a dict, use it as the base
        content = {**content, **exc.detail}

    return JSONResponse(content=content, status_code=exc.status_code)


# --- API Routers ---
app.include_router(router_auth)
app.include_router(router_user)
app.include_router(router_role)
app.include_router(router_role_permission)
app.include_router(router_permission)
app.include_router(router_permission_type)
app.include_router(router_object)
app.include_router(router_object_type)
app.include_router(router_audit)
app.include_router(router_audit_type)
app.include_router(router_tenant)


# --- Root Endpoint ---
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint providing a welcome message.

    Returns:
        dict: A dictionary with a welcome message.
    """
    return {"message": "Welcome to the Fausto Auth API"}


# --- Logging Configuration ---
LOG_LEVEL = "DEBUG" if settings.DEBUG else "INFO"
LOG_FORMAT = (
    "[%(asctime)s] %(levelname)s in %(module)s:%(lineno)d - %(message)s"
    if settings.DEBUG
    else "[%(asctime)s] %(levelname)s - %(message)s"
)

dictConfig(
    {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": LOG_FORMAT,
                "datefmt": "%Y-%m-%d %H:%M:%S",
            }
        },
        "handlers": {
            "default": {
                "class": "logging.StreamHandler",
                "formatter": "default",
                "stream": "ext://sys.stdout",
            }
        },
        "root": {"level": LOG_LEVEL, "handlers": ["default"]},
    }
)

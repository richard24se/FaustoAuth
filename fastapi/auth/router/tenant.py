from typing import Any, List

from auth.handlers.jwt import JWTBearer
from auth.model.pydantic import TenantCreate, TenantOut, TenantUpdate
from auth.service.tenant import TenantService
from config.databases import get_async_db
from fausto.fapi import Response
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/tenant",
    tags=["Tenants"],
    dependencies=[Depends(JWTBearer(scopes=[]))],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=Response, summary="List all tenants")
async def list_tenants(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_async_db),
) -> Any:
    """Retrieve all tenants."""
    try:
        tenant_service = TenantService(session)
        tenants = await tenant_service.get_multi(skip=skip, limit=limit)
        return Response(message="Found", data=tenants)
    except ControllerError as e:
        raise e.exception()


@router.post("/", response_model=Response, summary="Create a tenant")
async def create_tenant(
    tenant_in: TenantCreate,
    session: AsyncSession = Depends(get_async_db),
    token: str = Depends(JWTBearer(scopes=["Super Admin"])),
) -> Any:
    """Create new tenant."""
    try:
        tenant_service = TenantService(session)
        tenant = await tenant_service.create(obj_in=tenant_in)
        return Response(message="Created successful!", data=tenant)
    except ControllerError as e:
        raise e.exception()


@router.put("/{tenant_id}", response_model=Response, summary="Update a tenant")
async def update_tenant(
    tenant_id: int,
    tenant_in: TenantUpdate,
    session: AsyncSession = Depends(get_async_db),
    token: str = Depends(JWTBearer(scopes=["Super Admin"])),
) -> Any:
    """Update a tenant."""
    try:
        tenant_service = TenantService(session)
        tenant = await tenant_service.update(id=tenant_id, obj_in=tenant_in)
        return Response(message="Update successful!", data=tenant)
    except ControllerError as e:
        raise e.exception()


@router.get("/{tenant_id}", response_model=Response, summary="Get a tenant")
async def get_tenant(
    tenant_id: int,
    session: AsyncSession = Depends(get_async_db),
) -> Any:
    """Get tenant by ID."""
    try:
        tenant_service = TenantService(session)
        tenant = await tenant_service.get(id=tenant_id)
        return Response(message="Found", data=tenant)
    except ControllerError as e:
        raise e.exception()


@router.delete("/{tenant_id}", response_model=Response, summary="Delete a tenant")
async def delete_tenant(
    tenant_id: int,
    session: AsyncSession = Depends(get_async_db),
    token: str = Depends(JWTBearer(scopes=["Super Admin"])),
) -> Any:
    """Delete a tenant."""
    try:
        tenant_service = TenantService(session)
        data = await tenant_service.remove(id=tenant_id)
        return Response(message="Deleted successful!", data=data)
    except ControllerError as e:
        raise e.exception()

router_tenant = router

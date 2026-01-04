from typing import Any

from auth.handlers.jwt import JWTBearer
from auth.model.pydantic import TenantCreate, TenantUpdate
from auth.service.tenant import TenantService
from config.databases import get_async_db
from fausto import ControllerError
from fausto.fapi import Response
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends

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
    token: str = Depends(JWTBearer(scopes=[])),
) -> Any:
    """Retrieve all tenants."""
    try:
        from fausto.jwt import decode_auth_token

        payload = decode_auth_token(token)
        if isinstance(payload, str):
            raise ControllerError(payload, status_code=401)

        scopes = payload.get("scope", "").split()
        user_tenant_id = payload.get("tenant_id")

        tenant_service = TenantService(session)

        # Scoped access logic
        if "super-god" in scopes:
            tenants = await tenant_service.get_multi(skip=skip, limit=limit)
        elif user_tenant_id:
            # Only return the user's tenant
            tenant = await tenant_service.get(id=user_tenant_id)
            tenants = [tenant] if tenant else []
        else:
            tenants = []

        return Response(message="Found", data=tenants)
    except ControllerError as e:
        raise e.exception()


@router.post("/", response_model=Response, status_code=201, summary="Create a tenant")
async def create_tenant(
    tenant_in: TenantCreate,
    session: AsyncSession = Depends(get_async_db),
    token: str = Depends(JWTBearer(scopes=["super-god"])),
) -> Any:
    """Create new tenant."""
    try:
        tenant_service = TenantService(session)
        tenant = await tenant_service.create(obj_in=tenant_in)
        return Response(message="Created successful!", data=tenant)
    except ControllerError as e:
        raise e


@router.put("/{tenant_id}", response_model=Response, summary="Update a tenant")
async def update_tenant(
    tenant_id: int,
    tenant_in: TenantUpdate,
    session: AsyncSession = Depends(get_async_db),
    token: str = Depends(JWTBearer(scopes=["super-god"])),
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
    token: str = Depends(JWTBearer(scopes=[])),
) -> Any:
    """Get tenant by ID."""
    try:
        from fausto.jwt import decode_auth_token

        payload = decode_auth_token(token)
        if isinstance(payload, str):
            raise ControllerError(payload, status_code=401)

        scopes = payload.get("scope", "").split()
        user_tenant_id = payload.get("tenant_id")

        if "super-god" not in scopes:
            if not user_tenant_id or user_tenant_id != tenant_id:
                raise ControllerError("Not authorized to access this tenant", status_code=403)

        tenant_service = TenantService(session)
        tenant = await tenant_service.get(id=tenant_id)
        return Response(message="Found", data=tenant)
    except ControllerError as e:
        raise e.exception()


@router.delete("/{tenant_id}", response_model=Response, summary="Delete a tenant")
async def delete_tenant(
    tenant_id: int,
    session: AsyncSession = Depends(get_async_db),
    token: str = Depends(JWTBearer(scopes=["super-god"])),
) -> Any:
    """Delete a tenant."""
    try:
        tenant_service = TenantService(session)
        data = await tenant_service.remove(id=tenant_id)
        return Response(message="Deleted successful!", data=data)
    except ControllerError as e:
        raise e.exception()


router_tenant = router

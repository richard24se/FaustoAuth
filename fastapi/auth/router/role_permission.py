from auth.handlers import JWTBearer
from auth.service.role_permission import RolePermissionService
from config.databases import get_async_db
from fausto.fapi import Response
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/role_permission",
    tags=["Role Permissions"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


async def get_role_permission_service(
    s: AsyncSession = Depends(get_async_db),
) -> RolePermissionService:
    return RolePermissionService(s)


@router.get(
    "/",
    response_model=Response,
    summary="Get all permissions for a role, grouped by object",
)
async def read_role_permission(
    role_id: int,
    service: RolePermissionService = Depends(get_role_permission_service),
):
    """Retrieve all permissions associated with a specific role.

    The response groups the permissions by the system object they apply to.

    Args:
        role_id (int): The ID of the role.

    Returns:
        Response: A response object containing the permissions grouped by object.
    """
    permissions = await service.get_role_permission(role_id=role_id)
    if not permissions:
        return Response(message="Not found", data=[])
    return Response(message="Found", data=permissions)


router_role_permission = router
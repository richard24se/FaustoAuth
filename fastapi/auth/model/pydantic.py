"""
Pydantic Models for API Data Transfer Objects.

This module defines Pydantic models used for request and response payloads
in the FastAPI application. These models are manually defined to provide
explicit control over data validation and serialization, separate from
the SQLAlchemy ORM models.
"""

from __future__ import annotations  # For forward references
from typing import List, Optional

from pydantic import BaseModel, Field


# --- Base Models (common fields) ---


class AuditTypeBase(BaseModel):
    name: str = Field(..., max_length=50)


class ObjectTypeBase(BaseModel):
    name: str = Field(..., max_length=50)


class PermissionTypeBase(BaseModel):
    name: str = Field(..., max_length=50)


class RoleBase(BaseModel):
    name: str
    display_name: Optional[str] = Field(None, max_length=50)


class ObjectBase(BaseModel):
    name: str
    display_name: Optional[str] = None
    id_object_type: int


class UserBase(BaseModel):
    username: str
    names: Optional[str] = None
    surnames: Optional[str] = None
    email: str
    is_active: bool = True
    id_role: int


class PermissionBase(BaseModel):
    name: str = Field(..., max_length=50)
    id_permission_type: int
    id_object: int


class AuditBase(BaseModel):
    data: Optional[str] = None
    input: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: Optional[str] = None
    id_user: int
    id_audit_type: int


# --- Create Models (for POST requests) ---


class AuditTypeCreate(AuditTypeBase):
    pass


class ObjectTypeCreate(ObjectTypeBase):
    pass


class PermissionTypeCreate(PermissionTypeBase):
    pass


class RoleCreate(RoleBase):
    permissions: List[int] = []


class ObjectCreate(ObjectBase):
    pass


class UserCreate(UserBase):
    password: str


class PermissionCreate(PermissionBase):
    pass


class AuditCreate(AuditBase):
    pass


# --- Update Models (for PUT/PATCH requests) ---


class AuditTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)


class ObjectTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)


class PermissionTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = Field(None, max_length=50)
    permissions: Optional[List[int]] = None


class ObjectUpdate(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = None
    id_object_type: Optional[int] = None


class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    names: Optional[str] = None
    surnames: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None
    id_role: Optional[int] = None


class PermissionUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)
    id_permission_type: Optional[int] = None
    id_object: Optional[int] = None


class AuditUpdate(BaseModel):
    data: Optional[str] = None
    input: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: Optional[str] = None
    id_user: Optional[int] = None
    id_audit_type: Optional[int] = None


# --- Output Models (for GET responses) ---
# These include 'id' and can represent nested relationships.


class AuditTypeOut(AuditTypeBase):
    id: int

    class Config:
        orm_mode = True  # Enable ORM mode for SQLAlchemy compatibility


class ObjectTypeOut(ObjectTypeBase):
    id: int

    class Config:
        orm_mode = True


class PermissionTypeOut(PermissionTypeBase):
    id: int

    class Config:
        orm_mode = True


class RoleOut(RoleBase):
    id: int

    class Config:
        orm_mode = True


class ObjectOut(ObjectBase):
    id: int
    object_type: Optional[ObjectTypeOut] = None  # Nested relationship

    class Config:
        orm_mode = True


class UserOut(UserBase):
    id: int
    role: Optional[RoleOut] = None  # Nested relationship

    class Config:
        orm_mode = True


class AuditOut(AuditBase):
    id: int
    user: Optional[UserOut] = None  # Nested relationship
    audit_type: Optional[AuditTypeOut] = None  # Nested relationship

    class Config:
        orm_mode = True


class PermissionOut(PermissionBase):
    id: int
    permission_type: Optional[PermissionTypeOut] = None  # Nested relationship
    object: Optional[ObjectOut] = None  # Nested relationship

    class Config:
        orm_mode = True


# --- Custom Pydantic Models for specific API interactions ---


class LoginCredentials(BaseModel):
    """Request model for the /login endpoint."""

    username: str
    password: str


class TokenResponse(BaseModel):
    """Response model for successful login."""

    access_token: str
    refresh_token: Optional[str] = None
    id: int
    username: str
    names: Optional[str] = None
    surnames: Optional[str] = None
    email: Optional[str] = None
    id_role: int

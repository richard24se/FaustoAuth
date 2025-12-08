# coding: utf-8
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import BigInteger, DateTime, ForeignKey, SmallInteger, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# All tables in this model will be created in the 'auth' schema.
SCHEMA = "auth"


class Base(DeclarativeBase):
    """Base class for all declarative models."""
    pass


metadata = Base.metadata


class AuditType(Base):
    """Represents the type of an audit event (e.g., 'login', 'update')."""

    __tablename__ = "audit_type"
    __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    created_date: Mapped[datetime] = mapped_column(
        DateTime(True), server_default=func.now(), nullable=False
    )
    modificated_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(True), onupdate=func.now()
    )

    audits: Mapped[List["Audit"]] = relationship(back_populates="audit_type")


class ObjectType(Base):
    """Represents the type of an object (e.g., 'page', 'component')."""

    __tablename__ = "object_type"
    __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    created_date: Mapped[datetime] = mapped_column(
        DateTime(True), server_default=func.now(), nullable=False
    )
    modificated_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(True), onupdate=func.now()
    )

    objects: Mapped[List["Object"]] = relationship(back_populates="object_type")


class PermissionType(Base):
    """Represents the type of a permission (e.g., 'read', 'write')."""

    __tablename__ = "permission_type"
    __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    created_date: Mapped[datetime] = mapped_column(
        DateTime(True), server_default=func.now(), nullable=False
    )
    modificated_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(True), onupdate=func.now()
    )

    permissions: Mapped[List["Permission"]] = relationship(
        back_populates="permission_type"
    )


class Role(Base):
    """Represents a user role (e.g., 'admin', 'viewer')."""

    __tablename__ = "role"
    __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    display_name: Mapped[Optional[str]] = mapped_column(String(50))
    created_date: Mapped[datetime] = mapped_column(
        DateTime(True), server_default=func.now(), nullable=False
    )
    modificated_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(True), onupdate=func.now()
    )

    users: Mapped[List["User"]] = relationship(back_populates="role")
    role_permissions: Mapped[List["RolePermission"]] = relationship(
        back_populates="role"
    )


class Object(Base):
    """Represents a system object that can have permissions applied to it."""

    __tablename__ = "object"
    __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    display_name: Mapped[Optional[str]] = mapped_column(Text)
    id_object_type: Mapped[int] = mapped_column(
        ForeignKey(f"{SCHEMA}.object_type.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    created_date: Mapped[datetime] = mapped_column(
        DateTime(True), server_default=func.now(), nullable=False
    )
    modificated_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(True), onupdate=func.now()
    )

    object_type: Mapped["ObjectType"] = relationship(back_populates="objects")
    permissions: Mapped[List["Permission"]] = relationship(back_populates="object")


class User(Base):
    """Represents an application user."""

    __tablename__ = "user"
    __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    username: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    password: Mapped[str] = mapped_column(Text, nullable=False)
    names: Mapped[Optional[str]] = mapped_column(Text)
    surnames: Mapped[Optional[str]] = mapped_column(Text)
    # email: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    # is_active: Mapped[bool] = mapped_column(server_default="true", nullable=False)
    id_role: Mapped[int] = mapped_column(
        ForeignKey(f"{SCHEMA}.role.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    created_date: Mapped[datetime] = mapped_column(
        DateTime(True), server_default=func.now(), nullable=False
    )
    modificated_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(True), onupdate=func.now()
    )

    role: Mapped["Role"] = relationship(back_populates="users")
    audits: Mapped[List["Audit"]] = relationship(back_populates="user")


class Audit(Base):
    """Represents an audit trail for user actions."""

    __tablename__ = "audit"
    __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    data: Mapped[Optional[str]] = mapped_column(Text)
    input: Mapped[Optional[str]] = mapped_column(Text)
    id_user: Mapped[int] = mapped_column(
        ForeignKey(f"{SCHEMA}.user.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    id_audit_type: Mapped[int] = mapped_column(
        ForeignKey(f"{SCHEMA}.audit_type.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    created_date: Mapped[datetime] = mapped_column(
        DateTime(True), server_default=func.now(), nullable=False
    )
    modificated_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(True), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="audits")
    audit_type: Mapped["AuditType"] = relationship(back_populates="audits")


class Permission(Base):
    """Represents a specific permission in the system."""

    __tablename__ = "permission"
    __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    id_permission_type: Mapped[int] = mapped_column(
        ForeignKey(
            f"{SCHEMA}.permission_type.id", ondelete="RESTRICT", onupdate="CASCADE"
        ),
        nullable=False,
    )
    id_object: Mapped[int] = mapped_column(
        ForeignKey(f"{SCHEMA}.object.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    created_date: Mapped[datetime] = mapped_column(
        DateTime(True), server_default=func.now(), nullable=False
    )
    modificated_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(True), onupdate=func.now()
    )

    permission_type: Mapped["PermissionType"] = relationship(
        back_populates="permissions"
    )
    object: Mapped["Object"] = relationship(back_populates="permissions")
    role_permissions: Mapped[List["RolePermission"]] = relationship(
        back_populates="permission"
    )


class RolePermission(Base):
    """Association table linking Roles to Permissions."""

    __tablename__ = "role_permission"
    __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    id_role: Mapped[int] = mapped_column(
        ForeignKey(f"{SCHEMA}.role.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
    )
    id_permission: Mapped[int] = mapped_column(
        ForeignKey(f"{SCHEMA}.permission.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
    )
    created_date: Mapped[datetime] = mapped_column(
        DateTime(True), server_default=func.now(), nullable=False
    )

    role: Mapped["Role"] = relationship(back_populates="role_permissions")
    permission: Mapped["Permission"] = relationship(
        back_populates="role_permissions"
    )
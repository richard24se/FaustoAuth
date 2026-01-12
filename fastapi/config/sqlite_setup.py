import logging
from datetime import datetime

import pytz
from auth.model.models import (
    AuditType,
    Base,
    Object,
    ObjectType,
    Permission,
    PermissionType,
    Role,
    RolePermission,
    Tenant,
    User,
)
from config.databases import AsyncSessionFactory, async_engine

# from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def init_sqlite_db():
    """Initializes the SQLite database with schema and seed data."""
    logging.info("Initializing SQLite database...")

    # 1. Create Tables
    try:
        async with async_engine.begin() as conn:
            # schema_translate_map in engine options handles "auth." prefix removal
            await conn.run_sync(Base.metadata.create_all)
        logging.info("SQLite tables created.")
    except Exception as e:
        logging.exception("Failed to create SQLite tables:")
        raise e

    # 2. Seed Data
    async with AsyncSessionFactory() as session:
        if await is_seeded(session):
            logging.info("SQLite database already seeded.")
            return

        logging.info("Seeding SQLite database from 2-data.sql content...")
        await seed_data(session)
        logging.info("SQLite database seeded successfully.")


async def is_seeded(session: AsyncSession) -> bool:
    """Checks if the database is already seeded by counting tenants."""
    from sqlalchemy import select

    result = await session.execute(select(Tenant))
    return len(result.scalars().all()) > 0


async def seed_data(session: AsyncSession):
    """Seeds the database with initial data."""

    # Dates
    fixed_date = datetime(2020, 1, 1, 0, 0, 0, tzinfo=pytz.UTC)
    fixed_date_role = datetime(2020, 6, 25, 1, 53, 25, 471654, tzinfo=pytz.UTC)
    fixed_date_user = datetime(2020, 6, 25, 2, 14, 50, 367150, tzinfo=pytz.UTC)

    # 1. Tenant
    tenant = Tenant(id=1, name="Default Tenant", slug="default-tenant", is_active=True, created_date=fixed_date)
    session.add(tenant)
    await session.flush()  # Ensure ID is available if needed, though we set it explicitly

    # 2. Audit Types
    audit_types = [
        (1, "LOGIN"),
        (2, "LOGOUT"),
        (3, "CREATE"),
        (4, "UPDATE"),
        (5, "DELETE"),
        (6, "VIEW"),
        (7, "EXPORT"),
        (8, "IMPORT"),
        (9, "DOWNLOAD"),
        (10, "UPLOAD"),
        (11, "ARCHIVE"),
        (12, "RESTORE"),
    ]
    for aid, name in audit_types:
        session.add(AuditType(id=aid, name=name, created_date=fixed_date))

    # 3. Role
    role = Role(id=1, name="Admin", display_name="Administrator", tenant_id=1, created_date=fixed_date_role)
    session.add(role)

    # 4. Users
    # Note: Password in SQL is "$admin" and "1234567".
    # If using hashing, these should be hashed. Assuming simpler dev setup for now or plain text supported in dev.
    user_admin = User(
        id=2,
        username="admin@faustoauth.app",
        password="$admin",
        names="FaustoAuth",
        surnames="Administrator",
        tenant_id=1,
        id_role=1,
        created_date=fixed_date_user,
    )
    user_test = User(
        id=3,
        username="test@faustoauth.app",
        password="1234567",
        names="Test",
        surnames="Test",
        tenant_id=1,
        id_role=1,
        created_date=fixed_date_user,
    )
    session.add(user_admin)
    session.add(user_test)

    # 5. Object Types
    object_types = [
        (1, "web"),
        (2, "mobile"),
        (3, "api"),
        (4, "database"),
        (5, "server"),
        (6, "report"),
        (7, "dashboard"),
        (8, "document"),
        (9, "file"),
        (10, "endpoint"),
        (11, "module"),
        (12, "router"),
        (13, "service"),
        (14, "controller"),
        (15, "component"),
        (16, "page"),
        (17, "widget"),
        (18, "form"),
        (19, "table"),
        (20, "modal"),
    ]
    for oid, name in object_types:
        session.add(ObjectType(id=oid, name=name, created_date=fixed_date_role))  # Using role date as approx

    # 6. Object
    obj = Object(
        id=1,
        name="userControl",
        display_name="User control",
        id_object_type=1,
        tenant_id=1,
        created_date=datetime(2020, 6, 25, 1, 49, 55, 673365, tzinfo=pytz.UTC),
    )
    obj_everything = Object(
        id=2,
        name="everything",
        display_name="Everything",
        id_object_type=11,
        tenant_id=1,
        created_date=datetime(2020, 6, 25, 1, 49, 55, 673365, tzinfo=pytz.UTC),
    )
    session.add(obj)
    session.add(obj_everything)

    # 7. Permission Type
    perm_type = PermissionType(
        id=1, name="total control", created_date=datetime(2020, 6, 25, 1, 43, 28, 679511, tzinfo=pytz.UTC)
    )
    session.add(perm_type)
    await session.flush()

    # 8. Permission
    perm = Permission(
        id=1,
        name="User Manager",
        id_permission_type=1,
        id_object=1,
        tenant_id=1,
        created_date=datetime(2020, 6, 25, 1, 52, 21, 867896, tzinfo=pytz.UTC),
    )
    perm_super = Permission(
        id=2,
        name="Super God",
        id_permission_type=1,
        id_object=2,
        tenant_id=1,
        created_date=datetime(2020, 6, 25, 1, 52, 21, 867896, tzinfo=pytz.UTC),
    )
    session.add(perm)
    session.add(perm_super)
    await session.flush()

    # 9. Role Permission
    role_perm = RolePermission(
        id=1, id_permission=1, id_role=1, created_date=datetime(2020, 6, 25, 1, 53, 52, 809224, tzinfo=pytz.UTC)
    )
    role_perm_super = RolePermission(
        id=2, id_permission=2, id_role=1, created_date=datetime(2020, 6, 25, 1, 53, 52, 809224, tzinfo=pytz.UTC)
    )
    session.add(role_perm)
    session.add(role_perm_super)

    await session.commit()

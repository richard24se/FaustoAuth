import io
import json
import logging
import zipfile
from typing import Any, Dict, List, Type

import dateutil.parser
from auth.model.models import (
    Audit,
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
from config.settings import settings
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.ext.asyncio import AsyncSession

# Order matters for foreign key constraints
MODELS_ORDER = [Tenant, AuditType, ObjectType, PermissionType, Role, User, Object, Permission, RolePermission, Audit]


class BackupService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def export_data(self) -> io.BytesIO:
        """Exports all data from models into a ZIP file containing JSONs."""
        buffer = io.BytesIO()

        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for model in MODELS_ORDER:
                model_name = model.__tablename__
                data = await self._fetch_model_data(model)
                json_content = json.dumps(data, default=str, indent=2)
                zip_file.writestr(f"{model_name}.json", json_content)

        buffer.seek(0)
        return buffer

    async def import_data(self, zip_content: bytes):
        """Imports data from a ZIP file, acting as a restore/merge."""
        buffer = io.BytesIO(zip_content)

        with zipfile.ZipFile(buffer, "r") as zip_file:
            all_files = zip_file.namelist()

            # Process strictly in order to satisfy FKs
            for model in MODELS_ORDER:
                model_name = model.__tablename__
                target_filename = f"{model_name}.json"

                # Find the file in the zip (handles potential folder prefixes)
                found_filename = next(
                    (f for f in all_files if f == target_filename or f.endswith(f"/{target_filename}")), None
                )

                if found_filename:
                    logging.info(f"Restoring table: {model_name} from {found_filename}")
                    content = zip_file.read(found_filename)
                    data = json.loads(content)
                    if data:
                        # Convert datetime strings back to datetime objects
                        for record in data:
                            for col in model.__table__.columns:
                                if col.name in record and record[col.name] is not None:
                                    if str(col.type).startswith("DATETIME") or str(col.type).startswith("DATE"):
                                        if isinstance(record[col.name], str):
                                            try:
                                                record[col.name] = dateutil.parser.parse(record[col.name])
                                            except (ValueError, TypeError):
                                                logging.warning(
                                                    f"Could not parse datetime for {col.name}: {record[col.name]}"
                                                )

                        try:
                            await self._upsert_data(model, data)
                            logging.info(f"Successfully restored table: {model_name} with {len(data)} records.")
                        except Exception as e:
                            logging.error(f"Failed to restore table {model_name}: {e}")
                            # raise e  # Optional: raising will stop the entire restore. Logging allows partial restore.
                            # User asked to "see if every tables were updated well", so logging errors is key.
                else:
                    logging.warning(f"File {target_filename} not found in backup. Skipping.")

    async def _fetch_model_data(self, model: Type[Base]) -> List[Dict[str, Any]]:
        """Fetches all records for a model and converts to dict."""
        result = await self.session.execute(select(model))
        records = result.scalars().all()
        return [self._model_to_dict(record) for record in records]

    def _model_to_dict(self, obj: Base) -> Dict[str, Any]:
        """Converts SQLAlchemy model instance to dictionary."""
        return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

    async def _upsert_data(self, model: Type[Base], data: List[Dict[str, Any]]):
        """Upserts data into the database."""
        if not data:
            return

        table = model.__table__
        stmt = None
        if settings.LITTLE_DATABASE:
            # SQLite upsert
            stmt = sqlite_insert(table).values(data)
            stmt = stmt.on_conflict_do_update(
                index_elements=[table.c.id],  # Assuming 'id' is always PK
                set_={c.name: c for c in stmt.excluded if c.name != "created_date"},
            )
        else:
            # PostgreSQL upsert
            stmt = pg_insert(table).values(data)
            stmt = stmt.on_conflict_do_update(
                index_elements=[table.c.id], set_={c.name: c for c in stmt.excluded if c.name != "created_date"}
            )

        await self.session.execute(stmt)

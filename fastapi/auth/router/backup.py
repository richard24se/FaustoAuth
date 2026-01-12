from auth.service.backup import BackupService
from config.databases import get_async_db
from fausto.exceptions import ControllerError
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import StreamingResponse

router_backup = APIRouter(prefix="/backup", tags=["System Backup"])


@router_backup.get("/download", response_class=StreamingResponse)
async def download_backup(db: AsyncSession = Depends(get_async_db)):
    """Downloads a full system backup as a ZIP file."""
    service = BackupService(db)
    try:
        backup_buffer = await service.export_data()
        return StreamingResponse(
            backup_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=fausto_auth_backup.zip"},
        )
    except Exception as e:
        raise ControllerError(f"Export failed: {str(e)}")


@router_backup.post("/restore")
async def restore_backup(file: UploadFile = File(...), db: AsyncSession = Depends(get_async_db)):
    """Restores system data from a backup ZIP file."""
    if not file.filename.endswith(".zip"):
        raise ControllerError("Invalid file type. Please upload a ZIP file.")

    service = BackupService(db)
    try:
        content = await file.read()
        await service.import_data(content)
        await db.commit()
        return {"message": "System restored successfully."}
    except Exception as e:
        import logging

        logging.exception("Restore failed with error:")
        raise ControllerError(f"Restore failed: {str(e)}")

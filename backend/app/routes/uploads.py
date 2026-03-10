import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Query, UploadFile

from app.config import settings
from app.database import get_db
from app.models import (
    UploadListItem,
    UploadResponse,
    UploadsListResponse,
)
from app.pipeline.processor import run_pipeline

router = APIRouter()


@router.post("/upload")
async def upload_audio(
    file: UploadFile,
    background_tasks: BackgroundTasks,
) -> UploadResponse:
    upload_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    upload_dir = os.path.join(settings.UPLOAD_DIR, upload_id)
    os.makedirs(upload_dir, exist_ok=True)

    filename = file.filename or "recording.webm"
    file_path = os.path.join(upload_dir, filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    file_size = len(content)

    db = await get_db()
    try:
        await db.execute(
            """INSERT INTO uploads
               (id, original_filename, file_path, file_size, status, stage,
                total_stages, created_at, updated_at)
               VALUES (?, ?, ?, ?, 'queued', 0, 4, ?, ?)""",
            (upload_id, filename, file_path, file_size, now, now),
        )
        await db.commit()
    finally:
        await db.close()

    background_tasks.add_task(run_pipeline, upload_id)

    return UploadResponse(
        upload_id=upload_id,
        status="queued",
        created_at=now,
    )


@router.get("/uploads")
async def list_uploads(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> UploadsListResponse:
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            """SELECT id, original_filename, status, stage, total_stages,
                      fingerprint, file_size, created_at, processing_time_ms
               FROM uploads ORDER BY created_at DESC LIMIT ? OFFSET ?""",
            (limit, offset),
        )
        count_row = await db.execute_fetchall("SELECT COUNT(*) FROM uploads")
        total = count_row[0][0]
    finally:
        await db.close()

    uploads = [
        UploadListItem(
            upload_id=r[0],
            original_filename=r[1],
            status=r[2],
            stage=r[3],
            total_stages=r[4],
            fingerprint=r[5],
            file_size=r[6] or 0,
            created_at=r[7],
            processing_time_ms=r[8],
        )
        for r in rows
    ]

    return UploadsListResponse(uploads=uploads, total=total)

from fastapi import APIRouter, HTTPException

from app.database import get_db
from app.models import StatusResponse, UploadMetadata

router = APIRouter()


@router.get("/status/{upload_id}")
async def get_status(upload_id: str) -> StatusResponse:
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            """SELECT id, status, stage, total_stages, fingerprint,
                      error_message, file_size, duration_ms, sample_rate,
                      mime_type, original_filename, created_at, updated_at,
                      processing_time_ms
               FROM uploads WHERE id = ?""",
            (upload_id,),
        )
    finally:
        await db.close()

    if not rows:
        raise HTTPException(status_code=404, detail="Upload not found")

    r = rows[0]
    return StatusResponse(
        upload_id=r[0],
        status=r[1],
        stage=r[2],
        total_stages=r[3],
        fingerprint=r[4],
        error_message=r[5],
        metadata=UploadMetadata(
            file_size=r[6] or 0,
            duration_ms=r[7],
            sample_rate=r[8],
            mime_type=r[9],
            original_filename=r[10],
        ),
        created_at=r[11],
        updated_at=r[12],
        processing_time_ms=r[13],
    )

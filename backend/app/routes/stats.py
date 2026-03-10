from fastapi import APIRouter

from app.database import get_db
from app.models import StatsResponse

router = APIRouter()


@router.get("/stats")
async def get_stats() -> StatsResponse:
    db = await get_db()
    try:
        total_row = await db.execute_fetchall("SELECT COUNT(*) FROM uploads")
        total = total_row[0][0]

        status_rows = await db.execute_fetchall(
            "SELECT status, COUNT(*) FROM uploads GROUP BY status"
        )
        status_counts = {r[0]: r[1] for r in status_rows}

        avg_row = await db.execute_fetchall(
            """SELECT AVG(processing_time_ms)
               FROM uploads WHERE status = 'complete'"""
        )
        avg_time = avg_row[0][0]

        size_row = await db.execute_fetchall(
            "SELECT COALESCE(SUM(file_size), 0) FROM uploads"
        )
        total_size = size_row[0][0]

        time_rows = await db.execute_fetchall(
            """SELECT MIN(created_at), MAX(created_at) FROM uploads"""
        )
        oldest = time_rows[0][0]
        newest = time_rows[0][1]
    finally:
        await db.close()

    return StatsResponse(
        total_uploads=total,
        status_counts=status_counts,
        average_processing_time_ms=avg_time,
        total_file_size=total_size,
        oldest_upload=oldest,
        newest_upload=newest,
    )

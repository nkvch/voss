from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.database import get_db

router = APIRouter()


@router.get("/health")
async def health_check():
    db = await get_db()
    try:
        await db.execute("SELECT 1")
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception:
        return JSONResponse({"status": "unhealthy"}, status_code=503)
    finally:
        await db.close()

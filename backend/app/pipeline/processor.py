import asyncio
import logging
import random
import time
from datetime import datetime, timezone

import aiosqlite

from app.config import settings
from app.database import get_db
from app.pipeline.errors import PipelineError
from app.pipeline.stages import (
    completion_stage,
    extract_metadata_stage,
    fingerprint_stage,
    validate_stage,
)
from app.services.sse_manager import sse_manager

logger = logging.getLogger(__name__)

STAGES = [
    ("processing", validate_stage),
    ("extracting", extract_metadata_stage),
    ("hashing", fingerprint_stage),
    ("finalizing", completion_stage),
]


async def _update_status(
    db: aiosqlite.Connection,
    upload_id: str,
    **kwargs: object,
) -> None:
    kwargs["updated_at"] = datetime.now(timezone.utc).isoformat()
    sets = ", ".join(f"{k} = ?" for k in kwargs)
    vals = list(kwargs.values()) + [upload_id]
    await db.execute(f"UPDATE uploads SET {sets} WHERE id = ?", vals)
    await db.commit()


async def _run_with_retry(
    stage_fn,
    upload_id: str,
    db: aiosqlite.Connection,
) -> None:
    last_error = None
    for attempt in range(settings.MAX_RETRY_COUNT + 1):
        try:
            await stage_fn(upload_id, db)
            return
        except PipelineError as e:
            last_error = e
            if not e.retryable or attempt >= settings.MAX_RETRY_COUNT:
                raise
            wait = 2**attempt
            logger.warning(
                "Stage %s failed for %s (attempt %d), retrying in %ds: %s",
                e.stage,
                upload_id,
                attempt + 1,
                wait,
                e.message,
            )
            await db.execute(
                "UPDATE uploads SET retry_count = retry_count + 1 WHERE id = ?",
                (upload_id,),
            )
            await db.commit()
            await asyncio.sleep(wait)
    raise last_error  # type: ignore[misc]


async def run_pipeline(upload_id: str) -> None:
    db = await get_db()
    start_time = time.monotonic()

    try:
        now = datetime.now(timezone.utc).isoformat()
        await _update_status(db, upload_id, processing_started_at=now)

        for stage_num, (status_name, stage_fn) in enumerate(STAGES, 1):
            await _update_status(db, upload_id, status=status_name, stage=stage_num)

            await sse_manager.broadcast(
                {
                    "event": "status_update",
                    "upload_id": upload_id,
                    "status": status_name,
                    "stage": stage_num,
                    "total_stages": len(STAGES),
                    "fingerprint": None,
                    "processing_time_ms": None,
                }
            )

            delay = random.uniform(
                settings.STAGE_MIN_DELAY_S, settings.STAGE_MAX_DELAY_S
            )
            await asyncio.sleep(delay)

            await _run_with_retry(stage_fn, upload_id, db)

        elapsed_ms = int((time.monotonic() - start_time) * 1000)
        now = datetime.now(timezone.utc).isoformat()

        row = await db.execute_fetchall(
            "SELECT fingerprint FROM uploads WHERE id = ?", (upload_id,)
        )
        fingerprint = row[0][0] if row else None

        await _update_status(
            db,
            upload_id,
            status="complete",
            processing_completed_at=now,
            processing_time_ms=elapsed_ms,
        )

        await sse_manager.broadcast(
            {
                "event": "processing_complete",
                "upload_id": upload_id,
                "status": "complete",
                "stage": len(STAGES),
                "total_stages": len(STAGES),
                "fingerprint": fingerprint,
                "processing_time_ms": elapsed_ms,
            }
        )

        logger.info("Pipeline complete for %s in %dms", upload_id, elapsed_ms)

    except PipelineError as e:
        elapsed_ms = int((time.monotonic() - start_time) * 1000)
        now = datetime.now(timezone.utc).isoformat()

        await _update_status(
            db,
            upload_id,
            status="error",
            error_message=e.message,
            processing_completed_at=now,
            processing_time_ms=elapsed_ms,
        )

        await sse_manager.broadcast(
            {
                "event": "processing_error",
                "upload_id": upload_id,
                "status": "error",
                "stage": 0,
                "total_stages": len(STAGES),
                "fingerprint": None,
                "processing_time_ms": elapsed_ms,
            }
        )

        logger.error("Pipeline failed for %s: %s", upload_id, e.message)

    except Exception as e:
        elapsed_ms = int((time.monotonic() - start_time) * 1000)
        now = datetime.now(timezone.utc).isoformat()

        await _update_status(
            db,
            upload_id,
            status="error",
            error_message=str(e),
            processing_completed_at=now,
            processing_time_ms=elapsed_ms,
        )

        logger.exception("Unexpected error in pipeline for %s", upload_id)

    finally:
        await db.close()

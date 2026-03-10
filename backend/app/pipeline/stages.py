import hashlib
import logging
import os

import aiosqlite
import magic

from app.config import settings
from app.pipeline.errors import ValidationError

logger = logging.getLogger(__name__)


async def validate_stage(upload_id: str, db: aiosqlite.Connection) -> None:
    row = await db.execute_fetchall(
        "SELECT file_path, file_size FROM uploads WHERE id = ?", (upload_id,)
    )
    if not row:
        raise ValidationError(f"Upload {upload_id} not found in database")

    file_path = row[0][0]
    if not os.path.exists(file_path):
        raise ValidationError(f"File not found: {file_path}")

    file_size = os.path.getsize(file_path)
    if file_size == 0:
        raise ValidationError("File is empty")

    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise ValidationError(f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit")

    mime = magic.from_file(file_path, mime=True)
    allowed = [m.strip() for m in settings.ALLOWED_MIME_TYPES.split(",")]
    if mime not in allowed:
        raise ValidationError(f"Invalid MIME type: {mime}")

    await db.execute(
        "UPDATE uploads SET mime_type = ?, file_size = ? WHERE id = ?",
        (mime, file_size, upload_id),
    )
    await db.commit()
    logger.info(
        "Validation passed for %s, mime=%s, size=%d",
        upload_id,
        mime,
        file_size,
    )


async def extract_metadata_stage(upload_id: str, db: aiosqlite.Connection) -> None:
    row = await db.execute_fetchall(
        "SELECT file_path FROM uploads WHERE id = ?", (upload_id,)
    )
    file_path = row[0][0]
    file_size = os.path.getsize(file_path)

    duration_ms = None
    sample_rate = None

    try:
        from mutagen import File as MutagenFile

        audio = MutagenFile(file_path)
        if audio and audio.info:
            if hasattr(audio.info, "length") and audio.info.length:
                duration_ms = int(audio.info.length * 1000)
            if hasattr(audio.info, "sample_rate") and audio.info.sample_rate:
                sample_rate = audio.info.sample_rate
    except Exception:
        logger.debug("Could not extract audio metadata for %s", upload_id)

    await db.execute(
        """UPDATE uploads
           SET file_size = ?, duration_ms = ?, sample_rate = ?
           WHERE id = ?""",
        (file_size, duration_ms, sample_rate, upload_id),
    )
    await db.commit()
    logger.info(
        "Metadata extracted for %s: size=%d, duration=%s, rate=%s",
        upload_id,
        file_size,
        duration_ms,
        sample_rate,
    )


async def fingerprint_stage(upload_id: str, db: aiosqlite.Connection) -> None:
    row = await db.execute_fetchall(
        "SELECT file_path FROM uploads WHERE id = ?", (upload_id,)
    )
    file_path = row[0][0]

    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):
            sha256.update(chunk)
    fingerprint = sha256.hexdigest()

    await db.execute(
        "UPDATE uploads SET fingerprint = ? WHERE id = ?",
        (fingerprint, upload_id),
    )
    await db.commit()
    logger.info("Fingerprint for %s: %s", upload_id, fingerprint)


async def completion_stage(upload_id: str, db: aiosqlite.Connection) -> None:
    logger.info("Completion stage for %s", upload_id)

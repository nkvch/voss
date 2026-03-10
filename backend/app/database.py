import os

import aiosqlite

from app.config import settings

_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    duration_ms INTEGER,
    sample_rate INTEGER,
    status TEXT NOT NULL DEFAULT 'queued',
    stage INTEGER NOT NULL DEFAULT 0,
    total_stages INTEGER NOT NULL DEFAULT 4,
    fingerprint TEXT,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    processing_started_at TEXT,
    processing_completed_at TEXT,
    processing_time_ms INTEGER
)
"""


async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(settings.DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    return db


async def init_database() -> None:
    os.makedirs(os.path.dirname(settings.DATABASE_PATH), exist_ok=True)
    db = await get_db()
    try:
        await db.execute(_CREATE_TABLE)
        await db.commit()
    finally:
        await db.close()

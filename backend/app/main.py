import logging
import os
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_database
from app.logging_config import setup_logging
from app.routes import events, health, stats, status, uploads

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_database()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info("VOSS backend started")
    yield
    logger.info("VOSS backend shutting down")


app = FastAPI(
    title="VOSS API",
    description="Voice Operating Station System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = time.monotonic()
    response = await call_next(request)
    elapsed = (time.monotonic() - start) * 1000
    logger.info(
        "request",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": round(elapsed, 1),
        },
    )
    return response


app.include_router(health.router, tags=["health"])
app.include_router(uploads.router, prefix="/api", tags=["uploads"])
app.include_router(status.router, prefix="/api", tags=["status"])
app.include_router(stats.router, prefix="/api", tags=["stats"])
app.include_router(events.router, prefix="/api", tags=["events"])

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class UploadStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    EXTRACTING = "extracting"
    HASHING = "hashing"
    FINALIZING = "finalizing"
    COMPLETE = "complete"
    ERROR = "error"


class UploadResponse(BaseModel):
    upload_id: str
    status: UploadStatus
    created_at: datetime


class UploadMetadata(BaseModel):
    file_size: int
    duration_ms: Optional[int] = None
    sample_rate: Optional[int] = None
    mime_type: Optional[str] = None
    original_filename: str


class StatusResponse(BaseModel):
    upload_id: str
    status: UploadStatus
    stage: int
    total_stages: int
    fingerprint: Optional[str] = None
    error_message: Optional[str] = None
    metadata: UploadMetadata
    created_at: datetime
    updated_at: datetime
    processing_time_ms: Optional[int] = None


class UploadListItem(BaseModel):
    upload_id: str
    original_filename: str
    status: UploadStatus
    stage: int
    total_stages: int
    fingerprint: Optional[str] = None
    file_size: int
    created_at: datetime
    processing_time_ms: Optional[int] = None


class UploadsListResponse(BaseModel):
    uploads: list[UploadListItem]
    total: int


class StatsResponse(BaseModel):
    total_uploads: int
    status_counts: dict[str, int]
    average_processing_time_ms: Optional[float] = None
    total_file_size: int
    oldest_upload: Optional[datetime] = None
    newest_upload: Optional[datetime] = None

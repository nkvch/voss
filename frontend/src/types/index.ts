export type UploadStatus =
  | "queued"
  | "processing"
  | "extracting"
  | "hashing"
  | "finalizing"
  | "complete"
  | "error";

export interface UploadResponse {
  upload_id: string;
  status: UploadStatus;
  created_at: string;
}

export interface UploadMetadata {
  file_size: number;
  duration_ms: number | null;
  sample_rate: number | null;
  mime_type: string | null;
  original_filename: string;
}

export interface StatusResponse {
  upload_id: string;
  status: UploadStatus;
  stage: number;
  total_stages: number;
  fingerprint: string | null;
  error_message: string | null;
  metadata: UploadMetadata;
  created_at: string;
  updated_at: string;
  processing_time_ms: number | null;
}

export interface UploadListItem {
  upload_id: string;
  original_filename: string;
  status: UploadStatus;
  stage: number;
  total_stages: number;
  fingerprint: string | null;
  file_size: number;
  created_at: string;
  processing_time_ms: number | null;
}

export interface UploadsListResponse {
  uploads: UploadListItem[];
  total: number;
}

export interface StatsResponse {
  total_uploads: number;
  status_counts: Record<string, number>;
  average_processing_time_ms: number | null;
  total_file_size: number;
  oldest_upload: string | null;
  newest_upload: string | null;
}

export interface SSEEvent {
  event: string;
  upload_id: string;
  status: UploadStatus;
  stage: number;
  total_stages: number;
  fingerprint: string | null;
  processing_time_ms: number | null;
}

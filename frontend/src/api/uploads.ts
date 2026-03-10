import type {
  StatusResponse,
  StatsResponse,
  UploadResponse,
  UploadsListResponse,
} from "../types";
import { request } from "./client";

export async function uploadAudio(
  file: Blob,
  filename: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file, filename);
  return request<UploadResponse>("/api/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getStatus(uploadId: string): Promise<StatusResponse> {
  return request<StatusResponse>(`/api/status/${uploadId}`);
}

export async function getUploads(
  limit = 50,
  offset = 0
): Promise<UploadsListResponse> {
  return request<UploadsListResponse>(
    `/api/uploads?limit=${limit}&offset=${offset}`
  );
}

export async function getStats(): Promise<StatsResponse> {
  return request<StatsResponse>("/api/stats");
}

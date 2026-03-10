import { useCallback, useState } from "react";
import type { UploadListItem, UploadResponse } from "../types";
import { uploadAudio } from "../api/uploads";
import { useToast } from "./useToast";

export function useUpload(onComplete: (item: UploadListItem) => void) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const { showToast } = useToast();

  const upload = useCallback(
    async (audioBlob: Blob) => {
      setUploading(true);
      try {
        const filename = `recording-${Date.now()}.webm`;
        const res = await uploadAudio(audioBlob, filename);
        setResult(res);
        onComplete({
          upload_id: res.upload_id,
          original_filename: filename,
          status: res.status,
          stage: 0,
          total_stages: 4,
          fingerprint: null,
          file_size: audioBlob.size,
          created_at: res.created_at,
          processing_time_ms: null,
        });
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Upload failed",
          "error",
        );
      } finally {
        setUploading(false);
      }
    },
    [onComplete, showToast],
  );

  const resetUpload = useCallback(() => {
    setResult(null);
  }, []);

  return { uploading, uploadResult: result, upload, resetUpload };
}

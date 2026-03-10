import { useCallback, useEffect, useState } from "react";
import type { UploadListItem } from "../types";
import { getUploads } from "../api/uploads";
import { useToast } from "./useToast";
import { useSSE } from "./useSSE";

export function useUploads() {
  const [uploads, setUploads] = useState<UploadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchUploads = useCallback(async () => {
    try {
      const res = await getUploads();
      setUploads(res.uploads);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load uploads",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  useSSE((event) => {
    setUploads((prev) => {
      const exists = prev.some((u) => u.upload_id === event.upload_id);
      if (!exists) {
        fetchUploads();
        return prev;
      }
      return prev.map((u) =>
        u.upload_id === event.upload_id
          ? {
              ...u,
              status: event.status,
              stage: event.stage,
              fingerprint: event.fingerprint ?? u.fingerprint,
              processing_time_ms:
                event.processing_time_ms ?? u.processing_time_ms,
            }
          : u
      );
    });
  });

  const addUpload = useCallback((item: UploadListItem) => {
    setUploads((prev) => [item, ...prev]);
  }, []);

  return { uploads, loading, addUpload, refetch: fetchUploads };
}

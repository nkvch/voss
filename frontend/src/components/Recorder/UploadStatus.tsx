import { useEffect, useState } from "react";
import type { StatusResponse } from "../../types";
import { getStatus } from "../../api/uploads";
import { useSSE } from "../../hooks/useSSE";
import { ProgressBar } from "../common/ProgressBar";
import { StatusBadge } from "../common/StatusBadge";
import { Spinner } from "../common/Spinner";

export function UploadStatus({ uploadId }: { uploadId: string }) {
  const [status, setStatus] = useState<StatusResponse | null>(null);

  useEffect(() => {
    getStatus(uploadId).then(setStatus);
  }, [uploadId]);

  useSSE((event) => {
    if (event.upload_id === uploadId) {
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              status: event.status,
              stage: event.stage,
              fingerprint: event.fingerprint ?? prev.fingerprint,
              processing_time_ms:
                event.processing_time_ms ?? prev.processing_time_ms,
            }
          : prev
      );
    }
  });

  if (!status) return <Spinner />;

  return (
    <div className="space-y-3 p-4 rounded-lg border border-border bg-black/20">
      <div className="flex items-center justify-between">
        <span className="font-orbitron text-xs text-text-dim tracking-wider">
          UPLOAD STATUS
        </span>
        <StatusBadge status={status.status} />
      </div>

      <ProgressBar stage={status.stage} totalStages={status.total_stages} />

      {status.fingerprint && (
        <div className="space-y-1">
          <span className="font-orbitron text-[0.6rem] text-text-muted tracking-wider uppercase">
            Fingerprint
          </span>
          <code className="block text-xs font-space text-voss-green break-all bg-black/30 p-2 rounded">
            {status.fingerprint}
          </code>
        </div>
      )}

      {status.error_message && (
        <div className="text-sm text-voss-red bg-voss-red/5 border border-voss-red/20 p-3 rounded">
          {status.error_message}
        </div>
      )}
    </div>
  );
}

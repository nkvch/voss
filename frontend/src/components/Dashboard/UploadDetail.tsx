import { useEffect, useState } from "react";
import type { StatusResponse } from "../../types";
import { getStatus } from "../../api/uploads";
import { formatFileSize, formatMs } from "../../utils/format";
import { Spinner } from "../common/Spinner";

export function UploadDetail({ uploadId }: { uploadId: string }) {
  const [detail, setDetail] = useState<StatusResponse | null>(null);

  useEffect(() => {
    getStatus(uploadId).then(setDetail);
  }, [uploadId]);

  if (!detail)
    return (
      <tr>
        <td colSpan={6} className="p-0">
          <div className="flex items-center justify-center p-6 bg-panel border-t border-border">
            <Spinner />
          </div>
        </td>
      </tr>
    );

  return (
    <tr>
      <td colSpan={6} className="p-0">
        <div className="p-4 bg-panel border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted text-xs font-orbitron tracking-wider uppercase block mb-1">
                File Info
              </span>
              <div className="space-y-1 text-text-primary">
                <div>
                  Size: <span className="text-voss-cyan">{formatFileSize(detail.metadata.file_size)}</span>
                </div>
                <div>
                  MIME: <span className="text-voss-cyan">{detail.metadata.mime_type ?? "—"}</span>
                </div>
                <div>
                  Duration: <span className="text-voss-cyan">{detail.metadata.duration_ms ? `${detail.metadata.duration_ms}ms` : "—"}</span>
                </div>
                <div>
                  Sample Rate: <span className="text-voss-cyan">{detail.metadata.sample_rate ? `${detail.metadata.sample_rate}Hz` : "—"}</span>
                </div>
              </div>
            </div>
            <div>
              <span className="text-text-muted text-xs font-orbitron tracking-wider uppercase block mb-1">
                Processing
              </span>
              <div className="space-y-1 text-text-primary">
                <div>
                  Status: <span className="text-voss-green">{detail.status}</span>
                </div>
                <div>
                  Processing Time: <span className="text-voss-green">{formatMs(detail.processing_time_ms)}</span>
                </div>
                {detail.error_message && (
                  <div className="text-voss-red">Error: {detail.error_message}</div>
                )}
              </div>
            </div>
          </div>
          {detail.fingerprint && (
            <div className="mt-3">
              <span className="text-text-muted text-xs font-orbitron tracking-wider uppercase block mb-1">
                Fingerprint
              </span>
              <code className="text-xs font-space text-voss-green bg-black/30 p-2 rounded block break-all">
                {detail.fingerprint}
              </code>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

import { Fragment, useState } from "react";
import type { UploadListItem } from "../../types";
import { formatFileSize, formatMs, formatTimestamp, truncateId } from "../../utils/format";
import { ProgressBar } from "../common/ProgressBar";
import { Spinner } from "../common/Spinner";
import { StatusBadge } from "../common/StatusBadge";
import { UploadDetail } from "./UploadDetail";

export function UploadsTable({
  uploads,
  loading,
}: {
  uploads: UploadListItem[];
  loading: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) return <Spinner />;

  if (uploads.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted font-orbitron text-xs tracking-widest">
        NO TRANSMISSIONS RECORDED
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col className="w-28" />
          <col />
          <col className="w-28" />
          <col className="w-36" />
          <col className="w-24" />
          <col className="w-36" />
        </colgroup>
        <thead>
          <tr className="bg-panel">
            <th className="text-left p-3 font-orbitron text-[0.62rem] font-bold tracking-wider text-voss-green uppercase border-b border-border-bright">
              ID
            </th>
            <th className="text-left p-3 font-orbitron text-[0.62rem] font-bold tracking-wider text-voss-green uppercase border-b border-border-bright">
              File
            </th>
            <th className="text-left p-3 font-orbitron text-[0.62rem] font-bold tracking-wider text-voss-green uppercase border-b border-border-bright">
              Status
            </th>
            <th className="text-left p-3 font-orbitron text-[0.62rem] font-bold tracking-wider text-voss-green uppercase border-b border-border-bright">
              Progress
            </th>
            <th className="text-left p-3 font-orbitron text-[0.62rem] font-bold tracking-wider text-voss-green uppercase border-b border-border-bright">
              Time
            </th>
            <th className="text-left p-3 font-orbitron text-[0.62rem] font-bold tracking-wider text-voss-green uppercase border-b border-border-bright">
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {uploads.map((u) => (
            <Fragment key={u.upload_id}>
              <tr
                onClick={() =>
                  setExpandedId(expandedId === u.upload_id ? null : u.upload_id)
                }
                className="cursor-pointer transition-colors hover:bg-voss-green/[0.03] border-b border-border last:border-b-0"
              >
                <td className="p-3 font-space text-xs text-voss-green">
                  {truncateId(u.upload_id)}
                </td>
                <td className="p-3 text-sm">
                  {u.original_filename}
                  <span className="ml-2 text-text-muted text-xs">
                    {formatFileSize(u.file_size)}
                  </span>
                </td>
                <td className="p-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="p-3">
                  <ProgressBar stage={u.stage} totalStages={u.total_stages} />
                </td>
                <td className="p-3 font-space text-xs text-text-dim">
                  {formatMs(u.processing_time_ms)}
                </td>
                <td className="p-3 text-xs text-text-dim">
                  {formatTimestamp(u.created_at)}
                </td>
              </tr>
              {expandedId === u.upload_id && (
                <UploadDetail
                  key={`detail-${u.upload_id}`}
                  uploadId={u.upload_id}
                />
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

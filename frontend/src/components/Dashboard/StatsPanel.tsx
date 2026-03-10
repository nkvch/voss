import type { StatsResponse } from "../../types";
import { formatFileSize, formatMs } from "../../utils/format";

function StatBox({
  label,
  value,
  color = "text-green-bright",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="text-center p-3 border border-border rounded-lg bg-voss-green/[0.02] min-w-[110px]">
      <span className={`font-orbitron text-lg font-bold ${color} block`}>
        {value}
      </span>
      <span className="text-[0.6rem] text-text-muted tracking-wider uppercase">
        {label}
      </span>
    </div>
  );
}

export function StatsPanel({ stats }: { stats: StatsResponse | null }) {
  if (!stats) return null;

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <StatBox label="Total Uploads" value={stats.total_uploads} />
      <StatBox
        label="Complete"
        value={stats.status_counts["complete"] ?? 0}
        color="text-voss-green"
      />
      <StatBox
        label="Processing"
        value={
          (stats.status_counts["processing"] ?? 0) +
          (stats.status_counts["extracting"] ?? 0) +
          (stats.status_counts["hashing"] ?? 0) +
          (stats.status_counts["finalizing"] ?? 0) +
          (stats.status_counts["queued"] ?? 0)
        }
        color="text-voss-amber"
      />
      <StatBox
        label="Failed"
        value={stats.status_counts["error"] ?? 0}
        color="text-voss-red"
      />
      <StatBox
        label="Avg Time"
        value={formatMs(stats.average_processing_time_ms)}
        color="text-voss-cyan"
      />
      <StatBox
        label="Total Size"
        value={formatFileSize(stats.total_file_size)}
        color="text-voss-cyan"
      />
    </div>
  );
}

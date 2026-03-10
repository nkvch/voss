import type { UploadStatus } from "../../types";

const STATUS_CONFIG: Record<
  UploadStatus,
  { label: string; className: string }
> = {
  queued: {
    label: "Queued",
    className: "bg-text-muted/10 text-text-dim border-text-muted/25",
  },
  processing: {
    label: "Processing",
    className: "bg-amber-glow text-voss-amber border-voss-amber/25",
  },
  extracting: {
    label: "Extracting",
    className: "bg-cyan-glow text-voss-cyan border-voss-cyan/25",
  },
  hashing: {
    label: "Hashing",
    className: "bg-cyan-glow text-voss-cyan border-voss-cyan/25",
  },
  finalizing: {
    label: "Finalizing",
    className: "bg-amber-glow text-voss-amber border-voss-amber/25",
  },
  complete: {
    label: "Complete",
    className: "bg-green-glow text-voss-green border-voss-green/25",
  },
  error: {
    label: "Error",
    className: "bg-red-glow text-voss-red border-voss-red/25",
  },
};

export function StatusBadge({ status }: { status: UploadStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-block font-orbitron text-[0.55rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

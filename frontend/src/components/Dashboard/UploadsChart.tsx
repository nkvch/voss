import { useMemo } from "react";
import type { UploadListItem } from "../../types";

interface DayBucket {
  label: string;
  count: number;
}

function aggregateByDay(uploads: UploadListItem[], days: number): DayBucket[] {
  const now = new Date();
  const buckets: DayBucket[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const count = uploads.filter(
      (u) => u.created_at.slice(0, 10) === dateStr,
    ).length;
    buckets.push({ label, count });
  }

  return buckets;
}

export function UploadsChart({ uploads }: { uploads: UploadListItem[] }) {
  const days = 7;
  const buckets = useMemo(() => aggregateByDay(uploads, days), [uploads]);
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  const chartW = 100;
  const chartH = 100;
  const barGap = 2;
  const barWidth = (chartW - barGap * (buckets.length + 1)) / buckets.length;
  const labelH = 16;

  return (
    <svg
      viewBox={`0 0 ${chartW} ${chartH + labelH}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#00aa55" />
          <stop offset="100%" stopColor="#00ff88" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((frac) => (
        <line
          key={frac}
          x1={0}
          y1={chartH * (1 - frac)}
          x2={chartW}
          y2={chartH * (1 - frac)}
          stroke="rgba(0,255,136,0.06)"
          strokeWidth={0.3}
        />
      ))}

      {/* Bars + labels */}
      {buckets.map((bucket, i) => {
        const h = (bucket.count / maxCount) * (chartH - 8);
        const x = barGap + i * (barWidth + barGap);
        const y = chartH - h;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={1}
              fill="url(#barGrad)"
              opacity={0.85}
            />
            {bucket.count > 0 && (
              <text
                x={x + barWidth / 2}
                y={y - 2}
                textAnchor="middle"
                fill="#00ff88"
                fontSize={3.2}
                fontFamily="Orbitron, monospace"
              >
                {bucket.count}
              </text>
            )}
            <text
              x={x + barWidth / 2}
              y={chartH + 10}
              textAnchor="middle"
              fill="rgba(176,190,197,0.4)"
              fontSize={2.8}
              fontFamily="Orbitron, monospace"
            >
              {bucket.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

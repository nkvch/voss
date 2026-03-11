import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { UploadListItem, StatsResponse } from "../../types";
import { formatFileSize } from "../../utils/format";

/* ── Uploads over time (bar chart) ── */

function aggregateByDay(uploads: UploadListItem[], days: number) {
  const now = new Date();
  const buckets: { label: string; count: number }[] = [];
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

function UploadsOverTime({ uploads }: { uploads: UploadListItem[] }) {
  const data = useMemo(() => aggregateByDay(uploads, 7), [uploads]);

  return (
    <div>
      <h4 className="font-orbitron text-[0.6rem] text-text-muted tracking-widest uppercase mb-2">
        Uploads Over Time
      </h4>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(176,190,197,0.4)", fontSize: 9, fontFamily: "Orbitron, monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "rgba(176,190,197,0.3)", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#131920",
              border: "1px solid rgba(0,255,136,0.2)",
              borderRadius: 6,
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 11,
            }}
            itemStyle={{ color: "#00ff88" }}
            labelStyle={{ color: "rgba(176,190,197,0.6)", fontSize: 10 }}
            cursor={{ fill: "rgba(0,255,136,0.05)" }}
          />
          <Bar dataKey="count" name="Uploads" radius={[3, 3, 0, 0]} fill="#00ff88" fillOpacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Status breakdown (donut chart) ── */

const STATUS_COLORS: Record<string, string> = {
  complete: "#00ff88",
  processing: "#ffaa00",
  extracting: "#00ddff",
  hashing: "#00ddff",
  finalizing: "#ffaa00",
  queued: "rgba(176,190,197,0.4)",
  error: "#ff3344",
};

function StatusBreakdown({ stats }: { stats: StatsResponse | null }) {
  const data = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.status_counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [stats]);

  if (data.length === 0) {
    return (
      <div>
        <h4 className="font-orbitron text-[0.6rem] text-text-muted tracking-widest uppercase mb-2">
          Status Breakdown
        </h4>
        <p className="text-xs text-text-muted italic text-center py-6">No data yet</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-orbitron text-[0.6rem] text-text-muted tracking-widest uppercase mb-2">
        Status Breakdown
      </h4>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={55}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={STATUS_COLORS[entry.name] ?? "rgba(176,190,197,0.3)"}
                fillOpacity={0.85}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#131920",
              border: "1px solid rgba(0,255,136,0.2)",
              borderRadius: 6,
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 11,
            }}
            itemStyle={{ color: "#b0bec5" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: STATUS_COLORS[d.name] ?? "#666" }}
            />
            <span className="text-[0.6rem] text-text-dim capitalize">{d.name}</span>
            <span className="text-[0.6rem] text-text-muted">({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── File size distribution (bar chart) ── */

const SIZE_BUCKETS = [
  { label: "<10KB", max: 10240 },
  { label: "10-50KB", max: 51200 },
  { label: "50-100KB", max: 102400 },
  { label: "100-500KB", max: 512000 },
  { label: "500KB-1MB", max: 1048576 },
  { label: ">1MB", max: Infinity },
];

function SizeDistribution({ uploads }: { uploads: UploadListItem[] }) {
  const data = useMemo(() => {
    const counts = SIZE_BUCKETS.map((b) => ({ label: b.label, count: 0, max: b.max }));
    for (const u of uploads) {
      let prev = 0;
      for (const bucket of counts) {
        if (u.file_size >= prev && u.file_size < bucket.max) {
          bucket.count++;
          break;
        }
        prev = bucket.max;
      }
    }
    return counts;
  }, [uploads]);

  return (
    <div>
      <h4 className="font-orbitron text-[0.6rem] text-text-muted tracking-widest uppercase mb-2">
        File Size Distribution
      </h4>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(176,190,197,0.4)", fontSize: 8, fontFamily: "Orbitron, monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "rgba(176,190,197,0.3)", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#131920",
              border: "1px solid rgba(0,221,255,0.2)",
              borderRadius: 6,
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 11,
            }}
            itemStyle={{ color: "#00ddff" }}
            labelStyle={{ color: "rgba(176,190,197,0.6)", fontSize: 10 }}
            cursor={{ fill: "rgba(0,221,255,0.05)" }}
          />
          <Bar dataKey="count" name="Files" radius={[3, 3, 0, 0]} fill="#00ddff" fillOpacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Processing time distribution (bar chart) ── */

const TIME_BUCKETS = [
  { label: "<5s", max: 5000 },
  { label: "5-10s", max: 10000 },
  { label: "10-20s", max: 20000 },
  { label: "20-30s", max: 30000 },
  { label: ">30s", max: Infinity },
];

function ProcessingTimeDistribution({ uploads }: { uploads: UploadListItem[] }) {
  const data = useMemo(() => {
    const counts = TIME_BUCKETS.map((b) => ({ label: b.label, count: 0, max: b.max }));
    for (const u of uploads) {
      if (u.processing_time_ms == null) continue;
      let prev = 0;
      for (const bucket of counts) {
        if (u.processing_time_ms >= prev && u.processing_time_ms < bucket.max) {
          bucket.count++;
          break;
        }
        prev = bucket.max;
      }
    }
    return counts;
  }, [uploads]);

  return (
    <div>
      <h4 className="font-orbitron text-[0.6rem] text-text-muted tracking-widest uppercase mb-2">
        Processing Time
      </h4>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(176,190,197,0.4)", fontSize: 9, fontFamily: "Orbitron, monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "rgba(176,190,197,0.3)", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#131920",
              border: "1px solid rgba(255,170,0,0.2)",
              borderRadius: 6,
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 11,
            }}
            itemStyle={{ color: "#ffaa00" }}
            labelStyle={{ color: "rgba(176,190,197,0.6)", fontSize: 10 }}
            cursor={{ fill: "rgba(255,170,0,0.05)" }}
          />
          <Bar dataKey="count" name="Uploads" radius={[3, 3, 0, 0]} fill="#ffaa00" fillOpacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Combined analytics view ── */

export function UploadsChart({
  uploads,
  stats,
}: {
  uploads: UploadListItem[];
  stats: StatsResponse | null;
}) {
  if (uploads.length === 0) {
    return (
      <p className="text-sm text-text-muted italic text-center py-8">
        No uploads yet. Record and upload a transmission to see analytics.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UploadsOverTime uploads={uploads} />
      <StatusBreakdown stats={stats} />
      <SizeDistribution uploads={uploads} />
      <ProcessingTimeDistribution uploads={uploads} />
    </div>
  );
}

/* ── Keep formatFileSize available for tooltip customization ── */
void formatFileSize;

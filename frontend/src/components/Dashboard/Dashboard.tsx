import { useState } from "react";
import type { UploadListItem } from "../../types";
import { useStats } from "../../hooks/useStats";
import { Card } from "../common/Card";
import { StatsPanel } from "./StatsPanel";
import { UploadsChart } from "./UploadsChart";
import { UploadsTable } from "./UploadsTable";

type DashboardTab = "log" | "chart";

export function Dashboard({
  uploads,
  loading,
}: {
  uploads: UploadListItem[];
  loading: boolean;
}) {
  const { stats } = useStats(5000);
  const [tab, setTab] = useState<DashboardTab>("log");

  return (
    <div className="space-y-6">
      <div>
        <div className="station-label mb-3">Mission Control</div>
        <h2 className="font-orbitron text-xl text-voss-green tracking-wider mb-1">
          System Dashboard
        </h2>
        <p className="text-sm text-text-dim italic">
          Real-time overview of all voice transmissions and processing status.
        </p>
      </div>

      <Card>
        <h3 className="font-orbitron text-xs text-voss-green tracking-wider uppercase mb-4">
          System Stats
        </h3>
        <StatsPanel stats={stats} />
      </Card>

      <div>
        <div className="flex gap-1 mb-4">
          <button
            onClick={() => setTab("log")}
            className={`px-4 py-1.5 rounded-t font-orbitron text-[0.6rem] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
              tab === "log"
                ? "bg-voss-green/10 text-voss-green border border-b-0 border-voss-green/25"
                : "text-text-muted hover:text-text-dim"
            }`}
          >
            Transmission Log
          </button>
          <button
            onClick={() => setTab("chart")}
            className={`px-4 py-1.5 rounded-t font-orbitron text-[0.6rem] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
              tab === "chart"
                ? "bg-voss-green/10 text-voss-green border border-b-0 border-voss-green/25"
                : "text-text-muted hover:text-text-dim"
            }`}
          >
            Uploads Over Time
          </button>
        </div>

        {tab === "log" && (
          <UploadsTable uploads={uploads} loading={loading} />
        )}
        {tab === "chart" && (
          <Card>
            <UploadsChart uploads={uploads} />
          </Card>
        )}
      </div>
    </div>
  );
}

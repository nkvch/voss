import { useEffect, useRef, useState } from "react";
import type { StatsResponse } from "../types";
import { getStats } from "../api/uploads";
import { useToast } from "./useToast";

export function useStats(refreshInterval = 10000) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const setStatsRef = useRef(setStats);
  const { showToast } = useToast();
  const hasErroredRef = useRef(false);

  useEffect(() => {
    let active = true;
    const doFetch = () => {
      getStats()
        .then((data) => {
          if (active) {
            setStatsRef.current(data);
            hasErroredRef.current = false;
          }
        })
        .catch((err) => {
          if (active && !hasErroredRef.current) {
            hasErroredRef.current = true;
            showToast(
              err instanceof Error ? err.message : "Failed to load stats",
              "error",
            );
          }
        });
    };
    doFetch();
    const interval = setInterval(doFetch, refreshInterval);
    return () => { active = false; clearInterval(interval); };
  }, [refreshInterval, showToast]);

  return { stats };
}

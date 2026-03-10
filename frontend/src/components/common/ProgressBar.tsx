export function ProgressBar({
  stage,
  totalStages,
}: {
  stage: number;
  totalStages: number;
}) {
  const percent = totalStages > 0 ? Math.round((stage / totalStages) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between font-orbitron text-[0.7rem] text-text-dim mb-1">
        <span>Progress</span>
        <span>
          {stage}/{totalStages}
        </span>
      </div>
      <div className="h-2 bg-black/40 rounded overflow-hidden border border-border">
        <div
          className="h-full rounded bg-gradient-to-r from-green-dim to-voss-green relative transition-all duration-500"
          style={{ width: `${percent}%` }}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-white/15 rounded-r"
            style={{ animation: "bar-pulse 2s ease-in-out infinite" }}
          />
        </div>
      </div>
    </div>
  );
}

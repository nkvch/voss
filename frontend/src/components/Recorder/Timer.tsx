import { formatDuration } from "../../utils/format";

export function Timer({
  active,
  duration,
}: {
  active: boolean;
  duration: number;
}) {
  return (
    <div className="flex items-center gap-3">
      {active && (
        <span
          className="w-3 h-3 rounded-full bg-voss-red"
          style={{ animation: "recording-pulse 1.5s ease-in-out infinite" }}
        />
      )}
      <span className="font-orbitron text-2xl font-bold text-voss-green tabular-nums tracking-wider">
        {formatDuration(duration)}
      </span>
      {active && (
        <span className="font-orbitron text-[0.6rem] text-voss-red tracking-widest uppercase">
          REC
        </span>
      )}
    </div>
  );
}

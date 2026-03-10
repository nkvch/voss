import type { RecorderState } from "../../hooks/useRecorder";

export function RecordButton({
  state,
  level,
  onStart,
  onStop,
}: {
  state: RecorderState;
  level: number;
  onStart: () => void;
  onStop: () => void;
}) {
  if (state === "recording") {
    // Button scales 1.0 → 1.35 based on voice level
    const scale = 1 + level * 0.35;
    const glowSize = 15 + level * 50;

    return (
      <div className="relative flex items-center justify-center h-40 w-40">
        <button
          onClick={onStop}
          className="relative z-10 w-28 h-28 rounded-full border-2 border-voss-red/60 bg-voss-red/15 flex items-center justify-center hover:bg-voss-red/25 cursor-pointer"
          style={{
            transform: `scale(${scale})`,
            transition: "transform 0.1s ease-out",
            boxShadow: `0 0 ${glowSize}px rgba(255,51,68,0.3), 0 0 ${glowSize * 2}px rgba(255,51,68,0.1)`,
          }}
        >
          <span className="w-8 h-8 rounded-sm bg-voss-red" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center h-40 w-40">
      <button
        onClick={onStart}
        className="relative z-10 w-28 h-28 rounded-full border-2 border-voss-green/40 bg-voss-green/10 flex flex-col items-center justify-center gap-2 transition-all hover:bg-voss-green/20 hover:border-voss-green/60 hover:shadow-[0_0_30px_rgba(0,255,136,0.15)] cursor-pointer"
      >
        <span className="w-6 h-6 rounded-full bg-voss-green" />
        <span className="font-orbitron text-[0.5rem] text-voss-green tracking-widest uppercase">
          Record
        </span>
      </button>
    </div>
  );
}

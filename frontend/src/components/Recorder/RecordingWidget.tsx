import { formatDuration } from "../../utils/format";

export function RecordingWidget({
  duration,
  onStop,
}: {
  duration: number;
  onStop: () => void;
}) {
  return (
    <div className="fixed top-20 right-6 z-[100] widget-enter">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-voss-red/30 bg-hull/95 backdrop-blur-sm shadow-[0_0_30px_rgba(255,51,68,0.15)]">
        <span
          className="w-2.5 h-2.5 rounded-full bg-voss-red shrink-0"
          style={{ animation: "recording-pulse 1.5s ease-in-out infinite" }}
        />
        <span className="font-space text-sm font-bold text-voss-green min-w-[7ch]">
          {formatDuration(duration)}
        </span>
        <button
          onClick={onStop}
          className="w-8 h-8 rounded-full border border-voss-red/40 bg-voss-red/10 flex items-center justify-center hover:bg-voss-red/25 transition-colors cursor-pointer"
          title="Stop recording"
        >
          <span className="w-3 h-3 rounded-sm bg-voss-red" />
        </button>
      </div>
    </div>
  );
}

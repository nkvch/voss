import { useState } from "react";
import type { UploadListItem } from "../../types";
import type { RecorderHandle } from "../../hooks/useRecorder";
import { usePlayback } from "../../hooks/usePlayback";
import { useUpload } from "../../hooks/useUpload";
import { useWaveform } from "../../hooks/useWaveform";
import { formatDuration } from "../../utils/format";
import { RecordButton } from "./RecordButton";
import { UploadStatus } from "./UploadStatus";
import { StaticWaveform } from "./Waveform";

export function Recorder({
  recorder,
  onUploadComplete,
}: {
  recorder: RecorderHandle;
  onUploadComplete: (item: UploadListItem) => void;
}) {
  const { state, audioBlob, stream, duration, startRecording, stopRecording, reset } =
    recorder;
  const { samples, level, resetSamples } = useWaveform(stream);
  const { uploading, uploadResult, upload, resetUpload } = useUpload(onUploadComplete);
  const [savedSamples, setSavedSamples] = useState<number[]>([]);
  const [savedDuration, setSavedDuration] = useState(0);

  // Use saved values when available; fall back to live values for widget-stop case
  const displaySamples = savedSamples.length > 0 ? savedSamples : samples;
  const displayDuration = savedDuration > 0 ? savedDuration : duration;

  const { playing, progress: playProgress, togglePlay, cleanup: cleanupAudio } =
    usePlayback(audioBlob, state === "stopped" && !uploadResult, displayDuration);

  const handleStop = () => {
    setSavedSamples([...samples]);
    setSavedDuration(duration);
    stopRecording();
  };

  const handleUpload = () => {
    if (audioBlob) upload(audioBlob);
  };

  const handleNewRecording = () => {
    cleanupAudio();
    reset();
    resetSamples();
    setSavedSamples([]);
    setSavedDuration(0);
    resetUpload();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="station-label mb-3">Recording Terminal</div>
        <h2 className="font-orbitron text-xl text-voss-green tracking-wider mb-1">
          Voice Capture
        </h2>
        <p className="text-sm text-text-dim italic">
          Record your voice transmission and upload it to the ship's processing
          bay.
        </p>
      </div>

      <div className="flex flex-col items-center py-6 space-y-6">
        {/* Idle or Recording: big centered button */}
        {(state === "idle" || state === "recording") && (
          <>
            <RecordButton
              state={state}
              level={level}
              onStart={startRecording}
              onStop={handleStop}
            />
            {state === "recording" && (
              <div className="flex items-center gap-3 w-48 justify-center">
                <span
                  className="w-2.5 h-2.5 rounded-full bg-voss-red shrink-0"
                  style={{
                    animation: "recording-pulse 1.5s ease-in-out infinite",
                  }}
                />
                <span className="font-space text-xl font-bold text-voss-green text-center min-w-[7ch]">
                  {formatDuration(duration)}
                </span>
                <span className="font-orbitron text-[0.6rem] text-voss-red tracking-widest uppercase shrink-0">
                  REC
                </span>
              </div>
            )}
            {state === "idle" && (
              <span className="font-orbitron text-[0.6rem] text-text-muted tracking-widest uppercase">
                Tap to start recording
              </span>
            )}
          </>
        )}

        {/* Stopped: telegram-style waveform + controls */}
        {state === "stopped" && !uploadResult && (
          <>
            <div className="relative w-full rounded-lg border border-border bg-black/30 p-4 space-y-3">
              <button
                onClick={handleNewRecording}
                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-text-muted hover:text-voss-red hover:bg-voss-red/10 transition-colors cursor-pointer z-10"
                title="Discard"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
              <div className="flex items-center justify-between pr-8">
                <span className="font-orbitron text-[0.6rem] text-text-muted tracking-widest uppercase">
                  Recorded Transmission
                </span>
                <span className="font-space text-sm text-voss-green">
                  {formatDuration(displayDuration)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="shrink-0 w-10 h-10 rounded-full border border-voss-green/40 bg-voss-green/10 flex items-center justify-center transition-all hover:bg-voss-green/20 hover:border-voss-green/60 cursor-pointer"
                >
                  {playing ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="text-voss-green">
                      <rect x="2" y="1" width="3.5" height="12" rx="1" />
                      <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="text-voss-green ml-0.5">
                      <path d="M2 1.5v11l10-5.5z" />
                    </svg>
                  )}
                </button>
                <StaticWaveform samples={displaySamples} progress={playProgress} />
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-8 py-3 rounded-full border border-voss-green/50 bg-voss-green/10 text-voss-green font-orbitron text-xs font-bold tracking-wider uppercase transition-all hover:bg-voss-green/20 hover:border-voss-green/70 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {uploading ? "Transmitting..." : "Upload to Relay"}
            </button>
          </>
        )}
      </div>

      {uploadResult && (
        <div className="space-y-3">
          <UploadStatus uploadId={uploadResult.upload_id} />
          <div className="flex justify-center">
            <button
              onClick={handleNewRecording}
              className="px-8 py-2.5 rounded-full border border-voss-green/30 bg-voss-green/5 text-voss-green font-orbitron text-xs font-bold tracking-wider uppercase transition-all hover:bg-voss-green/10 hover:border-voss-green/50 cursor-pointer"
            >
              New Recording
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

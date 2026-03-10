import { useCallback, useEffect, useRef, useState } from "react";

export function usePlayback(audioBlob: Blob | null, active: boolean, durationMs = 0) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const rafRef = useRef(0);
  const durationRef = useRef(durationMs);
  useEffect(() => {
    durationRef.current = durationMs;
  }, [durationMs]);

  const stopRaf = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const startRaf = useCallback(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (!audio) return;
      const ms = durationRef.current;
      const total = ms > 0 ? ms / 1000 : audio.duration;
      if (total && isFinite(total) && total > 0) {
        setProgress(Math.min(audio.currentTime / total, 1));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Tear down the Audio object and blob URL (refs only, no setState)
  const teardown = useCallback(() => {
    stopRaf();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, [stopRaf]);

  const cleanup = useCallback(() => {
    teardown();
    setPlaying(false);
    setProgress(0);
  }, [teardown]);

  const togglePlay = useCallback(() => {
    if (!audioBlob) return;

    if (playing && audioRef.current) {
      audioRef.current.pause();
      stopRaf();
      setPlaying(false);
      return;
    }

    if (!audioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      blobUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        stopRaf();
        setPlaying(false);
        setProgress(0);
        audioRef.current = null;
        URL.revokeObjectURL(url);
        blobUrlRef.current = null;
      };
    }

    audioRef.current.play();
    startRaf();
    setPlaying(true);
  }, [audioBlob, playing, stopRaf, startRaf]);

  // Cleanup refs when deactivated or unmounted — no synchronous setState
  useEffect(() => {
    if (!active) teardown();
    return teardown;
  }, [active, teardown]);

  // Reset state when becoming inactive (derived, avoids setState in effect)
  const effectivePlaying = active ? playing : false;
  const effectiveProgress = active ? progress : 0;

  return { playing: effectivePlaying, progress: effectiveProgress, togglePlay, cleanup };
}

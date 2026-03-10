import { useEffect, useRef, useState } from "react";

export function StaticWaveform({ samples, progress = 0 }: { samples: number[]; progress?: number }) {
  if (samples.length === 0) return null;

  return <WaveformBars key={samples.length} samples={samples} progress={progress} />;
}

function WaveformBars({ samples, progress }: { samples: number[]; progress: number }) {
  const [animate, setAnimate] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    // On mount (fresh samples via key change), trigger grow on next frame
    rafRef.current = requestAnimationFrame(() => {
      setAnimate(true);
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const barCount = 120;
  const resampled: number[] = [];

  for (let i = 0; i < barCount; i++) {
    const pos = (i / barCount) * samples.length;
    const idx = Math.min(Math.floor(pos), samples.length - 1);
    resampled.push(samples[idx]);
  }

  const peak = Math.max(...resampled, 0.01);

  return (
    <div className="flex items-center w-full gap-[2px] h-16">
      {resampled.map((s, i) => {
        const normalized = s / peak;
        const h = Math.max(3, Math.round(normalized * 56));
        const center = barCount / 2;
        const distFromCenter = Math.abs(i - center) / center;
        const delay = distFromCenter * 300;
        return (
          <div
            key={i}
            className={`rounded-full flex-1 min-w-0 ${
              progress > 0 && i / barCount < progress
                ? "bg-voss-green"
                : "bg-voss-green/40"
            }`}
            style={{
              height: animate ? `${h}px` : "3px",
              transition: animate
                ? `height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`
                : "none",
            }}
          />
        );
      })}
    </div>
  );
}

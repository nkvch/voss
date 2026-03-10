import { useEffect, useRef, useState } from "react";

export function useWaveform(stream: MediaStream | null) {
  const [samples, setSamples] = useState<number[]>([]);
  const [level, setLevel] = useState(0);
  const animationRef = useRef<number>(0);
  const samplesRef = useRef<number[]>([]);

  useEffect(() => {
    if (!stream) return;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let lastSampleTime = 0;

    const tick = (time: number) => {
      animationRef.current = requestAnimationFrame(tick);
      analyser.getByteFrequencyData(dataArray);

      // Compute average level (0-1)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length / 255;
      setLevel(avg);

      // Sample every ~80ms for the static waveform bar visualization
      if (time - lastSampleTime > 80) {
        lastSampleTime = time;
        samplesRef.current.push(avg);
        setSamples([...samplesRef.current]);
      }
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationRef.current);
      setLevel(0);
      audioCtx.close();
    };
  }, [stream]);

  const resetSamples = () => {
    samplesRef.current = [];
    setSamples([]);
    setLevel(0);
  };

  return { samples, level, resetSamples };
}

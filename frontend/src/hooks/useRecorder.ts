import { useCallback, useRef, useState } from "react";

export type RecorderState = "idle" | "recording" | "stopped";
export type RecorderHandle = ReturnType<typeof useRecorder>;

export function useRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const startTimeRef = useRef(0);

  const startRecording = useCallback(async () => {
    // Switch to recording UI instantly — before getUserMedia resolves
    setState("recording");
    startTimeRef.current = Date.now();
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration(Date.now() - startTimeRef.current);
    }, 100);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setStream(mediaStream);

      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "";
        }
      }

      const recorder = new MediaRecorder(
        mediaStream,
        mimeType ? { mimeType } : undefined
      );
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setAudioBlob(blob);
        setState("stopped");
        mediaStream.getTracks().forEach((t) => t.stop());
        setStream(null);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
    } catch {
      // getUserMedia denied or failed — revert to idle
      setState("idle");
      setDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setState("idle");
    setDuration(0);
  }, []);

  return { state, audioBlob, stream, duration, startRecording, stopRecording, reset };
}

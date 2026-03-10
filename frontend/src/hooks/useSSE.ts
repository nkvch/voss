import { useEffect, useRef } from "react";
import type { SSEEvent } from "../types";
import { createSSEConnection } from "../api/sse";

export function useSSE(onEvent: (event: SSEEvent) => void) {
  const callbackRef = useRef(onEvent);
  useEffect(() => {
    callbackRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const eventSource = createSSEConnection((event) => {
      callbackRef.current(event);
    });

    return () => eventSource.close();
  }, []);
}

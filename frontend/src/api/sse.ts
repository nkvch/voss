import type { SSEEvent } from "../types";
import { BASE_URL } from "./client";

export function createSSEConnection(
  onEvent: (event: SSEEvent) => void,
  onError?: (error: Event) => void
): EventSource {
  const url = `${BASE_URL}/api/events`;
  const eventSource = new EventSource(url);

  const handleEvent = (e: MessageEvent) => {
    try {
      onEvent(JSON.parse(e.data));
    } catch {
      // ignore malformed events
    }
  };

  eventSource.addEventListener("status_update", handleEvent);
  eventSource.addEventListener("processing_complete", handleEvent);
  eventSource.addEventListener("processing_error", handleEvent);

  eventSource.onerror = (e) => {
    onError?.(e);
  };

  return eventSource;
}

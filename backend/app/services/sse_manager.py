import asyncio
import json
import logging
from typing import AsyncGenerator

logger = logging.getLogger(__name__)


class SSEManager:
    def __init__(self) -> None:
        self._queues: list[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._queues.append(queue)
        logger.info("SSE client connected, total=%d", len(self._queues))
        return queue

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        if queue in self._queues:
            self._queues.remove(queue)
        logger.info("SSE client disconnected, total=%d", len(self._queues))

    async def broadcast(self, event: dict) -> None:
        for queue in self._queues:
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                logger.warning("SSE queue full, dropping event for slow consumer")

    async def event_generator(self, queue: asyncio.Queue) -> AsyncGenerator:
        try:
            while True:
                event = await queue.get()
                yield {
                    "event": event.get("event", "message"),
                    "data": json.dumps(event),
                }
        except asyncio.CancelledError:
            pass


sse_manager = SSEManager()

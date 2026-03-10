from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse

from app.services.sse_manager import sse_manager

router = APIRouter()


@router.get("/events")
async def event_stream(request: Request):
    queue = sse_manager.subscribe()

    async def generate():
        try:
            async for event in sse_manager.event_generator(queue):
                if await request.is_disconnected():
                    break
                yield event
        finally:
            sse_manager.unsubscribe(queue)

    return EventSourceResponse(generate())

import asyncio

import pytest


@pytest.mark.asyncio
async def test_pipeline_completes_successfully(client, sample_audio_bytes):
    resp = await client.post(
        "/api/upload",
        files={"file": ("test.webm", sample_audio_bytes, "audio/webm")},
    )
    upload_id = resp.json()["upload_id"]

    for _ in range(120):
        resp = await client.get(f"/api/status/{upload_id}")
        data = resp.json()
        if data["status"] in ("complete", "error"):
            break
        await asyncio.sleep(0.25)

    assert data["status"] == "complete"
    assert data["fingerprint"] is not None
    assert len(data["fingerprint"]) == 64  # SHA-256 hex
    assert data["processing_time_ms"] is not None
    assert data["processing_time_ms"] > 0


@pytest.mark.asyncio
async def test_pipeline_records_metadata(client, sample_audio_bytes):
    resp = await client.post(
        "/api/upload",
        files={"file": ("test.webm", sample_audio_bytes, "audio/webm")},
    )
    upload_id = resp.json()["upload_id"]

    for _ in range(120):
        resp = await client.get(f"/api/status/{upload_id}")
        data = resp.json()
        if data["status"] in ("complete", "error"):
            break
        await asyncio.sleep(0.25)

    assert data["status"] == "complete"
    assert data["metadata"]["file_size"] > 0
    assert data["metadata"]["mime_type"] is not None


@pytest.mark.asyncio
async def test_corrupted_file_fails_gracefully(client):
    resp = await client.post(
        "/api/upload",
        files={"file": ("bad.webm", b"this is not audio", "audio/webm")},
    )
    upload_id = resp.json()["upload_id"]

    for _ in range(120):
        resp = await client.get(f"/api/status/{upload_id}")
        data = resp.json()
        if data["status"] in ("complete", "error"):
            break
        await asyncio.sleep(0.25)

    assert data["status"] == "error"
    assert data["error_message"] is not None

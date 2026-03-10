import pytest


@pytest.mark.asyncio
async def test_status_not_found(client):
    resp = await client.get("/api/status/nonexistent-id")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_status_after_upload(client, sample_audio_bytes):
    resp = await client.post(
        "/api/upload",
        files={"file": ("test.webm", sample_audio_bytes, "audio/webm")},
    )
    upload_id = resp.json()["upload_id"]

    resp = await client.get(f"/api/status/{upload_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["upload_id"] == upload_id
    valid = ("queued", "processing", "extracting", "hashing", "finalizing", "complete")
    assert data["status"] in valid
    assert "metadata" in data
    assert data["metadata"]["original_filename"] == "test.webm"

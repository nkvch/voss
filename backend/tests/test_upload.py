import pytest


@pytest.mark.asyncio
async def test_upload_returns_queued_status(client, sample_audio_bytes):
    resp = await client.post(
        "/api/upload",
        files={"file": ("test.webm", sample_audio_bytes, "audio/webm")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "queued"
    assert "upload_id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_upload_creates_record_in_list(client, sample_audio_bytes):
    resp = await client.post(
        "/api/upload",
        files={"file": ("test.webm", sample_audio_bytes, "audio/webm")},
    )
    upload_id = resp.json()["upload_id"]

    resp = await client.get("/api/uploads")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    ids = [u["upload_id"] for u in data["uploads"]]
    assert upload_id in ids

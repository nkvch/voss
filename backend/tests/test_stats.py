import pytest


@pytest.mark.asyncio
async def test_stats_empty_db(client):
    resp = await client.get("/api/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_uploads"] == 0
    assert data["total_file_size"] == 0


@pytest.mark.asyncio
async def test_stats_after_upload(client, sample_audio_bytes):
    await client.post(
        "/api/upload",
        files={"file": ("test.webm", sample_audio_bytes, "audio/webm")},
    )

    resp = await client.get("/api/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_uploads"] == 1
    assert data["total_file_size"] > 0

import asyncio

import pytest


@pytest.mark.asyncio
async def test_same_file_produces_same_fingerprint(client, sample_audio_bytes):
    """
    HARD REQUIREMENT: Same file uploaded multiple times must produce
    the exact same SHA-256 fingerprint every time.
    """
    upload_ids = []
    for i in range(3):
        response = await client.post(
            "/api/upload",
            files={"file": (f"sample_{i}.webm", sample_audio_bytes, "audio/webm")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "queued"
        upload_ids.append(data["upload_id"])

    for upload_id in upload_ids:
        for _ in range(120):
            resp = await client.get(f"/api/status/{upload_id}")
            status = resp.json()["status"]
            if status in ("complete", "error"):
                break
            await asyncio.sleep(0.25)
        assert status == "complete", (
            f"Upload {upload_id} did not complete, got: {status}"
        )

    fingerprints = []
    for upload_id in upload_ids:
        resp = await client.get(f"/api/status/{upload_id}")
        data = resp.json()
        assert data["fingerprint"] is not None
        fingerprints.append(data["fingerprint"])

    assert len(set(fingerprints)) == 1, (
        f"Fingerprints should be identical but got: {fingerprints}"
    )

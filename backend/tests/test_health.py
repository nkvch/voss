from unittest.mock import AsyncMock, patch

import pytest


@pytest.mark.asyncio
async def test_health_endpoint(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_health_endpoint_unhealthy(client):
    mock_db = AsyncMock()
    mock_db.execute.side_effect = Exception("DB connection failed")
    mock_db.close = AsyncMock()

    with patch("app.routes.health.get_db", return_value=mock_db):
        resp = await client.get("/health")
    assert resp.status_code == 503
    assert resp.json()["status"] == "unhealthy"

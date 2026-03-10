import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient


@pytest.fixture(autouse=True)
def test_settings(tmp_path, monkeypatch):
    upload_dir = str(tmp_path / "uploads")
    db_path = str(tmp_path / "test.db")
    os.makedirs(upload_dir, exist_ok=True)

    monkeypatch.setenv("VOSS_UPLOAD_DIR", upload_dir)
    monkeypatch.setenv("VOSS_DATABASE_PATH", db_path)
    monkeypatch.setenv("VOSS_STAGE_MIN_DELAY_S", "0.1")
    monkeypatch.setenv("VOSS_STAGE_MAX_DELAY_S", "0.2")
    monkeypatch.setenv("VOSS_LOG_FORMAT", "text")

    import importlib

    import app.config

    importlib.reload(app.config)
    from app.config import settings  # noqa: F811

    settings.__init__()  # type: ignore[misc]

    return settings


@pytest_asyncio.fixture
async def client(test_settings):
    import importlib

    import app.database

    importlib.reload(app.database)
    from app.database import init_database

    await init_database()

    import app.main

    importlib.reload(app.main)
    from app.main import app

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest.fixture
def sample_audio():
    return os.path.join(os.path.dirname(__file__), "..", "test_fixtures", "sample.webm")


@pytest.fixture
def sample_audio_bytes(sample_audio):
    with open(sample_audio, "rb") as f:
        return f.read()

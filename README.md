# V.O.S.S. — Voice Operating Station System

A voice capture and processing platform. Record audio from the browser, upload it to a backend API, process it through a staged pipeline with real-time status updates, and view everything on a live dashboard.

## Architecture

```
                    ┌─────────────────────────────┐
                    │      Nginx (port 80)         │
                    │    Reverse Proxy / Gateway    │
                    └──────┬──────────────┬────────┘
                           │              │
                    /api/* │              │ /*
                           │              │
              ┌────────────▼──┐    ┌──────▼──────────┐
              │   Backend     │    │    Frontend      │
              │  FastAPI      │    │  React (nginx)   │
              │  port 8000    │    │  port 3000       │
              └───┬───────┬───┘    └─────────────────┘
                  │       │
          ┌───────▼──┐ ┌──▼──────────┐
          │  SQLite   │ │  Uploads    │
          │  (volume) │ │  (volume)   │
          └──────────┘ └─────────────┘
```

- **Nginx** — single entry point, routes `/api/*` to backend, `/*` to frontend, SSE-aware
- **Backend** — FastAPI (Python 3.12), async pipeline with BackgroundTasks, SSE broadcasting, structured JSON logging
- **Frontend** — React + TypeScript + Tailwind CSS (Vite build), served as static files via nginx:alpine
- **Storage** — SQLite (WAL mode) for metadata, disk volume for audio files

## Quick Start

```bash
# Clone and start
cp .env.example .env
make start

# Open in browser
open http://localhost
```

That's it. `docker compose up` builds and starts all 3 services. The backend health check ensures everything is ready before nginx starts routing traffic.

## Available Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start all services in foreground with rebuild |
| `make start` | Start all services in background |
| `make stop` | Stop all services |
| `make test` | Run all backend tests inside Docker |
| `make test-determinism` | Run the determinism test only |
| `make lint` | Lint backend code with ruff |
| `make build` | Build images without starting |
| `make clean` | Remove containers, volumes, and images |
| `make logs` | Tail all service logs |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/upload` | Upload audio file (multipart/form-data) |
| `GET` | `/api/status/{id}` | Get processing status for an upload |
| `GET` | `/api/uploads` | List all uploads (supports `?limit=` and `?offset=`) |
| `GET` | `/api/stats` | Aggregate statistics |
| `GET` | `/api/events` | SSE stream for real-time status updates |
| `GET` | `/health` | Health check |

## Processing Pipeline

Each upload goes through 4 stages with simulated 2-5s delays per stage:

1. **Validation** — file exists, valid MIME type (via libmagic), size within limits
2. **Metadata Extraction** — file size, MIME, duration and sample rate (via mutagen)
3. **Fingerprinting** — SHA-256 hash of file contents (deterministic)
4. **Completion** — record total processing time

Status updates are broadcast via SSE after each stage transition. Failed files get `status: "error"` with an error message. Retryable errors are retried up to 3 times with exponential backoff.

## Testing

```bash
# All tests
make test

# Determinism test only (hard requirement: same file → same hash)
make test-determinism
```

Tests run inside Docker with fast pipeline delays (0.1-0.2s instead of 2-5s). The determinism test uploads the same audio file 3 times and asserts all SHA-256 fingerprints are identical.

## Design Decisions

- **aiosqlite** — async SQLite access so BackgroundTasks don't block the FastAPI event loop. WAL mode for concurrent reads during pipeline writes.
- **Single SSE endpoint** — one `/api/events` stream broadcasts all events. Clients filter by `upload_id`. Simpler than per-upload connections.
- **python-magic for validation** — reads file headers, not just extensions. Catches truly invalid files.
- **Tailwind CSS v4** — space terminal theme matching the task spec. Custom `@theme` with the full color palette, Orbitron/IBM Plex Mono fonts, CRT scanline overlays.
- **Tab navigation, no React Router** — only 2 views (Record/Dashboard). URL routing would add complexity without value.
- **Frontend container = nginx:alpine** — built React app is static files. No Node runtime needed in production.
- **Separate volumes** — `uploads` for audio files, `db_data` for SQLite. Independent lifecycle and backup.

## Trade-offs & What I'd Improve

- **SQLite** is fine for this scale but doesn't support concurrent writers well. For production: PostgreSQL.
- **BackgroundTasks** runs in the same process — if the server crashes, in-flight jobs are lost. For production: Celery/Redis or a proper job queue.
- **SSE broadcasts to all clients** — in production, you'd filter server-side per user/session.
- **No authentication** — per task spec, but in production this would be the first addition.
- **Audio duration extraction** depends on mutagen supporting the format — WebM/Opus works, but exotic formats may return null.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Python 3.12, FastAPI, aiosqlite, sse-starlette |
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite |
| Proxy | Nginx |
| Container | Docker, docker compose |
| Tests | pytest, pytest-asyncio, httpx |
| Lint | ruff |
| CI | GitHub Actions |

.PHONY: dev start stop test test-determinism lint build clean logs

## Start all services (foreground, with rebuild)
dev:
	docker compose up --build

## Start all services (background)
start:
	cp -n .env.example .env 2>/dev/null || true
	docker compose up --build -d

## Stop all services
stop:
	docker compose down

## Run all backend tests
test:
	docker compose run --rm backend pytest -v --tb=short

## Run determinism test only
test-determinism:
	docker compose run --rm backend pytest tests/test_determinism.py -v

## Lint backend code
lint:
	docker compose run --rm backend ruff check app/ tests/
	docker compose run --rm backend ruff format --check app/ tests/

## Build images without starting
build:
	docker compose build

## Remove containers, volumes, and images
clean:
	docker compose down -v --rmi local

## Tail logs
logs:
	docker compose logs -f

## Tail backend logs only
logs-backend:
	docker compose logs -f backend

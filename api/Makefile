build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

migrate:
	docker-compose exec api alembic upgrade head

restart: down up

rebuild: down build up

seed-db:
	docker-compose exec api python seed_db.py

run: up migrate seed-db

logs:
	docker-compose logs -f

shell:
	docker-compose exec api bash

db-shell:
	docker-compose exec db bash

revision:
	docker-compose exec api alembic revision --autogenerate -m "$(message)"

format:
	docker-compose exec api ruff format . && \
	docker-compose exec api ruff check . --fix

test:
	docker-compose --profile test up e2e-test --build --abort-on-container-exit && docker-compose --profile test down


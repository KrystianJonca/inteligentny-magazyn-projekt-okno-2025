build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart: down up

rebuild: down build up

logs:
	docker-compose logs -f

shell:
	docker-compose exec api bash

db-shell:
	docker-compose exec db bash

migrate:
	docker-compose exec api alembic upgrade head

revision:
	docker-compose exec api alembic revision --autogenerate -m "$(message)"

format:
	docker-compose exec api ruff format . && \
	docker-compose exec api ruff check . --fix

test:
	docker-compose --profile test up e2e-test --build --abort-on-container-exit && docker-compose --profile test down


build:
	docker compose build

setup:
	pipenv run flask db init
	pipenv run flask db migrate
	pipenv run flask db upgrade
	pipenv run flask populate-clients

db.upgrade:
	pipenv run flask db migrate
	pipenv run flask db upgrade

stop:
	docker compose -f docker-compose.yml down

start.local:
	docker compose -f docker-compose.yml -f docker-compose.local.yml up -d

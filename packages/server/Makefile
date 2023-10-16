build:
	docker compose build

docker.setup:
	docker run --rm -it --env-file .env --network=elemental_net -v $(pwd)/sso/migrations:/usr/src/app/migrations server-sso_flask_server:latest init
	docker run --rm -it --env-file .env --network=elemental_net -v $(pwd)/sso/migrations:/usr/src/app/migrations server-sso_flask_server:latest migrate
	docker run --rm -it --env-file .env --network=elemental_net -v $(pwd)/sso/migrations:/usr/src/app/migrations server-sso_flask_server:latest populate-clients

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

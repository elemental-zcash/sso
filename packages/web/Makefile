clean:
	docker compose rm -vf

start.local:
	docker compose -f docker-compose.yml -f docker-compose.local.yml up --build -d

start.staging:
	docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d

start.prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

stop:
	docker compose -f docker-compose.yml down

build:
	docker build -t 1337bytes/elemental-sso-web:0.0.2-beta.0 .

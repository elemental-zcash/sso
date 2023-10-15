setup:
	cd packages/setup && node index.js

init:
	bash setup.sh
	make setup

start.local:
	docker compose -f docker-compose.yml -f docker-compose.local.yml up

# RoadSense Unified Control

.PHONY: setup up down logs clean help

COMPOSE=docker compose -f docker-compose.yml -f ../appwrite/docker-compose.yml

help:
	@echo "RoadSense Management Commands:"
	@echo "  make setup    - Run Appwrite installer (interactive)"
	@echo "  make up       - Start everything (Mapping, Backend, Appwrite)"
	@echo "  make fix      - Remove conflicting containers (appwrite-browser etc.)"
	@echo "  make down     - Stop all services and remove orphans"
	@echo "  make logs      - View logs from all services"
	@echo "  make clean     - Remove all volumes and data (CAUTION)"

setup:
	@echo "Running Appwrite 1.8.1 Installer..."
	@docker run -it --rm \
		--volume /var/run/docker.sock:/var/run/docker.sock \
		--volume "$(shell pwd)"/../appwrite:/usr/src/code/appwrite:rw \
		--entrypoint="install" \
		appwrite/appwrite:1.8.1

up:
	@echo "Starting RoadSense Infrastructure..."
	@$(COMPOSE) up -d

fix:
	@echo "Removing all conflicting containers..."
	@docker rm -f $$(docker ps -aq --filter name=appwrite) 2>/dev/null || true
	@docker rm -f $$(docker ps -aq --filter name=openruntimes) 2>/dev/null || true
	@docker rm -f appwrite-browser openruntimes-executor 2>/dev/null || true

down:
	@$(COMPOSE) down --remove-orphans

logs:
	@$(COMPOSE) logs -f

clean:
	@$(COMPOSE) down -v
	@rm -rf ../valhalla_data

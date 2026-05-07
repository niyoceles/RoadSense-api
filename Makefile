# RoadSense Unified Control

.PHONY: setup up down logs clean help

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
	@docker compose up -d

fix:
	@echo "Removing all conflicting containers..."
	@docker rm -f $$(docker ps -aq --filter name=appwrite) 2>/dev/null || true
	@docker rm -f $$(docker ps -aq --filter name=openruntimes) 2>/dev/null || true
	@docker rm -f appwrite-browser openruntimes-executor 2>/dev/null || true

down:
	@docker compose down --remove-orphans

logs:
	@docker compose logs -f

clean:
	@docker compose down -v
	@rm -rf ../valhalla_data

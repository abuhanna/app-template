# AppTemplate Makefile
# Common development tasks

.PHONY: help dev build test clean migrate setup lint format

# Default target - show help
help:
	@echo "AppTemplate - Available Commands"
	@echo "================================="
	@echo ""
	@echo "Setup & Development:"
	@echo "  make setup     - Initial project setup (install deps, create .env)"
	@echo "  make dev       - Start development environment with Docker"
	@echo "  make dev-local - Start frontend and backend locally (without Docker)"
	@echo ""
	@echo "Build & Test:"
	@echo "  make build     - Build all projects"
	@echo "  make test      - Run all tests"
	@echo "  make test-be   - Run backend tests only"
	@echo "  make test-fe   - Run frontend tests only"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint      - Run linters"
	@echo "  make format    - Format code"
	@echo ""
	@echo "Database:"
	@echo "  make migrate   - Run database migrations"
	@echo "  make migrate-add NAME=MigrationName - Create new migration"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean     - Clean build artifacts"
	@echo "  make clean-all - Clean everything including node_modules"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up      - Start Docker containers"
	@echo "  make docker-down    - Stop Docker containers"
	@echo "  make docker-rebuild - Rebuild and start containers"
	@echo "  make docker-logs    - View container logs"

# Setup project
setup:
	@echo "Setting up AppTemplate..."
	@cp -n .env.example .env 2>/dev/null || true
	@cd frontend-vuetify && npm install
	@cd backend-dotnet && dotnet restore
	@echo "Setup complete! Edit .env file and run 'make dev'"

# Development with Docker
dev:
	docker compose up -d --build

# Development without Docker (local)
dev-local:
	@echo "Starting backend and frontend locally..."
	@echo "Run these commands in separate terminals:"
	@echo "  Backend:  cd backend-dotnet/src/Presentation/App.Template.WebAPI && dotnet run"
	@echo "  Frontend: cd frontend-vuetify && npm run dev"

# Build all
build:
	cd backend-dotnet && dotnet build
	cd frontend-vuetify && npm run build

# Run all tests
test: test-be test-fe

# Backend tests
test-be:
	cd backend-dotnet && dotnet test

# Frontend tests
test-fe:
	cd frontend-vuetify && npm run test

# Lint code
lint:
	cd frontend-vuetify && npm run lint:check

# Format code
format:
	cd frontend-vuetify && npm run format

# Run database migrations
migrate:
	cd backend-dotnet/src/Presentation/App.Template.WebAPI && dotnet ef database update --project ../../Infrastructure/App.Template.Infrastructure

# Create new migration (usage: make migrate-add NAME=MigrationName)
migrate-add:
	cd backend-dotnet && dotnet ef migrations add $(NAME) --project src/Infrastructure/App.Template.Infrastructure --startup-project src/Presentation/App.Template.WebAPI

# Clean build artifacts
clean:
	cd backend-dotnet && dotnet clean
	cd frontend-vuetify && rm -rf dist
	@echo "Build artifacts cleaned"

# Clean everything
clean-all: clean
	cd frontend-vuetify && rm -rf node_modules
	cd backend-dotnet && find . -type d -name "bin" -exec rm -rf {} + 2>/dev/null || true
	cd backend-dotnet && find . -type d -name "obj" -exec rm -rf {} + 2>/dev/null || true
	@echo "All artifacts cleaned"

# Docker commands
docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-rebuild:
	docker compose down
	docker compose up -d --build

docker-logs:
	docker compose logs -f

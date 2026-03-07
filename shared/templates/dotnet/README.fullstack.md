# AppTemplate - Fullstack .NET + Vue

This project was generated using [`create-apptemplate`](https://github.com/abuhannaa/app-template). It features a **.NET 8** backend (Clean Architecture) and a **Vue 3** frontend, pre-configured for containerized deployment.

## Tech Stack

### Backend (.NET 8)
- **Framework**: ASP.NET Core 8 WebAPI
- **Architecture**: Clean Architecture with CQRS (MediatR)
- **Database**: PostgreSQL with Entity Framework Core
- **Auth**: JWT + Optional SSO
- **Realtime**: SignalR

### Frontend (Vue 3)
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **UI Library**: Included (Vuetify or PrimeVue dependent on selection)

### Infrastructure
- **Docker**: Containerized services
- **Nginx**: Reverse proxy for single-port access
- **Supervisor**: Process management

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js 20+](https://nodejs.org/) (for local frontend dev)
- [.NET 8 SDK](https://dotnet.microsoft.com/download) (for local backend dev)

### option 1: Run with Docker (Recommended)

This brings up the database, backend, and frontend in a single command.

```bash
# 1. Configure Environment
cp .env.example .env
# Edit .env and set DB credentials if needed

# 2. Start Services
docker compose up -d --build
```

**Access Points:**
- **Frontend App**: http://localhost
- **Backend API**: http://localhost:5100
- **Swagger UI**: http://localhost:5100/swagger
- **Database**: localhost:5432

### Option 2: Run Locally (Manual)

If you prefer to run services individually for debugging:

**1. Start Database**
You can use the docker-compose just for the DB, or run a local Postgres instance.
```bash
docker compose up db -d
```

**2. Start Backend**
```bash
cd backend
dotnet restore
dotnet run --project src/Presentation/App.Template.WebAPI
```
*Backend runs at `http://localhost:5100`*

**3. Start Frontend**
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`*

---

## Project Structure

```
.
├── backend/            # .NET 8 Clean Architecture Solution
├── frontend/           # Vue 3 Vite Project
├── docker/             # Docker configurations (Nginx, Supervisor)
├── docker-compose.yml  # Root composition file
├── Dockerfile          # Multi-stage production build
└── Makefile            # Helper commands
```

## Documentation

- **Backend Details**: See [backend/README.md](./backend/README.md) for detailed architecture documentation.
- **Frontend Details**: See [frontend/README.md](./frontend/README.md) for component usage.

## Default Credentials

- **Username**: `admin`
- **Password**: `Admin@123`

# Docker Templates

This document explains the Docker infrastructure system, how templates are organized, how the CLI selects and copies them, and how to add templates for a new backend.

---

## Directory Structure

```
docker/
  templates/root/              ← Backend-specific templates (copied to project root)
    Dockerfile.dotnet
    Dockerfile.spring
    Dockerfile.nestjs
    docker-compose.dotnet.yml
    docker-compose.spring.yml
    docker-compose.nestjs.yml
    supervisord.dotnet.conf
    supervisord.spring.conf
    supervisord.nestjs.conf
    README.fullstack.dotnet.md
    README.fullstack.spring.md
    README.fullstack.nestjs.md
    README.multirepo.md
  nginx/                       ← Shared Nginx configuration
    nginx.conf                 ← Main Nginx config (worker, gzip, security headers)
    conf.d/
      default.conf             ← Reverse proxy (backend at :8080 + SPA)
      frontend-only.conf       ← Frontend-only (no backend proxy)
  supervisor/                  ← Default supervisor config
    supervisord.conf           ← Default (.NET) supervisor config for monorepo
  Dockerfile.backend           ← Backend-only Dockerfile (.NET)
  Dockerfile.frontend          ← Frontend-only Dockerfile (Vue/React + Nginx)
```

---

## What Each Template File Does

### Dockerfiles (`docker/templates/root/Dockerfile.{backend}`)

Each is a **multi-stage build** that produces a single container running:
- The backend on port 8080
- Nginx on port 80 (reverse proxy + SPA)
- Supervisor managing both processes

| Stage | Dockerfile.dotnet | Dockerfile.spring | Dockerfile.nestjs |
|-------|-------------------|-------------------|-------------------|
| **Build base** | `mcr.microsoft.com/dotnet/sdk:8.0` | `eclipse-temurin:21-jdk-alpine` | `node:20-alpine` |
| **Build step** | `dotnet publish` clean-arch WebAPI | `./mvnw package -DskipTests` → JAR | `npm ci && npm run build` |
| **Frontend build** | `node:20-alpine` + `npm run build` | Same | Same |
| **Runtime base** | `mcr.microsoft.com/dotnet/aspnet:8.0` | `eclipse-temurin:21-jre-alpine` | `node:20-slim` |
| **Package manager** | `apt-get` (Debian) | `apk` (Alpine) | `apt-get` (Debian) |
| **Installs** | nginx, supervisor, curl | nginx, supervisor | nginx, supervisor, curl |
| **Backend artifact** | DLL directory | Single JAR (`app.jar`) | `dist/` + `node_modules/` |
| **Health check** | `curl -f http://localhost/health` | `wget` (Alpine) | `curl -f http://localhost/health` |
| **Entrypoint** | `/usr/bin/supervisord` | `supervisord` | `/usr/bin/supervisord` |

**Build arg**: All accept `VITE_API_URL` (default `/api`) to configure the frontend's API base URL.

### Docker Compose (`docker/templates/root/docker-compose.{backend}.yml`)

Each defines two services:

1. **`db`**: PostgreSQL 15 Alpine
   - Port 5432 exposed
   - Named volume `pgdata_dev` for persistence
   - Health check with `pg_isready`

2. **`app`**: The fullstack application
   - Builds from root `Dockerfile`
   - Ports: 80 (frontend + nginx), 5100 (direct backend access)
   - Depends on `db` (healthy)

**Environment variable differences**:

| Variable | .NET | Spring | NestJS |
|----------|------|--------|--------|
| Runtime env | `ASPNETCORE_ENVIRONMENT` | `SPRING_PROFILES_ACTIVE` | `NODE_ENV` |
| Port config | `ASPNETCORE_URLS=http://+:8080` | `SERVER_PORT=8080` | `PORT=8080` |
| DB connection | `ConnectionStrings__DefaultConnection` | `DB_HOST`, `DB_PORT`, `DB_NAME` | `DB_HOST`, `DB_PORT`, `DB_NAME` |
| DB user | In connection string | `DB_USER` | `DB_USERNAME` |
| JWT config | `Jwt__Secret`, `Jwt__Issuer` | `JWT_SECRET` | `JWT_SECRET`, `JWT_EXPIRES_IN` |
| SSO | `SSO__BaseUrl` | — | — |
| TypeORM | — | — | `DB_SYNCHRONIZE`, `DB_LOGGING` |
| Health start | 40s | 60s (JVM warmup) | 40s |

### Supervisor Configs (`docker/templates/root/supervisord.{backend}.conf`)

Each manages two processes:

| Process | .NET | Spring | NestJS |
|---------|------|--------|--------|
| **backend** (priority 10) | `dotnet App.Template.WebAPI.dll` | `java -jar app.jar` | `node dist/main.js` |
| **nginx** (priority 20) | `nginx -g "daemon off;"` | Same | Same |

All configs:
- Run in `nodaemon` mode (required for Docker containers)
- Auto-restart processes on crash
- Direct stdout/stderr to container logs
- Start backend first (priority 10), then nginx (priority 20)

### README Templates (`docker/templates/root/README.fullstack.{backend}.md`)

Getting-started documentation for each backend, covering:
- Tech stack summary
- Docker quick start (`docker compose up -d --build`)
- Local development setup (separate DB + backend + frontend)
- Access points (http://localhost, http://localhost:5100/swagger)
- Default credentials (admin / Admin@123)

**`README.multirepo.md`**: Generic template for backend-only or frontend-only projects, pointing to backend/README.md or frontend/README.md.

---

## Nginx Configuration

### `nginx.conf` — Main Config

```
worker_processes auto           ← Auto-detect CPU cores
keepalive_timeout 65            ← Connection timeout
client_max_body_size 20M        ← Max upload size
gzip on (level 6)               ← Compression for text, CSS, JS, JSON
Security headers:
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
```

### `default.conf` — Fullstack Reverse Proxy

```
upstream backend_api → localhost:8080

/api/*       → proxy to backend (with CORS headers, preflight handling)
/hubs/*      → proxy to backend (WebSocket upgrade for SignalR/socket.io)
/swagger*    → proxy to backend (API docs)
/health      → return 200 "healthy"
/*.{static}  → serve from /usr/share/nginx/html (1 year cache)
/*           → try_files, fallback to index.html (SPA routing)
```

### `frontend-only.conf` — No Backend Proxy

Same as `default.conf` but without the `/api/`, `/hubs/`, and `/swagger` proxy locations. Used by `Dockerfile.frontend`.

---

## How the CLI Selects and Copies Templates

### Fullstack Projects

When the user selects `fullstack`, the generator:

1. **Downloads backend template** via degit:
   ```
   backend/{framework}/{architecture}-architecture/{variant}/
   → {project}/backend/
   ```

2. **Downloads frontend template** via degit:
   ```
   frontend/{framework}/{ui}/{variant}/
   → {project}/frontend/
   ```

3. **Downloads docker templates** via targeted degit of `docker/`:
   ```
   docker/templates/root/Dockerfile.{backend}     → {project}/Dockerfile
   docker/templates/root/docker-compose.{backend}.yml  → {project}/docker-compose.yml
   docker/templates/root/supervisord.{backend}.conf    → {project}/docker/supervisor/supervisord.conf
   docker/templates/root/README.fullstack.{backend}.md → {project}/README.md
   docker/nginx/nginx.conf                        → {project}/docker/nginx/nginx.conf
   docker/nginx/conf.d/default.conf               → {project}/docker/nginx/conf.d/default.conf
   ```

4. **Updates folder references** in copied files:
   - `backend-dotnet` → `backend`
   - `frontend-vuetify` → `frontend`
   - (similar for all framework/UI combinations)

5. **Cleans up individual Docker files** from backend/ and frontend/ subdirectories (they have their own Dockerfiles for standalone use, which aren't needed in fullstack mode).

### Backend-Only Projects

Downloads only the backend template. Uses `Dockerfile.backend` (from `docker/`) instead of the fullstack multi-stage build. Gets `README.multirepo.md` as the project README.

### Frontend-Only Projects

Downloads only the frontend template. Uses `Dockerfile.frontend` (from `docker/`). Gets `README.multirepo.md` as the project README.

---

## File Selection Mapping

| User Selection | Source Path in Repo | Destination in Project |
|----------------|--------------------|-----------------------|
| Backend: dotnet, clean, full | `backend/dotnet/clean-architecture/full/` | `{project}/backend/` |
| Frontend: vue, vuetify, full | `frontend/vue/vuetify/full/` | `{project}/frontend/` |
| Root: .env.example | `./.env.example` | `{project}/.env.example` |
| Root: .gitignore | `./.gitignore` | `{project}/.gitignore` |
| Root: CLAUDE.md | `./CLAUDE.md` | `{project}/CLAUDE.md` |
| Docker: nginx | `docker/nginx/` | `{project}/docker/nginx/` |
| Docker: supervisor | `docker/supervisor/` | `{project}/docker/supervisor/` |
| Dockerfile template | `docker/templates/root/Dockerfile.dotnet` | `{project}/Dockerfile` |
| Compose template | `docker/templates/root/docker-compose.dotnet.yml` | `{project}/docker-compose.yml` |
| Supervisor template | `docker/templates/root/supervisord.dotnet.conf` | `{project}/docker/supervisor/supervisord.conf` |
| README template | `docker/templates/root/README.fullstack.dotnet.md` | `{project}/README.md` |

---

## How to Add Templates for a New Backend

Example: Adding Go templates.

### 1. Create `Dockerfile.go`

```dockerfile
# Stage 1: Build backend
FROM golang:1.22-alpine AS backend-build
WORKDIR /app
COPY backend/ .
RUN go mod download && go build -o server ./cmd/server

# Stage 2: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/ .
ARG VITE_API_URL=/api
RUN npm ci && npm run build

# Stage 3: Runtime
FROM alpine:3.19
RUN apk add --no-cache nginx supervisor
COPY --from=backend-build /app/server /app/backend/server
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY docker/nginx/ /etc/nginx/
COPY docker/supervisor/supervisord.conf /etc/supervisor.d/supervisord.ini
EXPOSE 80
CMD ["supervisord", "-n"]
```

### 2. Create `docker-compose.go.yml`

Follow the pattern of existing compose files:
- `db` service: PostgreSQL 15 Alpine
- `app` service: Build from `./Dockerfile`, ports 80 + 5100
- Go-specific env vars: `PORT=8080`, `DATABASE_URL`, `JWT_SECRET`

### 3. Create `supervisord.go.conf`

```ini
[supervisord]
nodaemon=true
logfile=/dev/null
logfile_maxbytes=0

[program:backend]
command=/app/backend/server
directory=/app/backend
environment=PORT=8080
autostart=true
autorestart=true
priority=10
stdout_logfile=/dev/stdout
stderr_logfile=/dev/stderr

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
autostart=true
autorestart=true
priority=20
stdout_logfile=/dev/stdout
stderr_logfile=/dev/stderr
```

### 4. Create `README.fullstack.go.md`

Follow the pattern of existing README templates:
- Tech stack summary
- Docker quick start
- Local development setup
- Access points
- Default credentials

### 5. Update the CLI

In `create-apptemplate/src/generator.ts`, update `updateFolderReferences()` to include:
```typescript
content = content.replace(/backend-go/g, 'backend');
```

See [cli-development.md](cli-development.md) for the full checklist of CLI files to update.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│              Docker Container                    │
│                                                  │
│  ┌──────────────┐       ┌─────────────────────┐ │
│  │   Nginx      │       │    Backend           │ │
│  │   :80        │       │    :8080             │ │
│  │              │       │                      │ │
│  │  /api/* ─────┼──────►│  REST API            │ │
│  │  /hubs/* ────┼──────►│  WebSocket           │ │
│  │  /swagger ───┼──────►│  API Docs            │ │
│  │  /* ─────────┤       │                      │ │
│  │  (SPA files) │       └──────────┬───────────┘ │
│  └──────────────┘                  │             │
│                                    │             │
│  ┌──────────────────────┐          │             │
│  │    Supervisor        │          │             │
│  │    (process manager) │          │             │
│  │    manages both ─────┼──────────┘             │
│  └──────────────────────┘                        │
└──────────────────────┬──────────────────────────┘
                       │
              ┌────────▼────────┐
              │   PostgreSQL    │
              │   :5432         │
              └─────────────────┘
```

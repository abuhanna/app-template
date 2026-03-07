# AppTemplate - Scaffolding Generator

This repository contains the source code for the [`@abuhannaa/create-apptemplate`](https://www.npmjs.com/package/@abuhannaa/create-apptemplate) scaffolding generator. It includes the CLI tool and reference template implementations for .NET 8, Spring Boot 3, NestJS, Vue 3, and React 19.

> **Note**: If you simply want to **create a new project**, you do not need to clone this repository. Use the NPM command below.

---

## Usage (Generating a New Project)

```bash
npm create @abuhannaa/apptemplate@latest
```

The interactive CLI will guide you through:
1. **Project Name**: The name and path for your new application
2. **Project Type**: Fullstack, Backend Only, or Frontend Only
3. **Backend Framework**: .NET 8, Spring Boot 3, or NestJS
4. **Architecture Pattern**: Clean Architecture, Feature-Based, or N-Layer
5. **Frontend Framework**: Vue 3 or React 19
6. **UI Library**: Vuetify or PrimeVue (Vue) / MUI or PrimeReact (React)
7. **Variant**: Full (all features) or Minimal (lightweight starter)

### Non-Interactive Mode

You can specify all options via command-line arguments:

```bash
# .NET + Vuetify Fullstack (Clean Architecture)
npm create @abuhannaa/apptemplate@latest my-app -- \
  --template fullstack --backend dotnet --architecture clean \
  --framework vue --ui vuetify --name MyCompany.MyApp

# Spring Boot API (Feature-Based Architecture, Minimal)
npm create @abuhannaa/apptemplate@latest my-api -- \
  --template backend --backend spring --architecture feature \
  --variant minimal --name MyCompany.MyApi

# NestJS API (N-Layer Architecture)
npm create @abuhannaa/apptemplate@latest my-api -- \
  --template backend --backend nestjs --architecture nlayer

# React + MUI Frontend Only
npm create @abuhannaa/apptemplate@latest my-frontend -- \
  --template frontend --framework react --ui mui

# React + PrimeReact Frontend Only (Minimal)
npm create @abuhannaa/apptemplate@latest my-frontend -- \
  --template frontend --framework react --ui primereact --variant minimal

# Vue + PrimeVue Frontend Only
npm create @abuhannaa/apptemplate@latest my-frontend -- \
  --template frontend --framework vue --ui primevue
```

---

## Architecture Patterns

All three backend frameworks support the same architecture patterns:

| Pattern | Description | Best For |
|---------|-------------|----------|
| **Clean Architecture** | 4-layer separation (Domain → Application → Infrastructure → Presentation). CQRS with MediatR (.NET) / @nestjs/cqrs (NestJS). Rich domain models. | Large, complex systems |
| **Feature-Based** | Single project organized by business feature. Controllers, services, and DTOs colocated per feature. | Rapid development, medium apps |
| **N-Layer** | Single project with horizontal layers (Controllers → Services → Repositories → Models). | Simple CRUD apps, prototypes |

See [docs/architecture-patterns.md](docs/architecture-patterns.md) for detailed diagrams and per-backend specifics.

---

## Full vs Minimal Variants

| Feature | Full | Minimal |
|---------|------|---------|
| Dashboard | Yes | No |
| User Management (CRUD) | Yes | No |
| Department Management (CRUD) | Yes | No |
| Export (XLSX/CSV/PDF) | Yes | No |
| File Management | Yes | Yes |
| Audit Logs | Yes | Yes |
| Real-time Notifications | Yes | Yes |
| Auth (JWT + password mgmt) | Yes | SSO-only |
| Profile Page | Yes | Varies |

**Full**: Complete application with all features — ready to customize.
**Minimal**: Lightweight starter with core infrastructure — build your own features on top.

---

## Repository Structure

This monorepo serves as the source of truth for all templates:

```
backend/
  dotnet/                           # .NET 8 backends
    {clean,feature,nlayer}-architecture/{full,minimal}/
  spring/                           # Spring Boot 3 backends
    {clean,feature,nlayer}-architecture/{full,minimal}/
  nestjs/                           # NestJS backends
    {clean,feature,nlayer}-architecture/{full,minimal}/
frontend/
  vue/
    vuetify/{full,minimal}/         # Vue 3 + Vuetify 3
    primevue/{full,minimal}/        # Vue 3 + PrimeVue 4
  react/
    mui/{full,minimal}/             # React 19 + MUI 7
    primereact/{full,minimal}/      # React 19 + PrimeReact 10
create-apptemplate/                 # CLI source code (TypeScript)
docker/                             # Docker configs & templates
docs/                               # Project documentation
```

**Total scaffoldable configurations**: 98 (18 backend + 8 frontend + 72 fullstack)

---

## Template Features & Tech Stack

### Features (All Variants)
- **Authentication**: JWT with refresh tokens (full) or SSO-ready (minimal)
- **Authorization**: Role-based access control (RBAC)
- **Real-time**: SignalR (.NET) / WebSocket STOMP (Spring) / socket.io (NestJS)
- **API Documentation**: Swagger/OpenAPI auto-generated
- **Structured Logging**: Serilog (.NET) / Logback (Spring) / Pino (NestJS)
- **Health Checks**: Liveness and readiness endpoints
- **Internationalization**: English + Arabic (RTL) out of the box
- **Docker**: Production-ready containerization with nginx reverse proxy

### Backend Options

| | .NET 8 | Spring Boot 3 | NestJS 10 |
|---|--------|---------------|-----------|
| Language | C# | Java 21 | TypeScript |
| ORM | EF Core 8 | JPA/Hibernate | TypeORM 0.3 |
| Database | PostgreSQL | PostgreSQL | PostgreSQL |
| API Docs | Swashbuckle | SpringDoc | @nestjs/swagger |
| Auth | JWT Bearer | Spring Security + JJWT | Passport + @nestjs/jwt |
| Real-time | SignalR | Spring WebSocket | socket.io |

### Frontend Options

| | Vue/Vuetify | Vue/PrimeVue | React/MUI | React/PrimeReact |
|---|-------------|--------------|-----------|-----------------|
| Language | JavaScript | JavaScript | TypeScript | TypeScript |
| State | Pinia | Pinia | Zustand | Zustand |
| Router | File-based (unplugin-vue-router) | File-based | React Router v7 | React Router v7 |
| Build | Vite 7 | Vite 7 | Vite 7 | Vite 7 |

### Infrastructure
- **Docker**: Multi-stage builds with supervisor (backend + nginx)
- **Nginx**: Reverse proxy, static file serving, WebSocket support
- **GitHub Actions**: CI/CD pipelines included
- **Commitlint**: Conventional commit enforcement

---

## Developing the Templates

The following instructions are for **contributors** to this repository.

### Quick Start (Docker)

```bash
# 1. Clone repository
git clone https://github.com/abuhanna/app-template.git
cd app-template

# 2. Setup environment
cp .env.example .env

# 3. Start services
docker compose up -d --build
```

**Access Points:**
- Frontend: http://localhost
- Backend API: http://localhost:5100
- Swagger UI: http://localhost:5100/swagger
- Database: localhost:5432

### Manual Development

**Backend (.NET)**:
```bash
cd backend/dotnet/clean-architecture/full
dotnet restore && dotnet run --project src/Presentation/App.Template.WebAPI
```

**Backend (Spring Boot)**:
```bash
cd backend/spring/clean-architecture/full/api
../mvnw spring-boot:run
```

**Backend (NestJS)**:
```bash
cd backend/nestjs/clean-architecture/full
npm install && npm run start:dev
```

**Frontend (Vue/Vuetify)**:
```bash
cd frontend/vue/vuetify/full
npm install && npm run dev
```

**Frontend (React/MUI)**:
```bash
cd frontend/react/mui/full
npm install && npm run dev
```

### Default Credentials
- **Admin**: admin@apptemplate.com / Admin@123

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture Patterns](docs/architecture-patterns.md) | Clean, Feature-Based, and N-Layer patterns with per-backend diagrams |
| [CLI Development](docs/cli-development.md) | How to develop, test, and publish the CLI tool |
| [Docker Templates](docs/docker-templates.md) | Docker infrastructure system and template guide |
| [Version Alignment](docs/version-alignment.md) | Target versions for all dependencies across variants |

---

## Contributing

### Getting Started

1. Fork and clone the repository
2. Install Node.js 20+ and the relevant backend SDK (.NET 8 / Java 21 / Node 20)
3. Read the relevant docs in [docs/](docs/) for the area you're contributing to

### Development Workflow

```bash
# CLI development
cd create-apptemplate
npm install && npm run dev

# Run tests
npm test
npm run typecheck
```

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(backend-dotnet): add rate limiting middleware
fix(frontend-vuetify): correct dark mode toggle
docs(cli): update publishing checklist
```

**Scopes**: `backend-dotnet`, `backend-spring`, `backend-nestjs`, `frontend-vuetify`, `frontend-primevue`, `frontend-mui`, `frontend-primereact`, `cli`, `docker`, `deps`, `config`, `ci`

### Adding a New Backend or Frontend

See [docs/cli-development.md](docs/cli-development.md) for the step-by-step checklist.

### Version Alignment

When updating a dependency version, apply it consistently across all variants of the same stack. See [docs/version-alignment.md](docs/version-alignment.md) for the source-of-truth version table.

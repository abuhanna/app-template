# @abuhannaa/create-apptemplate

A CLI tool to scaffold production-ready fullstack applications with your choice of backend and frontend frameworks.

## Quick Start

```bash
npm create @abuhannaa/apptemplate@latest
```

That's it! The interactive wizard will guide you through the setup.

## Stack Options

| Backend | Frontend | UI Libraries |
|---------|----------|--------------|
| .NET 8 | Vue 3 | Vuetify (Material Design 3) |
| Spring Boot 3 | React 18 | PrimeVue |
| NestJS | | MUI (Material UI) |
| | | PrimeReact |

Mix and match any backend with any frontend to create your ideal stack.

## Installation Methods

```bash
# npm
npm create @abuhannaa/apptemplate@latest

# npx
npx @abuhannaa/create-apptemplate my-app

# pnpm
pnpm create @abuhannaa/apptemplate

# yarn
yarn create @abuhannaa/apptemplate

# bun
bun create @abuhannaa/apptemplate
```

## Usage

### Interactive Mode (Recommended)

```bash
npm create @abuhannaa/apptemplate@latest
```

The wizard will prompt you for:

1. **Project location** - Directory name for your project
2. **Project type** - Fullstack, Backend only, or Frontend only
3. **Backend framework** - .NET 8, Spring Boot 3, or NestJS
4. **Frontend framework** - Vue 3 or React 18
5. **UI library** - Vuetify, PrimeVue, MUI, or PrimeReact
6. **Project name** - Namespace for .NET/Spring (e.g., `MyCompany.MyApp`)
7. **Install dependencies** - Run install automatically

### Command Line Mode

Skip the prompts by providing options directly:

```bash
# Fullstack with .NET + Vuetify
npm create @abuhannaa/apptemplate@latest my-app -b dotnet -u vuetify -n "MyCompany.MyApp" -i

# Fullstack with Spring Boot + React MUI
npm create @abuhannaa/apptemplate@latest my-app -b spring -f react -u mui -n "com.mycompany.myapp" -i

# Fullstack with NestJS + PrimeVue
npm create @abuhannaa/apptemplate@latest my-app -b nestjs -u primevue -i

# Backend only (NestJS)
npm create @abuhannaa/apptemplate@latest my-api -t backend -b nestjs -i

# Frontend only (React + PrimeReact)
npm create @abuhannaa/apptemplate@latest my-spa -t frontend -f react -u primereact -i

# Place files in root (no subfolder)
npm create @abuhannaa/apptemplate@latest my-api -t backend -b nestjs --root
```

## CLI Options

| Option | Alias | Description | Values | Default |
|--------|-------|-------------|--------|---------|
| `--type` | `-t` | Project type | `fullstack`, `backend`, `frontend` | `fullstack` |
| `--backend` | `-b` | Backend framework | `dotnet`, `spring`, `nestjs` | - |
| `--framework` | `-f` | Frontend framework | `vue`, `react` | `vue` |
| `--ui` | `-u` | UI library | `vuetify`, `primevue`, `mui`, `primereact` | Based on framework |
| `--name` | `-n` | Project namespace | `Company.Project` format | - |
| `--root` | `-r` | Place files in project root | - | `false` |
| `--install` | `-i` | Install dependencies | - | `false` |
| `--help` | `-h` | Show help | - | - |
| `--version` | `-v` | Show version | - | - |

### UI Library Compatibility

| Frontend | Compatible UI Libraries |
|----------|------------------------|
| Vue | `vuetify`, `primevue` |
| React | `mui`, `primereact` |

## After Project Creation

### Using Docker (Recommended)

```bash
cd my-app
cp .env.example .env
docker compose up -d --build
```

### Running Manually

**Backend:**
```bash
# .NET
cd backend/src/Presentation/*.WebAPI && dotnet run

# Spring Boot
cd backend && ./mvnw spring-boot:run

# NestJS
cd backend && npm run start:dev
```

**Frontend:**
```bash
cd frontend && npm run dev
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 (dev) / http://localhost (Docker) |
| Backend API | http://localhost:5100 |
| Swagger UI | http://localhost:5100/swagger |

### Default Credentials

```
Username: admin
Password: Admin@123
```

## Project Structure

### Fullstack Project

```
my-app/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── Core/            # Domain & Application layers
│   │   ├── Infrastructure/  # Database, External services
│   │   └── Presentation/    # Controllers, API endpoints
│   └── tests/
├── frontend/                # Frontend SPA
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Route pages
│   │   ├── stores/          # State management
│   │   └── services/        # API services
│   └── ...
├── docker/                  # Docker configurations
├── docker-compose.yml       # Development environment
└── .env.example             # Environment template
```

### Backend Only (`-t backend`)

```
my-api/
├── backend/                 # Or root with --root flag
│   ├── src/
│   └── tests/
└── ...
```

### Frontend Only (`-t frontend`)

```
my-spa/
├── frontend/                # Or root with --root flag
│   ├── src/
│   └── ...
└── ...
```

## Features Included

### Backend Features

- **Clean Architecture** - Domain, Application, Infrastructure, Presentation layers
- **Authentication** - JWT with refresh token rotation
- **Authorization** - Role-based access control
- **Database** - PostgreSQL with migrations
- **Real-time** - SignalR (.NET) / WebSocket notifications
- **File Upload** - Multi-file upload with validation
- **Audit Logging** - Track all data changes
- **Health Checks** - Liveness and readiness endpoints
- **API Documentation** - Swagger/OpenAPI with auth support
- **Data Export** - CSV, Excel, PDF export
- **Pagination** - Server-side pagination with sorting and filtering

### Frontend Features

- **Authentication** - Login, logout, token refresh
- **Responsive Layout** - Sidebar, header, breadcrumbs
- **Dark Mode** - Theme switching support
- **Data Tables** - Server-side pagination, sorting, filtering
- **Form Validation** - Client-side validation
- **Toast Notifications** - Success, error, info messages
- **Confirmation Dialogs** - For destructive actions
- **File Management** - Upload, download, preview
- **Internationalization** - i18n ready
- **State Management** - Pinia (Vue) / Zustand (React)

### DevOps Features

- **Docker** - Multi-stage builds, docker-compose
- **CI/CD** - GitHub Actions workflows
- **Environment Config** - Validated environment variables
- **Scripts** - Project renaming, database setup

## Requirements

| Tool | Version | Required For |
|------|---------|--------------|
| Node.js | 18+ | All projects |
| Docker | Latest | Running with containers |
| .NET SDK | 8.0+ | .NET backend development |
| Java | 21+ | Spring Boot development |

## Example Stacks

### Enterprise .NET Stack
```bash
npm create @abuhannaa/apptemplate@latest enterprise-app \
  -b dotnet -f react -u mui -n "Contoso.Enterprise" -i
```

### Startup Vue Stack
```bash
npm create @abuhannaa/apptemplate@latest startup-app \
  -b nestjs -f vue -u primevue -i
```

### Microservice Backend
```bash
npm create @abuhannaa/apptemplate@latest user-service \
  -t backend -b spring -n "com.mycompany.userservice" --root -i
```

### Admin Dashboard
```bash
npm create @abuhannaa/apptemplate@latest admin-dashboard \
  -t frontend -f react -u primereact -i
```

## Links

- [GitHub Repository](https://github.com/abuhanna/app-template)
- [Report Issues](https://github.com/abuhanna/app-template/issues)
- [NPM Package](https://www.npmjs.com/package/@abuhannaa/create-apptemplate)

## License

MIT

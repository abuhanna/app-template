# @abuhannaa/create-apptemplate

Create fullstack applications with .NET/Spring/NestJS backends and Vue (Vuetify/PrimeVue) frontends.

## Quick Start

```bash
# Using npm
npm create @abuhannaa/apptemplate@latest

# Using npx
npx @abuhannaa/create-apptemplate my-app

# Using pnpm
pnpm create @abuhannaa/apptemplate

# Using yarn
yarn create @abuhannaa/apptemplate

# Using bun
bun create @abuhannaa/apptemplate
```

## Features

- **Multiple Backend Options**
  - .NET 8 (Clean Architecture, CQRS, Entity Framework)
  - Spring Boot 3 (Clean Architecture, Java 21)
  - NestJS (Clean Architecture, TypeScript)

- **Multiple Frontend Options**
  - Vuetify (Material Design 3)
  - PrimeVue (Aura Theme)

- **Project Types**
  - Fullstack (Backend + Frontend + Docker)
  - Backend only (API service)
  - Frontend only (SPA)

- **Production Ready**
  - Docker & Docker Compose setup
  - CI/CD with GitHub Actions
  - Environment configuration
  - JWT Authentication
  - Real-time notifications (SignalR/WebSocket)

## Usage

### Interactive Mode (Recommended)

Simply run the command without arguments:

```bash
npm create @abuhannaa/apptemplate@latest
```

The wizard will guide you through:

1. **Project location** - Where to create your project
2. **Project type** - Fullstack, Backend only, or Frontend only
3. **Backend framework** - .NET 8, Spring Boot 3, or NestJS
4. **UI library** - Vuetify or PrimeVue
5. **Project name** - For namespaces (e.g., MyCompany.MyApp)
6. **Install dependencies** - Whether to install now

### Non-Interactive Mode

Specify all options via command line:

```bash
# Fullstack project with .NET backend and Vuetify frontend
npx @abuhannaa/create-apptemplate my-app -b dotnet -u vuetify -n "MyCompany.MyApp" -i

# Backend-only project with Spring Boot
npx @abuhannaa/create-apptemplate my-api -t backend -b spring -n "MyCompany.MyApi"

# Frontend-only project with PrimeVue
npx @abuhannaa/create-apptemplate my-spa -t frontend -u primevue
```

## Options

| Option | Alias | Description | Values |
|--------|-------|-------------|--------|
| `--type` | `-t` | Project type | `fullstack`, `backend`, `frontend` |
| `--backend` | `-b` | Backend framework | `dotnet`, `spring`, `nestjs` |
| `--ui` | `-u` | UI library | `vuetify`, `primevue` |
| `--name` | `-n` | Project name (namespaces) | `Company.Project` format |
| `--install` | `-i` | Install dependencies | - |
| `--help` | `-h` | Show help | - |
| `--version` | `-v` | Show version | - |

## After Creation

```bash
# Navigate to project
cd my-app

# Setup environment
cp .env.example .env

# Start with Docker (recommended)
docker compose up -d --build

# Or run manually:
# Backend (.NET)
cd backend-dotnet/src/Presentation/App.Template.WebAPI && dotnet run

# Frontend
cd frontend-vuetify && npm run dev
```

### Access Points

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5100
- **Swagger UI**: http://localhost:5100/swagger

### Default Login

- **Username**: `admin`
- **Password**: `Admin@123`

## Project Structure

```
my-app/
├── backend-dotnet/          # .NET 8 API (if selected)
│   ├── src/
│   │   ├── Core/            # Domain & Application layers
│   │   ├── Infrastructure/  # EF Core, Services
│   │   └── Presentation/    # Controllers, Middleware
│   └── tests/
├── frontend-vuetify/        # Vue 3 + Vuetify (if selected)
│   ├── src/
│   │   ├── components/      # Vue components
│   │   ├── pages/           # File-based routing
│   │   ├── stores/          # Pinia state
│   │   └── services/        # API services
│   └── ...
├── docker/                  # Docker configurations
├── scripts/                 # Utility scripts
├── Dockerfile               # Unified container build
├── docker-compose.yml       # Development setup
└── .env.example             # Environment template
```

## Requirements

- **Node.js** 18.0.0 or higher
- **Docker** (recommended for running the app)
- **.NET 8 SDK** (for .NET backend development)
- **Java 21** (for Spring backend development)

## Documentation

For detailed documentation, see:

- [Backend Guide](https://github.com/abuhanna/app-template/blob/main/backend-dotnet/README.md)
- [Frontend Guide](https://github.com/abuhanna/app-template/blob/main/frontend-vuetify/README.md)
- [Deployment Guide](https://github.com/abuhanna/app-template/blob/main/DEPLOYMENT.md)

## License

MIT

# AppTemplate - Fullstack Application Scaffolding

A modern fullstack application template for building web applications with .NET 8 backend and Vue 3 frontend.

## Overview

- **Backend**: .NET 8 RESTful API ([Documentation](./backend-dotnet/README.md))
- **Frontend**: Vue 3 + Vuetify 3 ([Documentation](./frontend-vuetify/README.md))
- **Database**: PostgreSQL 15
- **Deployment**: Docker + GitHub Actions ([Guide](./DEPLOYMENT.md))
- **Contributing**: Development workflow ([Guide](./CONTRIBUTING.md))

## Features

- **Authentication**: JWT-based with hybrid local + optional SSO support
- **User Management**: Full CRUD with role-based access control
- **Department Management**: Organizational structure management
- **Real-time Notifications**: SignalR WebSocket integration
- **Clean Architecture**: Maintainable and testable codebase

## Creating a New Project

Use the CLI scaffolding tool to create a new project from this template. The wizard guides you through selecting project type, backend, frontend, and UI library.

### Interactive Mode (Recommended)

**Windows (PowerShell):**
```powershell
.\scripts\create-project.ps1 -OutputPath "C:\Projects\MyApp" -ProjectName "MyCompany.MyApp"
```

**Linux/Mac (Bash):**
```bash
./scripts/create-project.sh -o ~/projects/myapp -n "MyCompany.MyApp"
```

The wizard will guide you through:
1. **Project Type**: Fullstack, Backend Only, or Frontend Only
2. **Backend Framework**: .NET 8 (others coming soon)
3. **Frontend Framework**: Vue 3 (others coming soon)
4. **UI Library**: Vuetify (Material Design) or PrimeVue

### Non-Interactive Mode

Specify all options via command line parameters:

**Fullstack Project (default):**
```bash
# Windows
.\scripts\create-project.ps1 -OutputPath "C:\Projects\MyApp" -ProjectName "MyCompany.MyApp" -ProjectType fullstack -UI vuetify

# Linux/Mac
./scripts/create-project.sh -o ~/projects/myapp -n "MyCompany.MyApp" -t fullstack -u vuetify
```

**Backend Only:**
```bash
# Windows
.\scripts\create-project.ps1 -OutputPath "C:\Projects\MyApi" -ProjectName "MyCompany.MyApi" -ProjectType backend

# Linux/Mac
./scripts/create-project.sh -o ~/projects/myapi -n "MyCompany.MyApi" -t backend
```

**Frontend Only:**
```bash
# Windows
.\scripts\create-project.ps1 -OutputPath "C:\Projects\MyApp" -ProjectName "MyCompany.MyApp" -ProjectType frontend -UI primevue

# Linux/Mac
./scripts/create-project.sh -o ~/projects/myapp -n "MyCompany.MyApp" -t frontend -u primevue
```

### CLI Parameters

| Parameter | Short | Description | Values |
|-----------|-------|-------------|--------|
| `-OutputPath` | `-o` | Output directory (required) | Path |
| `-ProjectName` | `-n` | Project name (required) | Company.Project format |
| `-ProjectType` | `-t` | Type of project | `fullstack`, `backend`, `frontend` |
| `-Backend` | `-b` | Backend framework | `dotnet` |
| `-Frontend` | `-f` | Frontend framework | `vue` |
| `-UI` | `-u` | UI library | `vuetify`, `primevue` |

### Project Types

| Type | Includes | Use Case |
|------|----------|----------|
| **Fullstack** | Backend + Frontend + Docker | Complete web application |
| **Backend** | .NET API + PostgreSQL Docker | API-only service, microservice |
| **Frontend** | Vue SPA + Nginx Docker | SPA with external API |

### UI Framework Comparison

| Feature | Vuetify | PrimeVue |
|---------|---------|----------|
| Design System | Material Design 3 | Custom (Aura theme) |
| Components | 80+ | 90+ |
| Theming | CSS variables | Styled/Unstyled modes |
| Bundle Size | ~300KB | ~250KB |
| Documentation | Excellent | Excellent |

---

## Quick Start

### Using Docker (Recommended)

```bash
# 1. Clone repository
git clone <repository-url>
cd AppTemplate

# 2. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 3. Start services
docker compose up -d --build
```

**Access:**
- Frontend: http://localhost
- Backend API: http://localhost:5100
- Swagger UI: http://localhost:5100/swagger
- Database: localhost:5432

**Default Login:**
- Username: `admin`
- Password: `Admin@123`

### Manual Development

**Backend:**
```bash
cd backend-dotnet/src/Presentation/App.Template.WebAPI
cp appsettings.example.json appsettings.Development.json
# Edit appsettings.Development.json
dotnet run
```
See [Backend README](./backend-dotnet/README.md) for detailed guide.

**Frontend:**
```bash
cd frontend-vuetify
npm install
npm run dev
```
See [Frontend README](./frontend-vuetify/README.md) for detailed guide.

## Monorepo Structure

```
AppTemplate/
├── backend-dotnet/                 # .NET 8 API → See backend-dotnet/README.md
│   ├── src/
│   │   ├── Core/                   # Domain & Application layers
│   │   │   ├── App.Template.Domain/      # Entities (namespace: AppTemplate.Domain)
│   │   │   └── App.Template.Application/ # CQRS, DTOs (namespace: AppTemplate.Application)
│   │   ├── Infrastructure/         # EF Core, Services
│   │   │   └── App.Template.Infrastructure/ # (namespace: AppTemplate.Infrastructure)
│   │   └── Presentation/           # Controllers, Middleware
│   │       └── App.Template.WebAPI/      # (namespace: AppTemplate.WebAPI)
│   └── tests/
│
├── backend-spring/                 # Java Spring Boot 3 (alternative)
│   └── ...
│
├── backend-nestjs/                 # Node.js NestJS (alternative)
│   └── ...
│
├── frontend-vuetify/               # Vue 3 + Vuetify (default) → See frontend-vuetify/README.md
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   ├── pages/                  # File-based routing
│   │   ├── stores/                 # Pinia state management
│   │   └── services/               # API integration
│   └── ...
│
├── frontend-primevue/              # Vue 3 + PrimeVue (alternative)
│   └── ...                         # Same structure as frontend-vuetify/
│
├── scripts/                        # CLI tools
│   ├── create-project.ps1          # Project scaffolding (Windows)
│   ├── create-project.sh           # Project scaffolding (Linux/Mac)
│   ├── rename-project.ps1          # Rename existing project
│   └── rename-project.sh
│
├── docker/                         # Docker configurations
│   ├── nginx/                      # Nginx configs
│   │   ├── default.conf            # Fullstack nginx config
│   │   └── frontend-only.conf      # Frontend-only nginx config
│   ├── supervisor/                 # Process manager configs
│   ├── Dockerfile.backend          # Backend-only Dockerfile
│   └── Dockerfile.frontend         # Frontend-only Dockerfile
│
├── .github/workflows/              # CI/CD pipelines
│
├── Dockerfile                      # Unified container build (fullstack)
├── docker-compose.yml              # Local development (fullstack)
├── docker-compose.backend.yml      # Backend-only development
├── docker-compose.frontend.yml     # Frontend-only development
├── docker-compose.staging.yml      # Staging environment
├── docker-compose.production.yml   # Production environment
│
├── README.md                       # This file
├── DEPLOYMENT.md                   # Deployment guide
├── CONTRIBUTING.md                 # Development workflow
└── CLAUDE.md                       # AI assistant guide
```

**Note**: Folder names use `App.Template.*` format while C# namespaces use `AppTemplate.*` (configured via .csproj).

## Tech Stack

### Backend
- .NET 8.0 with Clean Architecture
- Entity Framework Core + PostgreSQL
- MediatR (CQRS)
- FluentValidation
- JWT Authentication (local + SSO)
- BCrypt password hashing
- SignalR for real-time notifications
- Swagger/OpenAPI

### Frontend
- Vue 3 (Composition API)
- Vuetify 3 (Material Design)
- Pinia (State Management)
- File-based Routing
- Auto-import Components
- Vite (Build Tool)
- Axios with JWT interceptor

### Infrastructure
- Docker + Docker Compose
- Nginx (Reverse Proxy)
- Supervisor (Process Manager)
- GitHub Actions (CI/CD)
- PostgreSQL 15

## Documentation

| Document | Description |
|----------|-------------|
| [Backend Guide](./backend-dotnet/README.md) | .NET API development, CQRS, Clean Architecture |
| [Frontend Guide](./frontend-vuetify/README.md) | Vue development, components, state management |
| [Deployment Guide](./DEPLOYMENT.md) | Docker, CI/CD, environments, rollback strategies |
| [Contributing Guide](./CONTRIBUTING.md) | Git workflow, coding standards, PR process |
| [CLAUDE.md](./CLAUDE.md) | Comprehensive guide for AI assistants |

## Common Tasks

### Run Application

**With Docker:**
```bash
docker compose up -d --build          # Start all services
docker compose logs -f                # View logs
docker compose down                   # Stop services
```

**Without Docker:**
```bash
# Backend
cd backend-dotnet/src/Presentation/App.Template.WebAPI
dotnet run

# Frontend (new terminal)
cd frontend-vuetify
npm run dev
```

### Database Migrations

```bash
cd backend-dotnet

# Add migration
dotnet ef migrations add MigrationName \
  --project src/Infrastructure/App.Template.Infrastructure \
  --startup-project src/Presentation/App.Template.WebAPI

# Apply migration (auto-applied on startup)
dotnet ef database update \
  --project src/Infrastructure/App.Template.Infrastructure \
  --startup-project src/Presentation/App.Template.WebAPI
```

See [Backend README](./backend-dotnet/README.md#database-migrations) for details.

### Update Dependencies

```bash
# Backend
cd backend-dotnet
dotnet list package --outdated
dotnet add package PackageName

# Frontend
cd frontend-vuetify
npm outdated
npm update
```

### View Logs

```bash
# Docker
docker compose logs -f               # All services
docker compose logs -f app           # Application
docker compose logs -f db            # Database

# Application (without Docker)
# Backend logs: console output from dotnet run
# Frontend logs: console output from npm run dev
```

### Backup & Restore Database

```bash
# Backup
docker exec apptemplate-db-dev pg_dump -U postgres apptemplate_dev > backup.sql

# Restore
docker exec -i apptemplate-db-dev psql -U postgres apptemplate_dev < backup.sql
```

## Deployment

### Environments

| Environment | Branch | Auto-Deploy | Access |
|-------------|--------|-------------|--------|
| **Development** | `feature/*` | No | localhost |
| **Staging** | `develop` | Yes | Staging server |
| **Production** | `main` | Yes | Production server |

### Deploy to Staging

```bash
git push origin develop
# Automatically builds and deploys to staging via GitHub Actions
```

### Deploy to Production

```bash
git push origin main
# Automatically builds and deploys to production via GitHub Actions
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide including:
- Unified container architecture
- CI/CD pipeline details
- Environment variables setup
- Manual deployment steps
- Monitoring & rollback strategies

## Contributing

We welcome contributions! Please follow these steps:

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Follow our coding standards
   - Add tests for new features
   - Update documentation

3. **Test locally**
   ```bash
   docker compose up -d --build
   ```

4. **Create Pull Request**
   - Target: `develop` branch
   - Fill in PR template
   - Address review comments

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed workflow including:
- Git branching strategy
- Coding standards (Backend & Frontend)
- Commit message conventions
- PR process & code review guidelines
- Testing requirements

## Troubleshooting

### Quick Fixes

**Docker Issues:**
```bash
# Port already in use
# Windows: netstat -ano | findstr :5100
# Linux/Mac: lsof -i :5100

# Container won't start
docker compose logs app
docker compose up -d --force-recreate app

# Database connection failed
docker compose logs db
# Wait 30s for health check
```

**Backend Issues:**
```bash
# Connection string not found
# → Create appsettings.Development.json from appsettings.example.json

# JWT authentication fails
# → Verify Jwt:Secret is at least 32 characters

# Migration errors
# → Check both --project and --startup-project flags
```

**Frontend Issues:**
```bash
# Module not found
cd frontend-vuetify
rm -rf node_modules package-lock.json
npm install

# API calls failing
# → Check backend is running
# → Verify VITE_API_BASE_URL in .env
```

For detailed troubleshooting:
- [Backend README](./backend-dotnet/README.md#troubleshooting)
- [Frontend README](./frontend-vuetify/README.md#troubleshooting)
- [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting-deployment)

## Architecture Overview

### Backend: Clean Architecture + CQRS

```
Core/
├── Domain/          # Entities (User, Department, Notification)
└── Application/     # Use Cases, DTOs, Interfaces

Infrastructure/      # EF Core, Services (Auth, Notifications)
Presentation/        # Controllers, Middleware
```

**Key Patterns:** CQRS with MediatR, Rich Domain Models, FluentValidation

See [Backend README](./backend-dotnet/README.md#architecture-patterns) for details.

### Frontend: Component Architecture

```
src/
├── components/      # Reusable components (auto-imported)
├── pages/          # File-based routing (dashboard, users, departments)
├── stores/         # Pinia state management
└── services/       # API integration
```

**Key Features:** Auto-import, File-based routing, Reactive state, Axios interceptors

See [Frontend README](./frontend-vuetify/README.md#project-structure) for details.

## Additional Resources

### External Documentation
- [.NET 8 Documentation](https://docs.microsoft.com/en-us/dotnet/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vuetify 3 Documentation](https://vuetifyjs.com/)
- [Docker Documentation](https://docs.docker.com/)

### Project Documentation
- **Development Guides**: [Backend](./backend-dotnet/README.md) | [Frontend](./frontend-vuetify/README.md)
- **Operations**: [Deployment](./DEPLOYMENT.md) | [Contributing](./CONTRIBUTING.md)
- **AI Guide**: [CLAUDE.md](./CLAUDE.md)

## Support

**For Development Questions:**
- Check relevant documentation above
- Review [CONTRIBUTING.md](./CONTRIBUTING.md)
- Search existing issues

**For Issues:**
- Create new issue with reproduction steps
- Include logs and environment details
- Tag with appropriate labels

**For Contributions:**
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) first
- Discuss major changes in issues before starting
- Follow PR template

---

**Built with .NET 8 & Vue 3**

| Quick Links | |
|-------------|---|
| Backend Guide | [backend/README.md](./backend-dotnet/README.md) |
| Frontend Guide | [frontend/README.md](./frontend-vuetify/README.md) |
| Deployment | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Contributing | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Full Docs | [CLAUDE.md](./CLAUDE.md) |

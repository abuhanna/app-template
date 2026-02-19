# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AppTemplate is a fullstack application scaffolding template monorepo containing:
- **Backend**: .NET 8.0, Spring Boot 3, or NestJS with multiple architecture options
- **Frontend (Vue)**: Vue 3 + Vuetify 3 or PrimeVue SPA with Vite
- **Frontend (React)**: React 18 + MUI or PrimeReact SPA with Vite
- **CLI Tool**: `@abuhannaa/create-apptemplate` - scaffolding generator published to NPM

This is the **source repository** for the NPM package. End users scaffold projects via `npm create @abuhannaa/apptemplate@latest`.

---

## Common Commands

### Backend (.NET)

```bash
cd backend/dotnet/clean-architecture/full

# Build
dotnet build

# Run all tests
dotnet test

# Run single test file
dotnet test --filter "FullyQualifiedName~UserTests"

# Run single test method
dotnet test --filter "FullyQualifiedName~UserTests.User_Create_ShouldSetProperties"

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run application
dotnet run --project src/Presentation/App.Template.WebAPI

# Add migration
dotnet ef migrations add <MigrationName> --project src/Infrastructure/App.Template.Infrastructure --startup-project src/Presentation/App.Template.WebAPI

# Apply migrations (also auto-applied on startup)
dotnet ef database update --project src/Infrastructure/App.Template.Infrastructure --startup-project src/Presentation/App.Template.WebAPI
```

Backend runs at `http://localhost:5100` with Swagger at `/swagger`.

### Frontend (Vue - Vuetify/PrimeVue)

```bash
cd frontend/vue/vuetify/full  # or frontend/vue/primevue/full

npm install        # Install dependencies
npm run dev        # Development server (http://localhost:3000)
npm run build      # Production build

# Testing
npm run test              # Run tests once
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage

# Linting & Formatting
npm run lint              # Lint and auto-fix
npm run lint:check        # Check lint (no fix)
npm run format            # Format with Prettier
npm run format:check      # Check formatting
```

### Frontend (React - MUI/PrimeReact)

```bash
cd frontend/react/mui/full  # or frontend/react/primereact/full

npm install        # Install dependencies
npm run dev        # Development server (http://localhost:3000)
npm run build      # Production build
npm run lint       # Lint with ESLint
npm run typecheck  # TypeScript type checking
```

### CLI Tool (`create-apptemplate`)

```bash
cd create-apptemplate

npm install        # Install dependencies
npm run build      # Build with tsup
npm run dev        # Build in watch mode
npm run typecheck  # TypeScript type checking
```

### Docker

```bash
cp .env.example .env      # Setup environment
docker compose up -d --build   # Start all services
docker compose logs -f         # View logs
docker compose down            # Stop services
```

Access: Frontend at `http://localhost`, API at `http://localhost:5100`, API via nginx at `http://localhost/api`.

---

## Monorepo Structure

```
├── backend/
│   ├── dotnet/
│   │   ├── clean-architecture/
│   │   │   ├── full/              # All features (user management, departments, etc.)
│   │   │   └── minimal/           # Auth, files, audit logs, notifications only
│   │   ├── feature-architecture/
│   │   │   ├── full/
│   │   │   └── minimal/
│   │   └── nlayer-architecture/
│   │       ├── full/
│   │       └── minimal/
│   ├── spring/
│   │   ├── clean-architecture/{full,minimal}/
│   │   ├── feature-architecture/{full,minimal}/
│   │   └── nlayer-architecture/{full,minimal}/
│   └── nestjs/
│       ├── clean-architecture/{full,minimal}/
│       ├── feature-architecture/{full,minimal}/
│       └── nlayer-architecture/{full,minimal}/
├── frontend/
│   ├── vue/
│   │   ├── vuetify/{full,minimal}/
│   │   └── primevue/{full,minimal}/
│   └── react/
│       ├── mui/{full,minimal}/
│       └── primereact/{full,minimal}/
├── create-apptemplate/       # NPM CLI scaffolding tool
└── docker/                   # Docker/Nginx configurations
```

### Template Variants

- **full**: All features including user management, departments, dashboard, data export
- **minimal**: Auth, file upload, audit logs, notifications (no user/department management)

---

## Backend Architecture (Clean Architecture)

### Layer Dependencies
```
WebAPI → Application → Domain
           ↓
      Infrastructure
```

### Domain Layer (`App.Template.Domain`)
- Entities: `User`, `Department`, `Notification`, `RefreshToken`
- No dependencies on other layers
- Rich domain models with encapsulated business logic

### Application Layer (`App.Template.Application`)
- CQRS with MediatR: Commands for mutations, Queries for reads
- Feature folders: `Authentication`, `UserManagement`, `DepartmentManagement`, `NotificationManagement`
- FluentValidation for request validation
- DTOs and interfaces for infrastructure services

### Infrastructure Layer (`App.Template.Infrastructure`)
- `BpmDbContext` with EF Core + PostgreSQL (Npgsql)
- Service implementations: `JwtTokenService`, `PasswordHashService`, `EmailService`
- SignalR Hub for real-time notifications

### Presentation Layer (`App.Template.WebAPI`)
- RESTful controllers dispatching via MediatR
- JWT authentication with refresh token rotation
- Rate limiting middleware
- Swagger/OpenAPI with JWT auth UI

---

## Frontend Architecture

### Vue Frontends (Vuetify/PrimeVue)
- **Routing**: File-based via `unplugin-vue-router` - pages in `src/pages/` auto-generate routes
- **State**: Pinia stores in `src/stores/`
- **API**: Axios services in `src/services/` with auto token refresh interceptor
- **Components**: Auto-imported from `src/components/`
- **Layouts**: Layout components in `src/layouts/`

### React Frontends (MUI/PrimeReact)
- **Routing**: React Router v7 with route definitions in `src/router/`
- **State**: Zustand stores in `src/stores/`
- **API**: Axios services in `src/services/` with auto token refresh interceptor
- **Components**: Manual imports from `src/components/`
- **Layouts**: Layout components in `src/layouts/`
- **Types**: TypeScript types in `src/types/`

---

## Key Patterns

### Backend
- **No Repository Pattern**: Use `IBpmDbContext` directly
- **CQRS**: Commands mutate, Queries read
- **Rich Domain Models**: Business logic in entities, not handlers

### Vue Frontend
- **Composition API**: Use `<script setup>` syntax
- **Auto-imports**: Components, Vue APIs, and Pinia are auto-imported
- **API Abstraction**: API calls in service files, not components

### React Frontend
- **Functional Components**: Use hooks and TypeScript
- **Zustand for State**: Simple store pattern with `create()` from zustand
- **API Abstraction**: API calls in service files, stores handle state updates
- **Null-safe patterns**: Always use fallbacks like `(data || []).map()` for arrays

---

## Adding New Features

### Backend Feature
1. Create entity in `Domain/Entities`
2. Add `DbSet<TEntity>` to `IBpmDbContext` and `BpmDbContext`
3. Create DTOs in `Application/DTOs`
4. Create Commands/Queries in `Application/Features/{Area}/`
5. Add controller endpoints in `WebAPI/Controllers`
6. Create migration

### Vue Frontend Page
1. Create `.vue` file in `src/pages/` (routing is automatic)
2. Create API service in `src/services/`
3. Create Pinia store in `src/stores/` if needed
4. Update sidebar navigation in `components/AppSidebar.vue`

### React Frontend Page
1. Create `.tsx` file in `src/pages/`
2. Add route to `src/router/index.tsx`
3. Create API service in `src/services/`
4. Create Zustand store in `src/stores/` if needed
5. Update sidebar navigation in `components/layout/AppSidebar.tsx`

---

## Cross-Frontend Consistency

When making changes, ensure all frontend implementations stay aligned:
- **API services** should have the same function signatures and return types
- **Stores** should have the same state shape and actions
- **Pages** should have the same functionality and UX patterns
- **Toast notifications** use store methods: `showSuccess()`, `showError()`, `showInfo()`
- **Confirmation dialogs** should be used for destructive actions (delete, logout)

---

## Renaming the Project

Use the automated script to rename `App.Template` to your project name:

```powershell
# Windows
.\scripts\rename-project.ps1 -NewName "MyCompany.MyApp"
```

```bash
# Linux/Mac
./scripts/rename-project.sh "MyCompany.MyApp"
```

This renames folders, files, namespaces, and project references throughout the codebase.

---

## Seed Data

Default admin credentials (auto-seeded):
- **Username**: `admin`
- **Email**: `admin@apptemplate.local`
- **Password**: `Admin@123`
- **Role**: `Admin`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection string not found | Create `appsettings.Development.json` from example |
| JWT authentication fails | Ensure `Jwt:Secret` is at least 32 characters |
| Migration errors | Use both `--project` and `--startup-project` flags |
| Frontend API calls fail | Check backend is running and `VITE_API_BASE_URL` is correct |
| Port conflicts | Stop services on ports 80, 5432, 5100 |
| React undefined errors | Add null-safe fallbacks: `(array || []).map()` |

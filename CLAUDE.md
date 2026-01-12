# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AppTemplate is a fullstack application scaffolding template using a **monorepo structure**:

- **Backend**: .NET 8.0 RESTful API following Clean Architecture principles
- **Frontend**: Vue 3 + Vuetify 3 SPA with Vite build tool

This template provides a solid foundation for building new applications with authentication, user management, department management, and real-time notifications.

## Monorepo Structure

```
AppTemplate/
├── backend-dotnet/                   # .NET 8 API (default)
│   ├── App.Template.sln              # Solution file
│   ├── src/
│   │   ├── Core/
│   │   │   ├── App.Template.Domain/       # Entities, Enums
│   │   │   └── App.Template.Application/  # CQRS (Commands/Queries), DTOs
│   │   ├── Infrastructure/
│   │   │   └── App.Template.Infrastructure/ # EF Core, Services
│   │   └── Presentation/
│   │       └── App.Template.WebAPI/       # Controllers, Middleware
│   └── tests/
│       ├── App.Template.Domain.Tests/
│       └── App.Template.Application.Tests/
├── backend-spring/                   # Java Spring Boot 3 (alternative)
├── backend-nestjs/                   # Node.js NestJS (alternative)
├── frontend-vuetify/                 # Vue 3 + Vuetify Frontend (default)
│   ├── src/
│   │   ├── components/              # Vue components (auto-imported)
│   │   ├── pages/                   # File-based routing
│   │   ├── layouts/                 # Layout components
│   │   ├── stores/                  # Pinia state management
│   │   ├── services/                # API services (axios)
│   │   └── composables/             # Vue composables
│   └── nginx.conf
├── frontend-primevue/                # Vue 3 + PrimeVue (alternative)
├── docker/                          # Docker configuration files
│   ├── nginx/                       # Nginx configs for unified container
│   └── supervisor/                  # Supervisor configs (manages processes)
├── Dockerfile                       # Unified container build (Backend + Frontend + Nginx)
├── docker-compose.yml               # Local development
├── docker-compose.staging.yml       # Staging environment
├── docker-compose.production.yml    # Production environment
└── .env.example                     # Environment variables template
```

---

# Getting Started

## Renaming the Project

When using this template for a new project, you'll want to rename `App.Template` to your project name (e.g., `MyCompany.MyApp`).

### Automated Rename Script

Use the provided PowerShell script (Windows) or Bash script (Linux/Mac):

**Windows (PowerShell):**
```powershell
# Run from the root directory
.\scripts\rename-project.ps1 -NewName "MyCompany.MyApp"
```

**Linux/Mac (Bash):**
```bash
# Run from the root directory
./scripts/rename-project.sh "MyCompany.MyApp"
```

### Manual Rename Steps

If you prefer to rename manually, follow these steps:

1. **Rename folders** in `backend-dotnet/`:
   ```
   src/Core/App.Template.Domain         → src/Core/YourProject.Domain
   src/Core/App.Template.Application    → src/Core/YourProject.Application
   src/Infrastructure/App.Template.Infrastructure → src/Infrastructure/YourProject.Infrastructure
   src/Presentation/App.Template.WebAPI → src/Presentation/YourProject.WebAPI
   tests/App.Template.Domain.Tests      → tests/YourProject.Domain.Tests
   tests/App.Template.Application.Tests → tests/YourProject.Application.Tests
   ```

2. **Rename .csproj files** inside each folder:
   ```
   App.Template.Domain.csproj         → YourProject.Domain.csproj
   App.Template.Application.csproj    → YourProject.Application.csproj
   App.Template.Infrastructure.csproj → YourProject.Infrastructure.csproj
   App.Template.WebAPI.csproj         → YourProject.WebAPI.csproj
   App.Template.Domain.Tests.csproj   → YourProject.Domain.Tests.csproj
   App.Template.Application.Tests.csproj → YourProject.Application.Tests.csproj
   ```

3. **Rename solution file**:
   ```
   App.Template.sln → YourProject.sln
   ```

4. **Update project references** in all `.csproj` files - replace `App.Template` with your project name in `<ProjectReference>` elements

5. **Update solution file** (`YourProject.sln`) - replace all `App.Template` paths

6. **Update namespaces** in `.csproj` files - modify `<RootNamespace>` and `<AssemblyName>`:
   ```xml
   <RootNamespace>YourProject.Domain</RootNamespace>
   <AssemblyName>YourProject.Domain</AssemblyName>
   ```

7. **Update C# namespaces** - Find and replace in all `.cs` files:
   - `AppTemplate.Domain` → `YourProject.Domain`
   - `AppTemplate.Application` → `YourProject.Application`
   - `AppTemplate.Infrastructure` → `YourProject.Infrastructure`
   - `AppTemplate.WebAPI` → `YourProject.WebAPI`

8. **Update Dockerfile** - Replace paths to use your project name

9. **Update Makefile** - Replace paths to use your project name

10. **Verify build**:
    ```bash
    cd backend-dotnet
    dotnet build
    dotnet test
    ```

---

# Backend Development Guide

## Backend Architecture

The backend follows Clean Architecture with clear separation of concerns:

### Domain Layer (AppTemplate.Domain)
- Core business entities and domain logic
- No dependencies on other layers
- Rich domain models with encapsulated business logic
- Entities: User, Department, Notification, RefreshToken

### Application Layer (AppTemplate.Application)
- Application business logic and CQRS patterns
- Uses MediatR for CQRS implementation
- Features organized by domain area (UserManagement, DepartmentManagement, Authentication, NotificationManagement)
- Each feature contains Commands, Queries, and their handlers
- Interfaces define contracts for infrastructure services

### Infrastructure Layer (AppTemplate.Infrastructure)
- EF Core DbContext implementation (BpmDbContext)
- PostgreSQL database provider (Npgsql)
- Service implementations (PasswordHashService, JwtTokenService, EmailService, etc.)
- SignalR Hub for real-time notifications

### Presentation Layer (AppTemplate.WebAPI)
- RESTful controllers dispatching commands/queries via MediatR
- Swagger/OpenAPI integration with JWT authentication UI
- Rate limiting middleware
- Controllers: UsersController, DepartmentsController, AuthController, NotificationsController

## Key Features

### Authentication System
- **Hybrid Authentication**: Supports both local database users AND optional SSO integration
- **Local Users**: Users stored in PostgreSQL with BCrypt password hashing
- **JWT Tokens**: Generated locally using IJwtTokenService with refresh token support
- **Refresh Tokens**: Automatic token rotation for enhanced security
- **SSO Integration**: Optional - can proxy to external SSO if configured
- **Password Reset**: Email-based password reset flow

### User Management
- Full CRUD operations for users
- Password management with BCrypt hashing
- Role-based access (Admin role for user management)
- Department assignment
- User profile self-management

### Department Management
- Full CRUD operations for departments
- Unique department codes
- Active/Inactive status

### Real-time Notifications
- SignalR WebSocket connection
- Push notifications to connected users
- Mark as read/mark all as read functionality

### Security Features
- Rate limiting on sensitive endpoints (login, password reset)
- JWT token rotation with refresh tokens
- Password reset with expiring tokens
- Email enumeration protection

## Backend Development Commands

### Build & Run
```bash
cd backend-dotnet

# Build
dotnet build

# Run application
cd src/Presentation/App.Template.WebAPI
dotnet run
```

Backend API available at:
- API: `http://localhost:5100`
- Swagger UI: `http://localhost:5100/swagger` (Development & Staging only)
- Health Check: `http://localhost:5100/health`

### Database Migrations
```bash
# From backend-dotnet/ directory
dotnet ef migrations add <MigrationName> --project src/Infrastructure/App.Template.Infrastructure --startup-project src/Presentation/App.Template.WebAPI

# Apply migrations (auto-applied on startup)
dotnet ef database update --project src/Infrastructure/App.Template.Infrastructure --startup-project src/Presentation/App.Template.WebAPI
```

**Auto-Migration**: All environments automatically apply migrations on application start.

## Seed Data

The database includes seed data:
- **Default Department**: IT (Information Technology)
- **Admin User**:
  - Username: `admin`
  - Email: `admin@apptemplate.local`
  - Password: `Admin@123`
  - Role: `Admin`

---

# Frontend Development Guide

## Frontend Architecture

Vue 3 + Vuetify 3 SPA with:
- **Build Tool**: Vite
- **State Management**: Pinia (Composition API style)
- **Routing**: File-based routing with unplugin-vue-router
- **HTTP Client**: Axios with JWT interceptor and automatic token refresh
- **UI Framework**: Vuetify 3 (Material Design)

### File-Based Routing
Routes automatically generated from `frontend-vuetify/src/pages/`:
- `src/pages/index.vue` → `/`
- `src/pages/dashboard.vue` → `/dashboard`
- `src/pages/users/index.vue` → `/users`
- `src/pages/departments/index.vue` → `/departments`
- `src/pages/notifications/index.vue` → `/notifications`
- `src/pages/profile.vue` → `/profile`
- `src/pages/forgot-password.vue` → `/forgot-password`
- `src/pages/reset-password.vue` → `/reset-password`

### State Management (Pinia)
Store location: `frontend-vuetify/src/stores/`

**Available Stores:**
- `auth.js` - Authentication state (user, token, refresh token, login/logout)
- `user.js` - User management (CRUD operations)
- `department.js` - Department management (CRUD operations)
- `notification.js` - Global notification system (toast/snackbar)
- `persistentNotification.js` - Real-time persistent notifications (SignalR)

### API Services
Location: `frontend-vuetify/src/services/`

**Available API Services:**
- `authApi.js` - Authentication (login, logout, refresh token, password reset)
- `userApi.js` - Users (CRUD operations, password change)
- `departmentApi.js` - Departments (CRUD operations)
- `notificationApi.js` - Notifications (read, mark as read)

## Frontend Development Commands

```bash
cd frontend-vuetify

# Install dependencies
npm install

# Development server
npm run dev          # Runs on http://localhost:3000

# Build for production
npm run build
```

---

# Docker Development

## Local Development

```bash
# 1. Create .env file from example
cp .env.example .env

# 2. Start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

**Access Points:**
- Frontend: http://localhost
- Backend API: http://localhost:5100
- API via Nginx: http://localhost/api
- Swagger UI: http://localhost:5100/swagger

## Environment Variables

Key configuration in `.env`:
```bash
# Database
DB_NAME=apptemplate_dev

# JWT (generate a secure 32+ character secret)
JWT_SECRET=your-dev-secret-key-minimum-32-characters-long
JWT_ISSUER=AppTemplate
JWT_AUDIENCE=AppTemplate

# SSO (optional - leave empty for local auth only)
SSO_API_BASE_URL=
```

---

# Common Development Patterns

## Adding New Backend Features
1. Create entity in `Domain/Entities`
2. Add `DbSet<TEntity>` to `IBpmDbContext` and `BpmDbContext`
3. Create DTOs in `Application/DTOs`
4. Create Commands/Queries in `Application/Features/{Area}/`
5. Add controller endpoints in `WebAPI/Controllers`
6. Create migration

## Adding New Frontend Pages
1. Create `.vue` file in `frontend-vuetify/src/pages/` (routing is automatic)
2. Create API service in `frontend-vuetify/src/services/`
3. Create Pinia store in `frontend-vuetify/src/stores/`
4. Update sidebar navigation in `components/AppSidebar.vue`

## Key Patterns

### Backend
- **Rich Domain Models**: Keep business logic in entities, not handlers
- **CQRS with MediatR**: Commands for mutations, Queries for reads
- **No Repository Pattern**: Use DbContext directly via IBpmDbContext
- **FluentValidation**: Use validators for request validation

### Frontend
- **Composition API**: Use `<script setup>` with Composition API
- **Auto-imports**: Components, Vue APIs, and Pinia are auto-imported
- **Centralized State**: Use Pinia stores for shared state
- **API Abstraction**: API calls in service files, not components
- **Auto Token Refresh**: Axios interceptor handles 401 and refreshes tokens

---

# Troubleshooting

## Common Issues

### Backend
- **"Connection string not found"**: Create `appsettings.Development.json` from example
- **JWT authentication fails**: Ensure `Jwt:Secret` is at least 32 characters
- **Migration errors**: Run with both `--project` and `--startup-project` flags

### Frontend
- **API calls fail**: Check backend is running and VITE_API_BASE_URL is correct
- **401 errors**: The axios interceptor should auto-refresh tokens. If issues persist, re-login.

### Docker
- **Port conflicts**: Stop existing services on ports 80, 5432, 5100
- **Database connection**: Wait for db health check before app starts

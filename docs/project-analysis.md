# AppTemplate - Comprehensive Technical Audit Report

**Date**: 2026-03-07
**Repository**: `abuhanna/app-template`
**Total files**: 2,113 (excluding node_modules, .git, bin, obj, dist, target)

---

## Table of Contents

1. [Repository Structure](#section-1-repository-structure)
2. [CLI Tool Analysis](#section-2-cli-tool-analysis)
3. [Backend Template Analysis](#section-3-backend-template-analysis)
4. [Frontend Template Analysis](#section-4-frontend-template-analysis)
5. [Shared Infrastructure](#section-5-shared-infrastructure)
6. [CLAUDE.md Analysis](#section-6-claudemd-analysis)
7. [Current Gaps & Issues](#section-7-current-gaps--issues)
8. [Generator Pattern Deep Dive](#section-8-generator-pattern-deep-dive)

---

## Section 1: Repository Structure

### Monorepo Layout

```
├── backend/                      # Backend templates (3 stacks x 3 architectures x 2 variants = 18)
│   ├── dotnet/                   # .NET 8.0 backends
│   │   ├── clean-architecture/{full,minimal}/
│   │   ├── feature-architecture/{full,minimal}/
│   │   └── nlayer-architecture/{full,minimal}/
│   ├── spring/                   # Spring Boot 3 backends
│   │   ├── clean-architecture/{full,minimal}/
│   │   ├── feature-architecture/{full,minimal}/
│   │   └── nlayer-architecture/{full,minimal}/
│   └── nestjs/                   # NestJS 10 backends
│       ├── clean-architecture/{full,minimal}/
│       ├── feature-architecture/{full,minimal}/
│       └── nlayer-architecture/{full,minimal}/
├── frontend/                     # Frontend templates (2 frameworks x 2 UI libs x 2 variants = 8)
│   ├── vue/
│   │   ├── vuetify/{full,minimal}/
│   │   └── primevue/{full,minimal}/
│   └── react/
│       ├── mui/{full,minimal}/
│       └── primereact/{full,minimal}/
├── create-apptemplate/           # NPM CLI scaffolding tool
├── docker/                       # Docker templates & configs
│   ├── nginx/                    # Nginx configuration
│   ├── supervisor/               # Supervisor process management
│   ├── templates/root/           # Root-level template files per backend
│   ├── Dockerfile.backend        # Backend-only Dockerfile
│   └── Dockerfile.frontend       # Frontend-only Dockerfile
├── nginx/                        # Root-level nginx configs
├── .github/workflows/            # CI/CD pipelines
├── scripts/                      # Rename scripts (PowerShell/Bash)
├── docker-compose.yml            # Root development compose
├── docker-compose.backend.yml    # Backend-only compose
├── docker-compose.frontend.yml   # Frontend-only compose
├── docker-compose.production.yml # Production compose
├── docker-compose.staging.yml    # Staging compose
├── Dockerfile                    # Root multi-stage Dockerfile
├── CLAUDE.md                     # AI assistant instructions
├── AGENTS.md                     # Multi-agent coding guidelines
└── package.json                  # Root monorepo config (Husky, commitlint)
```

### Combinatorial Matrix

| Dimension | Options | Count |
|-----------|---------|-------|
| Backend stack | dotnet, spring, nestjs | 3 |
| Architecture | clean, feature, nlayer | 3 |
| Frontend framework | vue, react | 2 |
| UI library | vuetify/primevue (Vue), mui/primereact (React) | 2 per framework |
| Variant | full, minimal | 2 |
| **Total backend combinations** | | **18** |
| **Total frontend combinations** | | **8** |
| **Total fullstack combinations** | | **72** |
| **Grand total scaffoldable configs** | | **98** |

### All package.json Files (16)

| Path | Purpose |
|------|---------|
| `./package.json` | Root monorepo (Husky, commitlint) |
| `./create-apptemplate/package.json` | CLI tool |
| `./backend/nestjs/clean-architecture/{full,minimal}/package.json` | NestJS clean-arch |
| `./backend/nestjs/feature-architecture/{full,minimal}/package.json` | NestJS feature-arch |
| `./backend/nestjs/nlayer-architecture/{full,minimal}/package.json` | NestJS nlayer-arch |
| `./frontend/vue/vuetify/{full,minimal}/package.json` | Vue Vuetify |
| `./frontend/vue/primevue/{full,minimal}/package.json` | Vue PrimeVue |
| `./frontend/react/mui/{full,minimal}/package.json` | React MUI |
| `./frontend/react/primereact/{full,minimal}/package.json` | React PrimeReact |

### All .csproj Files (20)

| Architecture | Projects |
|-------------|----------|
| Clean-arch (full/minimal) | Domain, Application, Infrastructure, WebAPI + 2 test projects (x2 variants = 12) |
| Feature-arch (full/minimal) | App.Template.Api + test project (x2 = 4) |
| N-Layer-arch (full/minimal) | App.Template.Api + test project (x2 = 4) |

### All pom.xml Files (14)

| Architecture | Modules |
|-------------|---------|
| Clean-arch (full/minimal) | parent + api, application, domain, infrastructure (x2 = 10) |
| Feature-arch (full/minimal) | single pom.xml (x2 = 2) |
| N-Layer-arch (full/minimal) | single pom.xml (x2 = 2) |

### All Dockerfiles (32)

Every backend variant (18), every frontend variant (8 with Docker support), root Dockerfile, `docker/Dockerfile.backend`, `docker/Dockerfile.frontend`, plus 3 backend-specific templates in `docker/templates/root/`.

---

## Section 2: CLI Tool Analysis

### Entry Point

**File**: `create-apptemplate/src/index.ts`
**Invocation**: `npm create @abuhannaa/apptemplate@latest` or `npx @abuhannaa/create-apptemplate`
**Package**: `@abuhannaa/create-apptemplate` v1.1.1

The `main()` function orchestrates the entire flow: displays intro banner, parses CLI args, determines interactive vs non-interactive mode, calls `generateProject(config)`, and displays next steps.

### Source Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Main entry point, flow orchestration, next steps display |
| `src/cli.ts` | CLI argument parsing (hand-rolled, no yargs/commander) |
| `src/prompts.ts` | Interactive prompts via @clack/prompts |
| `src/generator.ts` | Project generation orchestrator |
| `src/types.ts` | TypeScript type definitions |
| `src/utils/download.ts` | Template download via degit |
| `src/utils/rename.ts` | Namespace/project renaming |
| `src/utils/package-manager.ts` | Package manager detection & dep installation |

### Prompt Flow (Interactive Mode)

**Library**: `@clack/prompts` v0.9.1

| # | Prompt | Type | Skip Condition |
|---|--------|------|----------------|
| 1 | Project directory path | `p.text` | `--projectPath` provided |
| 2 | Project type (fullstack/backend/frontend) | `p.select` | `--type` provided |
| 3 | Backend framework (dotnet/spring/nestjs) | `p.select` | Frontend-only or `--backend` |
| 4 | Architecture (clean/nlayer/feature) | `p.select` | Frontend-only or `--architecture` |
| 5 | Frontend framework (vue/react) | `p.select` | Backend-only or `--framework` |
| 6 | UI library (context-dependent) | `p.select` | Backend-only or `--ui` |
| 7 | Template variant (full/minimal) | `p.select` | `--variant` provided |
| 8 | Project namespace (Company.Project) | `p.text` | Frontend-only, NestJS, or `--name` |
| 9 | Place files in root? | `p.confirm` | Fullstack or `--root` |
| 10 | Install dependencies? | `p.confirm` | `--install` |
| 11 | Confirm settings | `p.confirm` | Never skipped |

Validation on project path rejects non-empty existing directories. Namespace must match `^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$`.

### Generator System

**No template engine** (no EJS, Handlebars, or string templating). Uses a **download-and-mutate** strategy:

1. **degit** v2.8.4 downloads subdirectories from GitHub repo `abuhanna/app-template`
2. Files are copied as-is from the monorepo
3. Post-download regex-based string replacements rename namespaces

```typescript
// Backend download path formula (download.ts)
const folder = `backend/${backend}/${architecture}-architecture/${variant}`;
// e.g., "backend/dotnet/clean-architecture/full"

// Frontend download path formula
const folder = `frontend/${framework}/${ui}/${variant}`;
// e.g., "frontend/vue/vuetify/full"
```

### Non-Interactive Mode

Activates when: `projectPath` + `backend` + (namespace if dotnet/spring) are all provided via CLI flags.

| Flag | Alias | Type | Default |
|------|-------|------|---------|
| `--type` | `-t` | `fullstack\|backend\|frontend` | `fullstack` |
| `--backend` | `-b` | `dotnet\|spring\|nestjs` | Required |
| `--architecture` | `-a` | `clean\|nlayer\|feature` | `clean` |
| `--framework` | `-f` | `vue\|react` | `vue` |
| `--ui` | `-u` | `vuetify\|primevue\|mui\|primereact` | `vuetify` |
| `--name` | `-n` | `Company.Project` | Required for dotnet/spring |
| `--root` | `-r` | boolean | `false` |
| `--variant` | `-V` | `full\|minimal` | `full` |
| `--install` | `-i` | boolean | `false` |
| `--help` | `-h` | boolean | - |
| `--version` | `-v` | boolean | - |

### Post-Generation Actions

**Dependency installation** (if `--install` or user confirms):
- **.NET**: `dotnet restore` (finds `.sln` file)
- **Spring**: `./mvnw install -DskipTests` (falls back to `mvn`)
- **NestJS/Frontend**: Detected package manager (`bun` > `pnpm` > `yarn` > `npm`)

Installation failures are **warnings**, not fatal errors.

### Error Handling

Three-tier strategy:
1. **CLI validation**: Invalid values emit `console.warn()`, fall through to interactive prompt
2. **Generator failures**: Spinner stops, error re-thrown to top level
3. **Top-level catch**: `console.error(pc.red(...))`, `process.exit(1)`

Exception: Dependency install failures degrade to warnings. Docker cleanup errors silently ignored.

### Dependencies

**Runtime (4)**:

| Package | Version | Purpose |
|---------|---------|---------|
| `@clack/prompts` | ^0.9.1 | Interactive CLI prompts |
| `cross-spawn` | ^7.0.6 | Cross-platform process spawning |
| `degit` | ^2.8.4 | GitHub directory downloads |
| `picocolors` | ^1.1.1 | Terminal color output |

**Dev (5)**:

| Package | Version | Purpose |
|---------|---------|---------|
| `@types/cross-spawn` | ^6.0.6 | TypeScript types |
| `@types/degit` | ^2.8.6 | TypeScript types |
| `@types/node` | ^22.10.5 | Node.js types |
| `tsup` | ^8.3.5 | ESBuild-based bundler |
| `typescript` | ^5.7.3 | Type checking |

### Build Configuration

**File**: `create-apptemplate/tsup.config.ts`

```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
  splitting: false,
  shims: true,
  banner: { js: '#!/usr/bin/env node' },
});
```

### NPM Publish Setup

```json
{
  "name": "@abuhannaa/create-apptemplate",
  "version": "1.1.1",
  "type": "module",
  "bin": { "create-apptemplate": "./dist/index.js" },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  }
}
```

---

## Section 3: Backend Template Analysis

### 3.1 .NET Backend (6 variants)

#### Common Across All .NET Variants

- **Target**: .NET 8.0, PostgreSQL via EF Core + Npgsql
- **Auth**: JWT (HMAC-SHA256) with `Microsoft.AspNetCore.Authentication.JwtBearer`
- **Password hashing**: BCrypt.Net-Next 4.0.3 (full variants only)
- **Logging**: Serilog with structured JSON + console
- **API docs**: Swashbuckle.AspNetCore (Swagger)
- **Naming**: snake_case via `EFCore.NamingConventions` 8.0.3

#### Clean Architecture / Full

**Path**: `backend/dotnet/clean-architecture/full/`

**4-layer solution** (Domain → Application → Infrastructure → WebAPI):

| Layer | Project | Key Contents |
|-------|---------|-------------|
| Domain | `App.Template.Domain` | 7 entities, rich domain models, DomainException hierarchy |
| Application | `App.Template.Application` | CQRS via MediatR 12.5.0, FluentValidation 12.1.0, DTOs, interfaces |
| Infrastructure | `App.Template.Infrastructure` | EF Core DbContext, services (JWT, email, file storage, export), SignalR hub |
| Presentation | `App.Template.WebAPI` | Controllers, middleware (correlation ID, exception handler, request logging, rate limiting) |

**Entities**: User (rich model with password history, login tracking), Department, Notification, RefreshToken, AuditLog, UploadedFile, AuditableEntity (abstract base)

**API Endpoints (35+)**:

| Route | Method | Purpose |
|-------|--------|---------|
| `/health`, `/health/ready`, `/health/live` | GET | Health checks |
| `/api/auth/login` | POST | Login |
| `/api/auth/refresh` | POST | Refresh JWT token |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Current user from JWT |
| `/api/auth/profile` | GET/PUT | User profile |
| `/api/auth/forgot-password` | POST | Request reset email |
| `/api/auth/reset-password` | POST | Reset with token |
| `/api/auth/change-password` | POST | Change own password |
| `/api/users` | GET/POST | List/create users |
| `/api/users/{id}` | GET/PUT/DELETE | User CRUD |
| `/api/departments` | GET/POST | List/create departments |
| `/api/departments/{id}` | GET/PUT/DELETE | Department CRUD |
| `/api/files` | GET/POST | List/upload files |
| `/api/files/{id}` | GET/DELETE | File metadata/delete |
| `/api/files/{id}/download` | GET | Download file |
| `/api/Notifications` | GET | User notifications |
| `/api/Notifications/{id}/read` | PUT | Mark read |
| `/api/audit-logs` | GET | Audit logs (Admin) |
| `/api/export/{entity}` | GET | Export CSV/XLSX/PDF |
| `/hubs/notifications` | SignalR | Real-time notifications |

**Key Packages**:

| Package | Version |
|---------|---------|
| MediatR | 12.5.0 |
| FluentValidation | 12.1.0 |
| Microsoft.EntityFrameworkCore | 8.0.22 |
| Npgsql.EntityFrameworkCore.PostgreSQL | 8.0.11 |
| Serilog.AspNetCore | 10.0.0 |
| Swashbuckle.AspNetCore | 8.1.4 |
| AspNetCoreRateLimit | 5.0.0 |
| ClosedXML | 0.104.2 |
| QuestPDF | 2024.10.2 |
| CsvHelper | 33.0.1 |

**Tests** (5 files): LoginCommandValidatorTests, CreateUserCommandHandlerTests, CreateUserCommandValidatorTests, UserTests, DomainExceptionTests. Framework: xUnit 2.9.3 + Moq 4.20.72.

**Dockerfile**: Multi-stage (SDK 8.0 build → ASP.NET 8.0 runtime), curl for healthcheck, `EXPOSE 8080`.

#### Clean Architecture / Minimal

Same 4-layer structure but removes User, Department, RefreshToken entities. Auth is SSO-only (no password hashing). No seed data. 2 test files.

#### Feature Architecture / Full

**Path**: `backend/dotnet/feature-architecture/full/`

**Single project** with feature folders:

```
src/App.Template.Api/
  Common/         # Shared: entities, services, extensions
  Features/
    AuditLogs/    # Controller + Service + DTOs
    Auth/         # Controller + Service + DTOs
    Departments/  # Entity + Controller + Service + DTOs
    Files/        # Entity + Controller + Service + DTOs
    Users/        # Entity + Controller + Service + Repository + DTOs
    ...
  Data/           # AppDbContext
```

**Key difference**: No MediatR/CQRS, controllers call services directly. Only `UserRepository` exists; other features use `AppDbContext` directly. Anemic domain models (public setters).

**Tests**: 1 file (UsersControllerTests). Framework: xUnit 2.4.2, Moq 4.18.4.

#### Feature Architecture / Minimal

SSO-only auth, removes Users/Departments features. No test source files.

#### N-Layer Architecture / Full

**Path**: `backend/dotnet/nlayer-architecture/full/`

**Single project** with horizontal layering:

```
src/App.Template.Api/
  Controllers/     # All controllers
  Services/        # All services + interfaces
  Repositories/    # All repositories + interfaces (6 total)
  Models/
    Entities/      # All entities
    Dtos/          # All DTOs
    Common/        # PagedResult, PaginationQuery
  Data/            # AppDbContext
```

**Key difference**: ALL entities get repositories (vs. feature-arch's single UserRepository). Anemic models.

#### N-Layer Architecture / Minimal

SSO-only, 3 repositories (AuditLog, Notification, UploadedFile). No test source files.

#### Cross-Variant Comparison (.NET)

| Concern | Clean-arch | Feature-arch | N-Layer-arch |
|---------|-----------|-------------|-------------|
| Projects | 4 | 1 | 1 |
| CQRS/MediatR | Yes | No | No |
| Repositories | None (IApplicationDbContext) | Only UserRepository | All entities (6) |
| Domain models | Rich (private setters) | Anemic | Anemic |
| Test files (full) | 5 | 1 | 1 |
| Test files (minimal) | 2 | 0 | 0 |
| Docker HEALTHCHECK | Yes | No | No |
| Serilog version | 10.0.0 | 8.0.4 (full), 10.0.0 (minimal) | 8.0.4 (full), 10.0.0 (minimal) |

### 3.2 Spring Boot Backend (6 variants)

#### Clean Architecture / Full

**Path**: `backend/spring/clean-architecture/full/`

**Multi-module Maven project** (Java 21, Spring Boot 3.3.5):

```
pom.xml (parent)
  domain/        → Domain entities (no Spring dependencies)
  application/   → Use cases, DTOs, port interfaces, MapStruct mappers
  infrastructure/→ JPA entities, repository adapters, service implementations
  api/           → REST controllers, security config, middleware
```

**Key Packages**:

| Package | Version |
|---------|---------|
| Spring Boot | 3.3.5 |
| JJWT | 0.12.5 |
| MapStruct | 1.5.5.Final |
| Lombok | 1.18.30 |
| SpringDoc OpenAPI | 2.3.0 |
| Bucket4j (rate limiting) | 8.7.0 |
| Apache POI (Excel) | 5.2.5 |
| iText7 (PDF) | 8.0.2 |
| Logstash Logback Encoder | 7.4 |

**Database**: PostgreSQL via Spring Data JPA + Hibernate. **Flyway** for migrations (4 versioned SQL files). DDL strategy: `validate`.

**Auth**: JWT (HS256) via JJWT, refresh token rotation, BCrypt password hashing, password history (last 5).

**Testing**: JUnit 5, H2 in-memory for integration tests. 2 test files (unit + integration).

**Docker**: Multi-stage (eclipse-temurin:21-jdk-alpine build → 21-jre-alpine runtime). Non-root `spring` user. Health check via `wget`.

#### Feature Architecture / Full

**Path**: `backend/spring/feature-architecture/full/`

Single-module (Java 17, Spring Boot 3.2.0). Package-by-feature. Uses deprecated JJWT 0.11.5 API. **Default DB: H2 in-memory** with `ddl-auto=update` (no Flyway). 1 test file. Less mature than clean-arch.

#### N-Layer Architecture / Full

**Path**: `backend/spring/nlayer-architecture/full/`

Single-module, horizontal layering. Nearly identical code to feature-arch, just different package organization. Java 17, Spring Boot 3.2.0.

### 3.3 NestJS Backend (6 variants)

#### Clean Architecture / Full

**Path**: `backend/nestjs/clean-architecture/full/`

**CQRS** via `@nestjs/cqrs`. True clean architecture with domain/ORM entity separation:

```
src/modules/
  auth/
    application/commands/{login,logout,refresh-token,...}/
    application/queries/{get-current-user,get-my-profile}/
    domain/entities/refresh-token.entity.ts
    infrastructure/services/{bcrypt-password,jwt-token}.service.ts
    presentation/auth.controller.ts
  user-management/
    domain/entities/user.entity.ts        # Rich domain entity
    infrastructure/persistence/user.orm-entity.ts  # TypeORM entity
    ...
```

**Key Packages**:

| Package | Version |
|---------|---------|
| NestJS Core | ^10.4.0 |
| @nestjs/cqrs | ^10.2.0 |
| @nestjs/jwt | ^10.2.0 |
| @nestjs/swagger | ^7.4.0 |
| TypeORM | ^0.3.20 |
| bcrypt | ^5.1.1 |
| nestjs-pino + pino | ^4.5.0 / ^10.2.0 |
| socket.io | ^4.7.5 |
| class-validator | ^0.14.1 |
| Node (Docker) | 20 |

**Database**: TypeORM + PostgreSQL. 5 TypeORM migration files. `synchronize: false`.

**Testing**: Jest configured but no test files in source.

#### Feature Architecture & N-Layer Architecture

Simpler patterns (no CQRS, no domain/ORM separation). Node 18, NestJS ^10.0.0. Simple login/register (no refresh tokens, no password reset). TypeORM ^0.3.17 with likely `synchronize: true`. Each has 1 test file.

#### Cross-Stack Comparison

| Concern | .NET Clean | Spring Clean | NestJS Clean |
|---------|-----------|-------------|-------------|
| Language | C# (.NET 8) | Java 21 | TypeScript (Node 20) |
| CQRS | MediatR | Use Cases (quasi-CQRS) | @nestjs/cqrs |
| ORM | EF Core 8.0 | JPA/Hibernate | TypeORM 0.3 |
| Migrations | EF Core Migrations | Flyway (SQL) | TypeORM Migrations (TS) |
| JWT | System.IdentityModel.Tokens.Jwt | JJWT 0.12.5 | @nestjs/jwt |
| Structured Logging | Serilog (JSON) | Logback + Logstash (JSON) | Pino (JSON) |
| Rate Limiting | AspNetCoreRateLimit | Bucket4j | Env-based config |
| API Docs | Swashbuckle | SpringDoc | @nestjs/swagger |
| Export | ClosedXML + CsvHelper + QuestPDF | POI + OpenCSV + iText | exceljs + json2csv + pdfkit |
| Real-time | SignalR | Spring WebSocket | socket.io |

---

## Section 4: Frontend Template Analysis

### 4.1 Vue / Vuetify / Full

**Path**: `frontend/vue/vuetify/full/`

**Stack**: Vue ^3.5.21, Vuetify ^3.10.1, Vite ^7.1.5, Pinia ^3.0.3

**Language**: JavaScript (`.js`/`.vue`, no TypeScript). Uses `jsconfig.json` with JSDoc annotations.

**Routing**: File-based via `unplugin-vue-router`. Pages in `src/pages/` auto-generate routes.

**Pages (11)**: index (redirect), login, forgot-password, reset-password, dashboard, profile, users, departments, files, audit-logs, notifications

**Stores (8)**: auth, user, department, notification, persistentNotification, theme, locale, app

**API Services (7)**: authApi, userApi, departmentApi, notificationApi, fileService, auditLogService, exportService. Axios with JWT interceptor and token refresh queue.

**Components (11)**: AppFooter, AppHeader, AppNotification (toast), AppSidebar, ConfirmDialog, DateRangePicker, ExportButton, NotificationMenu, PasswordStrength, SearchFilterBar, Breadcrumbs

**i18n**: vue-i18n ^9.14.5 with English and Arabic (RTL) locales.

**Real-time**: Supports all 3 backends via `@microsoft/signalr` (dotnet), `socket.io-client` (nestjs), `@stomp/stompjs` (spring). Backend selected via `VITE_BACKEND_TYPE` env var.

**Linting**: eslint-config-vuetify (flat config), Prettier (semi=false, singleQuote=true), Husky + lint-staged.

### 4.2 Vue / PrimeVue / Full

**Path**: `frontend/vue/primevue/full/`

Same structure as Vuetify but with PrimeVue ^4.2.0, PrimeFlex ^4.0.0, PrimeIcons ^7.0.0. Custom sidebar (no Vuetify navigation drawer). Theme via CSS class `app-dark`. No ESLint config at root. No `.prettierrc`.

### 4.3 React / MUI / Full

**Path**: `frontend/react/mui/full/`

**Stack**: React ^19.1.0, MUI ^7.0.2, Vite ^6.3.5, Zustand ^5.0.5

**Language**: TypeScript (strict mode, `.ts`/`.tsx`).

**Routing**: React Router v7 with `createBrowserRouter`. Routes defined in `src/router/index.tsx`. Guards: `AuthGuard`, `AdminGuard`.

**Pages (10)**: Login, ForgotPassword, ResetPassword, Dashboard, Profile, Users, Departments, FilesPage, AuditLogsPage, Notifications

**Stores (7)**: authStore (persisted), userStore, departmentStore, notificationStore, persistentNotificationStore, themeStore (persisted), localeStore

**Types (5)**: auth.ts, user.ts, department.ts, notification.ts, pagination.ts — all with proper interfaces.

**Styling**: CSS-in-JS via Emotion. MUI `sx` prop and `styled()` API. Custom themes in `theme.ts`.

**Linting**: ESLint flat config with typescript-eslint + react-hooks. Prettier. No Husky.

### 4.4 React / PrimeReact / Full

**Path**: `frontend/react/primereact/full/`

Same structure as MUI but with PrimeReact ^10.9.5, PrimeFlex ^3.3.1, SCSS for custom styles. Theme switching via CSS file swapping (`/themes/lara-dark-blue/theme.css`).

### Cross-Frontend Comparison

| Aspect | Vue/Vuetify | Vue/PrimeVue | React/MUI | React/PrimeReact |
|--------|-------------|--------------|-----------|-----------------|
| Language | JavaScript | JavaScript | TypeScript (strict) | TypeScript (strict) |
| Framework | Vue ^3.5.21 | Vue ^3.5.21 | React ^19.1.0 | React ^19.1.0 |
| UI Library | Vuetify ^3.10.1 | PrimeVue ^4.2.0 | MUI ^7.0.2 | PrimeReact ^10.9.5 |
| State | Pinia ^3.0.3 | Pinia ^3.0.3 | Zustand ^5.0.5 | Zustand ^5.0.5 |
| Router | vue-router (file-based) | vue-router (file-based) | react-router-dom ^7.6.1 | react-router-dom ^7.6.1 |
| HTTP | Axios ^1.13.2 | Axios ^1.13.2 | Axios ^1.9.0 | Axios ^1.9.0 |
| i18n | vue-i18n ^9.14.5 | vue-i18n ^9.14.5 | i18next ^25.7.4 | i18next ^25.7.4 |
| Build | Vite ^7.1.5 | Vite ^7.1.5 | Vite ^6.3.5 | Vite ^6.3.5 |
| Test | Vitest ^3.2.3 | Vitest ^3.2.3 | Vitest ^3.1.4 | Vitest ^3.1.4 |
| CSS Utility | None | PrimeFlex ^4.0.0 | None (CSS-in-JS) | PrimeFlex ^3.3.1 |
| Icons | @mdi/font | PrimeIcons | @mui/icons-material | PrimeIcons |
| SCSS | sass-embedded ^1.92.1 | sass-embedded ^1.92.1 | None | sass ^1.89.1 |
| Husky | Yes | Yes | No | No |

### Full vs Minimal Feature Matrix

| Feature | Full | Minimal |
|---------|------|---------|
| Dashboard page | Yes | No |
| User management (CRUD) | Yes | No |
| Department management (CRUD) | Yes | No |
| Export (XLSX/CSV) | Yes | No |
| Notifications | Yes | Yes |
| File management | Yes | Yes |
| Audit logs | Yes | Yes |
| Auth (login/forgot/reset) | Yes | Varies* |
| Profile page | Yes | Varies* |
| Default redirect | /dashboard | /notifications |

*PrimeVue minimal is more stripped — missing forgot-password, reset-password, and profile pages.

---

## Section 5: Shared Infrastructure

### Docker Compose Files

**`docker-compose.yml`** (root development):
- PostgreSQL 15 Alpine on port 5432
- Unified app (backend + frontend + nginx) on ports 80 and 5100
- Health checks on both services

**`docker-compose.backend.yml`**: Backend-only with PostgreSQL
**`docker-compose.frontend.yml`**: Frontend-only with nginx

**`docker-compose.production.yml`**:
```yaml
services:
  db:
    image: postgres:15-alpine
    restart: always
    # Env vars from .env
  app:
    image: ${APP_IMAGE:-ghcr.io/your-org/apptemplate:latest}
    ports:
      - "${APP_PORT:-80}:80"
      - "${APP_PORT_SSL:-443}:443"
```

**`docker-compose.staging.yml`**: Similar to production with staging-specific config.

### Docker Template Files

`docker/templates/root/` contains backend-specific templates that the CLI copies during scaffolding:

| File | Purpose |
|------|---------|
| `Dockerfile.dotnet` | Multi-stage: .NET SDK → ASP.NET runtime + nginx + supervisor |
| `Dockerfile.spring` | Multi-stage: temurin:21-jdk → 21-jre + nginx + supervisor |
| `Dockerfile.nestjs` | Multi-stage: node:20 → node:20-slim + nginx + supervisor |
| `docker-compose.{backend}.yml` | Backend-specific compose with correct env vars |
| `supervisord.{backend}.conf` | Process manager config (backend + nginx) |
| `README.fullstack.{backend}.md` | Getting started README per backend |
| `README.multirepo.md` | README for non-fullstack projects |

### Nginx Configuration

**`nginx/nginx.conf`**:
```nginx
worker_processes auto;
http {
    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    client_max_body_size 20M;
    gzip on;
    gzip_comp_level 6;
    # Types: text, CSS, JS, JSON, XML
}
```

**`nginx/conf.d/default.conf`**:
```nginx
upstream backend {
    server 127.0.0.1:8080;
}
server {
    listen 80;
    root /usr/share/nginx/html;
    location /api/ {
        proxy_pass http://backend/api/;
        # WebSocket support headers
    }
    location /hubs/ {
        proxy_pass http://backend/hubs/;
        # WebSocket upgrade support
    }
    location /health {
        proxy_pass http://backend/health;
    }
    location / {
        try_files $uri $uri/ /index.html;  # SPA fallback
    }
}
```

### CI/CD Pipelines

**`.github/workflows/ci.yml`** — Triggered on push/PR to main/develop:

| Job | Steps |
|-----|-------|
| `backend-dotnet` | Setup .NET 8, restore, build, test |
| `backend-spring` | Setup Java 21, Maven compile, test |
| `backend-nestjs` | Setup Node 20, npm ci, lint, build |
| `frontend` (matrix) | 4 variants in parallel: npm ci, lint, typecheck, build |
| `cli` | npm ci, typecheck, build |

**Note**: CI references `backend-dotnet`, `backend-spring`, etc. as working directories — these are the post-scaffold flat names, not the monorepo paths.

**`.github/workflows/deploy-production.yml`** — Push to main/master:
1. Build unified Docker image → push to GitHub Container Registry
2. Optional OpenVPN connection to private server
3. SSH to server, copy compose + .env, pull image, `docker compose up -d`
4. Health check verification

**`.github/workflows/deploy-staging.yml`** — Push to develop. Same flow as production with staging-specific tags and env.

### Environment Variables

**`.env.example`** (development):
```
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=apptemplate_dev
JWT_SECRET=your-dev-secret-key-min-32-chars
JWT_ISSUER=AppTemplate
JWT_AUDIENCE=AppTemplate
SSO_API_BASE_URL=
ASPNETCORE_ENVIRONMENT=Development
VITE_API_URL=/api
```

**`.env.production.example`**: Same keys with production-appropriate comments. Includes `DOCKER_IMAGE`, logging configuration, and SSO instructions for Docker networking.

### Root package.json

```json
{
  "name": "apptemplate-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": { "prepare": "husky" },
  "devDependencies": {
    "@commitlint/cli": "^19.6.1",
    "@commitlint/config-conventional": "^19.6.0",
    "husky": "^9.1.7",
    "lint-staged": "^15.4.3"
  },
  "engines": { "node": ">=20.0.0" }
}
```

**lint-staged** targets: `frontend-vuetify/**/*.{js,vue}`, `frontend-primevue/**/*.{js,vue}`, `frontend-mui/**/*.{ts,tsx}`, `frontend-primereact/**/*.{ts,tsx}`, `create-apptemplate/**/*.ts`

**Note**: lint-staged paths reference `frontend-vuetify` etc. (post-scaffold names), not the monorepo paths `frontend/vue/vuetify/`.

### Commitlint Configuration

**`commitlint.config.js`**:
- Extends `@commitlint/config-conventional`
- Required types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Suggested scopes (warning level): backend-dotnet, backend-spring, backend-nestjs, frontend-vuetify, frontend-primevue, frontend-mui, frontend-primereact, cli, deps, config, docker, ci
- Subject: required, no period, lowercase

### Husky Hooks

**`.husky/commit-msg`**: `npx --no -- commitlint --edit $1`
**`.husky/pre-commit`**: `npx lint-staged`

---

## Section 6: CLAUDE.md Analysis

### Root CLAUDE.md

Located at `./CLAUDE.md`. Comprehensive document covering:

1. **Project Overview**: Describes the monorepo as a scaffolding template source
2. **Common Commands**: Build/test/run for all backends and frontends
3. **Monorepo Structure**: Directory tree with variant descriptions
4. **Backend Architecture** (Clean Architecture): Layer dependencies, CQRS pattern
5. **Frontend Architecture**: Vue (file-based routing, Pinia, auto-imports) and React (React Router, Zustand)
6. **Key Patterns**: No repository pattern (clean-arch), Composition API, `<script setup>`
7. **Adding New Features**: Step-by-step for both backend and frontend
8. **Cross-Frontend Consistency**: API service signatures, store shapes, UX patterns
9. **Renaming**: Automated scripts for `App.Template` → custom name
10. **Seed Data**: Default admin credentials
11. **Troubleshooting**: Common issues and solutions

### AGENTS.md

Located at `./AGENTS.md`. Covers:
- Module organization explanation
- Build/test/dev commands per stack
- Coding style (2-space JS/TS, 4-space C#)
- Testing guidelines (Vitest, Jest, xUnit, JUnit)
- Commit & PR guidelines (conventional commits, branch naming)

### Gaps in CLAUDE.md

1. **No Spring Boot specific commands**: Only .NET commands are detailed for migrations, running
2. **No NestJS specific commands**: Missing `npm run start:dev`, migration commands
3. **No CLI tool development guide**: Missing `cd create-apptemplate && npm run dev`
4. **Architecture differences undocumented**: Only clean-arch is described; feature-arch and n-layer patterns are not explained
5. **No deployment documentation reference**: CI/CD workflows are not mentioned
6. **No Docker template structure**: The `docker/templates/root/` system is not explained
7. **Missing cross-backend consistency note**: What endpoints/features should all backends share
8. **No versioning strategy**: How to keep package versions aligned across variants

---

## Section 7: Current Gaps & Issues

### 7.1 Version Inconsistencies

**Critical — versions should be aligned across variants sharing the same stack:**

| Package | Clean-arch | Feature-arch (full) | N-Layer (full) | Issue |
|---------|-----------|-------------------|---------------|-------|
| Serilog.AspNetCore | 10.0.0 | 8.0.4 | 8.0.4 | Major version gap |
| Serilog.Sinks.File | 7.0.0 | 6.0.0 | 6.0.0 | Major version gap |
| Swashbuckle.AspNetCore | 8.1.4 | 8.1.4 (full) / 6.5.0 (minimal) | 8.1.4 (full) / 6.5.0 (minimal) | Minimal variants outdated |
| EF Core | 8.0.22 | 8.0.22 (full) / 8.0.11 (minimal) | 8.0.22 (full) / 8.0.11 (minimal) | Minimal variants outdated |
| FluentValidation.AspNetCore | 11.3.1 | 11.3.0 | 11.3.0 | Minor mismatch |
| xUnit | 2.9.3 | 2.4.2 | 2.4.2 | Significant gap |
| Moq | 4.20.72 | 4.18.4 | 4.18.4 | Significant gap |

**Spring Boot versions:**

| | Clean-arch | Feature/N-Layer |
|---|-----------|----------------|
| Spring Boot | 3.3.5 | 3.2.0 |
| Java | 21 | 17 |
| JJWT | 0.12.5 | 0.11.5 (uses deprecated API) |

**NestJS versions:**

| | Clean-arch | Feature/N-Layer |
|---|-----------|----------------|
| NestJS | ^10.4.0 | ^10.0.0 |
| TypeORM | ^0.3.20 | ^0.3.17 |
| Node (Docker) | 20 | 18 |

**Frontend versions:**

| Package | Vue variants | React variants |
|---------|-------------|---------------|
| Vite | ^7.1.5 | ^6.3.5 |
| Vitest | ^3.2.3 | ^3.1.4 |
| Axios | ^1.13.2 | ^1.9.0 |
| PrimeFlex | ^4.0.0 (PrimeVue) | ^3.3.1 (PrimeReact) |

### 7.2 JWT Configuration Inconsistencies

| Aspect | Clean-arch (all stacks) | Feature/N-Layer full (.NET) |
|--------|------------------------|---------------------------|
| Issuer/Audience validation | OFF (SSO compat) | ON |
| Key encoding | Base64 auto-detect | UTF-8 only |
| CorrelationId middleware | Yes | No |
| RequestLogging middleware | Yes | No |
| EnvironmentValidator | Yes | No |

The full variants of feature-arch and n-layer .NET are **less polished** than their minimal counterparts, which have the enhanced middleware.

### 7.3 Missing Features by Variant

**Minimal variants that are inconsistently stripped:**
- PrimeVue minimal removes `forgot-password`, `reset-password`, and `profile` pages — but all other minimals keep them

**Dead code in React minimal variants:**
- `types/department.ts` and `types/user.ts` are shipped but never used

### 7.4 Test Coverage Gaps

| Variant | Test files | Quality |
|---------|-----------|---------|
| .NET clean-arch/full | 5 | Best: domain, validation, handler tests |
| .NET clean-arch/minimal | 2 | Good: validator + domain exception tests |
| .NET feature-arch/full | 1 | Basic: controller-level only |
| .NET feature-arch/minimal | **0** | No tests |
| .NET nlayer-arch/full | 1 | Basic: controller-level only |
| .NET nlayer-arch/minimal | **0** | No tests |
| Spring clean-arch/full | 2 | Good: unit + integration |
| Spring feature/nlayer | 1 each | Basic: controller test |
| NestJS clean-arch | **0** (config only) | Jest configured, no test files |
| NestJS feature/nlayer | 1 each | Trivial: `should be defined` |
| All frontends | 1 (notification test only) | Minimal |

### 7.5 Docker Inconsistencies

- Clean-arch .NET Dockerfiles include `curl` + `HEALTHCHECK`; feature-arch and nlayer-arch do not
- Spring clean-arch uses non-root user; feature/nlayer do not
- NestJS clean-arch uses non-root user (nestjs:1001); feature/nlayer do not

### 7.6 Code Quality Issues

1. **CLI version hardcoded**: `index.ts` displays `v1.0.0` while `package.json` says `v1.1.1`
2. **No cross-validation of framework+UI in CLI**: `--framework vue --ui mui` is accepted by parser but fails at download
3. **Full repo download for root files**: `copyRootFiles()` downloads entire repository to temp dir just to copy ~10 files
4. **No cleanup on failure**: If download fails, partially created project directory is left behind
5. **Dead code**: `commandExists()` in `package-manager.ts` is exported but never called
6. **lint-staged paths mismatch**: Root `package.json` references `frontend-vuetify` (post-scaffold) not `frontend/vue/vuetify` (monorepo)
7. **`.env` files ship with `VITE_BACKEND_TYPE=spring`**: While `.env.example` says `dotnet`, committed `.env` says `spring`

### 7.7 Documentation Gaps

1. No Spring Boot or NestJS command reference in CLAUDE.md
2. No CLI tool development guide
3. Feature-arch and n-layer architecture patterns not documented
4. Docker template system (`docker/templates/root/`) not explained
5. No deployment guide referenced from main docs (though CI/CD workflows exist)
6. No contribution guide for adding new backends or UI frameworks
7. No changelog or version history

---

## Section 8: Generator Pattern Deep Dive

### Step-by-Step: What Happens When a User Runs the CLI

```
npm create @abuhannaa/apptemplate@latest
```

**Step 1: Banner & Parsing**
```typescript
// index.ts
p.intro(pc.bgCyan(pc.black(' Create AppTemplate ')));
const cliArgs = parseArgs();
```

**Step 2: Mode Determination**
```typescript
const needsNamespace = projectType !== 'frontend' && (backend === 'dotnet' || backend === 'spring');
if (cliArgs.projectPath && cliArgs.backend && (!needsNamespace || cliArgs.projectName)) {
  // Non-interactive: build config from CLI args
} else {
  // Interactive: run prompts
}
```

**Step 3: Project Directory Creation**
```typescript
fs.mkdirSync(absolutePath, { recursive: true });
```

**Step 4: Template Download** (3 separate degit calls for fullstack)
```typescript
// download.ts — Backend template
const emitter = degit(`${REPO}/${backendFolder}`, { cache: false, force: true });
await emitter.clone(path.join(destDir, 'backend'));

// Frontend template
const emitter2 = degit(`${REPO}/${frontendFolder}`, { cache: false, force: true });
await emitter2.clone(path.join(destDir, 'frontend'));

// Root files — downloads ENTIRE REPO to temp dir, then copies selectively
const emitter3 = degit(REPO, { cache: false, force: true });
await emitter3.clone(tempDir);
// Then: fs.copyFileSync(tempDir + '/.env.example', destDir + '/.env.example')
// And: fs.cpSync(tempDir + '/docker/nginx/', destDir + '/docker/nginx/', { recursive: true })
```

**Step 5: Folder Reference Updates**
```typescript
// generator.ts — updateFolderReferences()
// Replaces directory references in Docker/compose files:
content = content.replace(/backend-dotnet/g, 'backend');
content = content.replace(/frontend-vuetify/g, 'frontend');
// etc. for all framework+UI combinations
```

**Step 6: Namespace Renaming** (if project name provided)
```typescript
// rename.ts — for .NET:
content
  .replace(/App\.Template/g, 'MyCompany.MyApp')    // Namespace in code
  .replace(/AppTemplate/g, 'MyCompanyMyApp');       // Concatenated name

// Also renames folders:
// src/Core/App.Template.Domain → src/Core/MyCompany.MyApp.Domain
// And renames .csproj/.sln files
```

```typescript
// rename.ts — for Spring:
// Converts "MyCompany.MyApp" to:
//   packageName = "mycompany.myapp"
//   artifactId = "mycompany-myapp"
//   pkgPath = "mycompany/myapp" (directory structure)
// Then renames Java package directories and file contents
```

**Step 7: Dependency Installation** (optional)
```typescript
// package-manager.ts
// Detects: bun.lockb > pnpm-lock.yaml > yarn.lock > package-lock.json > npm
// Runs appropriate install command for each component
```

**Step 8: Environment Setup**
```typescript
// Copies .env.example → .env
// For fullstack: sets VITE_BACKEND_TYPE in frontend .env
// For .NET: copies appsettings.example.json → appsettings.Development.json
```

**Step 9: Docker Cleanup** (fullstack only)
```typescript
// Removes individual Dockerfile and docker-compose.yml from backend/ and frontend/
// since fullstack uses root-level unified versions
```

**Step 10: Success Output**
```typescript
p.outro('Done! Your project is ready.');
// Displays context-sensitive next steps:
// cd my-project, install commands, docker commands, run commands, URLs, credentials
```

### File Selection Mapping

| User Selection | Repository Source Path | Destination |
|---------------|----------------------|-------------|
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

### Modularity Assessment

**Adding a new backend** (e.g., Go) requires changes in:

| File | Change |
|------|--------|
| `types.ts` | Add `'go'` to `BackendFramework` union |
| `cli.ts` | Add `'go'` to `validBackends` array |
| `prompts.ts` | Add select option + `getBackendLabel()` |
| `rename.ts` | Add `renameGoProject()` function (if namespace renaming needed) |
| `package-manager.ts` | Add `case 'go':` to `installDependencies()` |
| `index.ts` | Update `showNextSteps()` with Go commands |
| Repository | Create `backend/go/{clean,feature,nlayer}-architecture/{full,minimal}/` |
| Docker templates | Create `Dockerfile.go`, `docker-compose.go.yml`, `supervisord.go.conf`, `README.fullstack.go.md` |

**Adding a new frontend framework** requires similar changes across `types.ts`, `cli.ts`, `prompts.ts`, plus template directories and `updateFolderReferences()` hardcoded replacements.

**Assessment**: The download mechanism (degit with path construction) is extensible. Main friction points:
1. `rename.ts` has framework-specific logic requiring manual extension
2. `updateFolderReferences()` has hardcoded replacement strings
3. `showNextSteps()` has framework-specific display logic
4. Docker templates must be manually created per backend

### Hardcoded Paths & Assumptions

1. **Repository**: `const REPO = 'abuhanna/app-template'` — cannot be overridden
2. **Base namespace**: `App.Template` / `AppTemplate` / `apptemplate` must be the source pattern in all templates
3. **Folder patterns**: `backend-dotnet`, `frontend-vuetify` etc. in Docker files
4. **WebAPI detection**: `entry.name.endsWith('.WebAPI')` for appsettings
5. **Clean-arch structure**: `src/Core/App.Template.Domain`, `src/Infrastructure/...`, etc.
6. **Spring clean-arch packages**: `apptemplate.*` (no `com.` prefix) vs feature/nlayer: `com.apptemplate.*`
7. **Skip directories**: `['node_modules', '.git', 'bin', 'obj', 'dist', 'build', 'target']` in file traversal
8. **Three HTTP requests per fullstack project**: Backend template + frontend template + full repo (for root files)

---

## Appendix: Summary Statistics

| Metric | Count |
|--------|-------|
| Total files | 2,113 |
| package.json files | 16 |
| .csproj files | 20 |
| pom.xml files | 14 |
| nest-cli.json files | 2 |
| docker-compose files | 32 |
| Dockerfiles | 32 |
| Backend template variants | 18 |
| Frontend template variants | 8 |
| Total scaffoldable configurations | 98 |
| CI/CD workflows | 3 |
| Supported languages (backend) | C#, Java, TypeScript |
| Supported languages (frontend) | JavaScript (Vue), TypeScript (React) |

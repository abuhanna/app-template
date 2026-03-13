# AppTemplate — Scaffolding Generator Monorepo

## What This Is
Monorepo containing the `@abuhannaa/create-apptemplate` CLI tool and all reference
template implementations. The CLI downloads template subdirectories from this repo
via degit, mutates namespace/paths, and produces ready-to-run projects.

## Architecture Overview
- CLI tool: `create-apptemplate/` (TypeScript, published to npm)
- Generation strategy: degit download + regex namespace rename (NOT template engine)
- Templates are REAL working projects — they must build and run as-is in the monorepo
- 98 total scaffoldable configurations (18 backend + 8 frontend + 72 fullstack)

## Combinatorial Matrix
| Dimension | Options |
|-----------|---------|
| Project type | fullstack, backend-only, frontend-only |
| Backend | dotnet (.NET 8), spring (Spring Boot 3), nestjs (NestJS 10) |
| Architecture | clean, feature-based, nlayer |
| Frontend | vue (Vue 3), react (React 19) |
| UI library | vuetify, primevue (Vue) / mui, primereact (React) |
| Variant | full, minimal, zero |

## Monorepo Structure

    backend/
      {dotnet,spring,nestjs}/
        {clean,feature,nlayer}-architecture/
          {full,minimal}/
    frontend/
      {vue,react}/
        {vuetify,primevue,mui,primereact}/
          {full,minimal}/
    create-apptemplate/        ← CLI source code
    shared/                    ← CLI-downloadable root files (degit + raw API)
      common/                  ← .gitignore, .env.example, CLAUDE.md, etc.
      docker/                  ← Nginx & supervisor configs for scaffolded projects
      templates/{backend}/     ← Per-backend Dockerfile, docker-compose, README, supervisord
    docker/                    ← Local dev Docker configs (monorepo only)
      nginx/                   ← Nginx config for reverse proxy
      supervisor/              ← Supervisor process manager config

## CLI Development Commands

    cd create-apptemplate
    npm run dev         # Watch mode (tsup --watch)
    npm run build       # Production build (tsup)
    npm run typecheck   # TypeScript check (tsc --noEmit)
    npm test            # Run unit tests (vitest)
    npm run cli         # Run CLI locally (tsx src/index.ts)
    npm link            # Link for local npm create testing
    npm publish --access public  # Publish to npm

## Backend Commands

### .NET 8

    cd backend/dotnet/{arch}-architecture/{variant}
    dotnet restore
    dotnet build
    dotnet run --project src/Presentation/App.Template.WebAPI  # clean-arch
    dotnet run --project src/App.Template.Api                   # feature/nlayer
    dotnet test

    # Migrations
    # clean-arch:
    dotnet ef migrations add <Name> \
      --project src/Infrastructure/App.Template.Infrastructure \
      --startup-project src/Presentation/App.Template.WebAPI
    # feature/nlayer:
    dotnet ef migrations add <Name> \
      --project src/App.Template.Api \
      --startup-project src/App.Template.Api

### Spring Boot 3

    cd backend/spring/{arch}-architecture/{variant}
    ./mvnw clean compile                    # Build
    ./mvnw spring-boot:run                  # Run (clean-arch: cd api/ first)
    ./mvnw test                             # Test

    # clean-arch is multi-module Maven — run from api/ submodule:
    cd api && ../mvnw spring-boot:run

    # Flyway migrations (clean-arch only):
    # SQL files in api/src/main/resources/db/migration/

### NestJS

    cd backend/nestjs/{arch}-architecture/{variant}
    npm install
    npm run build
    npm run start:dev                       # Dev with hot-reload
    npm run start:debug                     # Debug mode
    npm run test                            # Unit tests
    npm run test:e2e                        # End-to-end tests

    # TypeORM migrations (clean-arch):
    npx typeorm migration:generate -d src/data-source.ts src/migrations/<Name>
    npx typeorm migration:run -d src/data-source.ts

## Frontend Commands

### Vue (Vuetify / PrimeVue)

    cd frontend/vue/{vuetify,primevue}/{full,minimal}
    npm install
    npm run dev          # Vite dev server (port 3000)
    npm run build        # Production build
    npm run lint         # ESLint + Prettier

### React (MUI / PrimeReact)

    cd frontend/react/{mui,primereact}/{full,minimal}
    npm install
    npm run dev          # Vite dev server (port 3000)
    npm run build        # Production build (tsc -b && vite build)
    npm run lint         # ESLint + Prettier

## Key Architecture Rules

### CLI (create-apptemplate/)
- Prompt library: @clack/prompts (NOT inquirer)
- Download: degit from this GitHub repo + GitHub raw API for root files
- Rename: regex-based string replacement in rename.ts
- No template engine — files are real project files, copied as-is
- CLI args parsed manually in cli.ts (no yargs/commander)
- Package manager detection: bun > pnpm > yarn > npm
- Build: tsup (ESBuild-based), ESM-only, target Node 18
- See [docs/cli-development.md](docs/cli-development.md) for full guide

### Backend Templates
- All must use namespace `App.Template` / `AppTemplate` as base (CLI replaces it)
- Clean arch: 4 projects (.NET), multi-module (Spring), modules/ (NestJS)
- Feature arch: single project, organized by feature folder
- N-Layer arch: single project, horizontal layers (controllers/services/repos)
- All MUST include: JWT auth, Swagger/OpenAPI, health checks, PostgreSQL, structured logging
- See [docs/architecture-patterns.md](docs/architecture-patterns.md) for details

### Backend Cross-Stack Comparison
| Concern | .NET 8 | Spring Boot 3 | NestJS 10 |
|---------|--------|---------------|-----------|
| Language | C# | Java 21 | TypeScript |
| ORM | EF Core 8 | JPA/Hibernate | TypeORM 0.3 |
| CQRS | MediatR (clean) | Use Cases (clean) | @nestjs/cqrs (clean) |
| Migrations | EF Core Migrations | Flyway SQL (clean) | TypeORM Migrations |
| JWT | System.IdentityModel.Tokens.Jwt | JJWT | @nestjs/jwt + Passport |
| Logging | Serilog (JSON) | Logback + Logstash (JSON) | Pino (JSON) |
| Rate Limiting | AspNetCoreRateLimit | Bucket4j | Env-based config |
| API Docs | Swashbuckle | SpringDoc OpenAPI | @nestjs/swagger |
| Export | ClosedXML + CsvHelper + QuestPDF | POI + Commons CSV + iText | exceljs + json2csv + pdfkit |
| Real-time | SignalR | Spring WebSocket (STOMP) | socket.io |
| Password Hash | BCrypt.Net-Next | BCrypt (Spring Security) | bcrypt |

### Frontend Templates
- Vue: JavaScript (jsconfig.json), file-based routing (unplugin-vue-router)
- React: TypeScript (strict), React Router v7, createBrowserRouter
- State: Pinia (Vue) / Zustand (React)
- HTTP: Axios with JWT interceptor + automatic token refresh queue
- i18n: vue-i18n (Vue) / i18next + react-i18next (React), English + Arabic (RTL)
- Real-time adapts to backend via `VITE_BACKEND_TYPE` env var
  - `dotnet` → @microsoft/signalr
  - `spring` → @stomp/stompjs
  - `nestjs` → socket.io-client

### Frontend Cross-Stack Comparison
| Aspect | Vue/Vuetify | Vue/PrimeVue | React/MUI | React/PrimeReact |
|--------|-------------|--------------|-----------|-----------------|
| Language | JavaScript | JavaScript | TypeScript | TypeScript |
| UI Library | Vuetify 3 | PrimeVue 4 | MUI 7 | PrimeReact 10 |
| State | Pinia | Pinia | Zustand | Zustand |
| CSS Utility | — | PrimeFlex 4 | CSS-in-JS (Emotion) | PrimeFlex 3 |
| Icons | @mdi/font | PrimeIcons | @mui/icons-material | PrimeIcons |

### Template Variants
| Feature | Full | Minimal | Zero |
|---------|------|---------|------|
| Dashboard page | Yes | No | No |
| User management CRUD | Yes | No | No |
| Department management CRUD | Yes | No | No |
| Export (XLSX/CSV/PDF) | Yes | No | No |
| File management | Yes | Yes | Yes |
| Audit logs | Yes | Yes | Yes |
| Notifications + real-time | Yes | Yes | Yes |
| Auth | Internal (login/register/forgot/reset) | External (SSO/shared secret JWT) | None |
| Rate limiting | Yes | Yes | No |
| Profile page | Yes | Varies | No |
| Default redirect | /dashboard | /notifications | /notifications |

### Docker & Infrastructure
- Fullstack: root Dockerfile (multi-stage) + supervisor (backend + nginx)
- Templates in `shared/templates/{backend}/` (Dockerfile, docker-compose.yml, README, supervisord.conf)
- Nginx: reverse proxy /api → backend:8080, static frontend, WebSocket upgrade
- See [docs/docker-templates.md](docs/docker-templates.md) for full guide

## Known Issues (prioritize fixing)
1. ~~CLI version display hardcoded as v1.0.0~~ — FIXED: reads from package.json dynamically
2. ~~No cross-validation of --framework + --ui~~ — FIXED: validated in cli.ts parseArgs() + index.ts non-interactive mode
3. ~~Full repo download for ~10 root files~~ — FIXED: uses GitHub raw API + targeted degit for shared/
4. ~~No cleanup on partial failure~~ — FIXED: generator.ts cleans up directory on failure (if we created it)
5. ~~Version inconsistencies across variants~~ — FIXED: aligned all variants (see [docs/version-alignment.md](docs/version-alignment.md))
6. lint-staged paths reference post-scaffold names, not monorepo paths
7. PrimeVue minimal inconsistently strips pages vs other minimals

## Adding New Backends/Frontends
To add a new backend (e.g., Go), modify these files:
1. `create-apptemplate/src/types.ts` — add to BackendFramework union
2. `create-apptemplate/src/cli.ts` — add to validBackends
3. `create-apptemplate/src/prompts.ts` — add select option + label
4. `create-apptemplate/src/utils/rename.ts` — add rename function
5. `create-apptemplate/src/utils/package-manager.ts` — add install case
6. `create-apptemplate/src/index.ts` — update showNextSteps()
7. `create-apptemplate/src/generator.ts` — update updateFolderReferences()
8. Create `backend/go/{clean,feature,nlayer}-architecture/{full,minimal}/`
9. Create `shared/templates/go/Dockerfile`, `docker-compose.yml`, `README.fullstack.md`, etc.

See [docs/cli-development.md](docs/cli-development.md) for the complete guide.

## Version Alignment
All variants within each stack must use identical dependency versions.
Baseline is always `clean-architecture/full` for each stack.
See [docs/version-alignment.md](docs/version-alignment.md) for the full version table.

## Seed Data (all variants)
- Admin: admin@apptemplate.com / Admin@123
- IT Department: code=IT, name=IT Department

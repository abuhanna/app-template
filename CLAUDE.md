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
| Variant | full, minimal |

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
    docker/
      templates/root/          ← Per-backend Docker/compose/README templates
      nginx/                   ← Nginx config for reverse proxy
      supervisor/              ← Supervisor process manager config

## CLI Development Commands

    cd create-apptemplate
    npm run dev         # Watch mode (tsup --watch)
    npm run build       # Production build (tsup)
    npm run typecheck   # TypeScript check (tsc --noEmit)
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
    dotnet ef migrations add <Name> --project src/Infrastructure/App.Template.Infrastructure --startup-project src/Presentation/App.Template.WebAPI  # clean-arch only

### Spring Boot 3

    cd backend/spring/{arch}-architecture/{variant}
    ./mvnw clean compile       # Build
    ./mvnw spring-boot:run     # Run (clean-arch: cd api/ first)
    ./mvnw test                # Test

### NestJS

    cd backend/nestjs/{arch}-architecture/{variant}
    npm install
    npm run build
    npm run start:dev
    npm run test

## Frontend Commands

### Vue (Vuetify / PrimeVue)

    cd frontend/vue/{vuetify,primevue}/{full,minimal}
    npm install
    npm run dev
    npm run build
    npm run lint

### React (MUI / PrimeReact)

    cd frontend/react/{mui,primereact}/{full,minimal}
    npm install
    npm run dev
    npm run build
    npm run lint

## Key Architecture Rules

### CLI (create-apptemplate/)
- Prompt library: @clack/prompts (NOT inquirer)
- Download: degit from this GitHub repo
- Rename: regex-based string replacement in rename.ts
- No template engine — files are real project files, copied as-is
- CLI args parsed manually in cli.ts (no yargs/commander)
- Package manager detection: bun > pnpm > yarn > npm

### Backend Templates
- All must use namespace App.Template / AppTemplate as base (CLI replaces it)
- Clean arch: 4 projects (.NET), multi-module (Spring), modules/ (NestJS)
- Feature arch: single project, organized by feature folder
- N-Layer arch: single project, horizontal layers (controllers/services/repos)
- All MUST include: JWT auth, Swagger, health checks, PostgreSQL, structured logging

### Frontend Templates
- Vue: JavaScript (jsconfig.json), file-based routing (unplugin-vue-router)
- React: TypeScript (strict), React Router v7
- Both: Axios with JWT interceptor + token refresh, i18n (en + ar), real-time support
- Real-time adapts to backend via VITE_BACKEND_TYPE env var

### Docker & Infrastructure
- Fullstack: root Dockerfile (multi-stage) + supervisor (backend + nginx)
- Templates in docker/templates/root/ keyed by backend (Dockerfile.{backend}, etc.)
- Nginx: reverse proxy /api → backend:8080, static frontend

## Known Issues (prioritize fixing)
1. ~~CLI version display hardcoded as v1.0.0~~ — FIXED: reads from package.json dynamically
2. ~~No cross-validation of --framework + --ui~~ — FIXED: validated in cli.ts parseArgs() + index.ts non-interactive mode
3. ~~Full repo download for ~10 root files~~ — FIXED: uses GitHub raw API + targeted degit for docker/
4. ~~No cleanup on partial failure~~ — FIXED: generator.ts cleans up directory on failure (if we created it)
5. ~~Version inconsistencies across variants~~ — FIXED: aligned all variants (see docs/version-alignment.md)
6. lint-staged paths reference post-scaffold names, not monorepo paths
7. PrimeVue minimal inconsistently strips pages vs other minimals

## Adding New Backends/Frontends
To add a new backend (e.g., Go), modify these files:
1. create-apptemplate/src/types.ts — add to BackendFramework union
2. create-apptemplate/src/cli.ts — add to validBackends
3. create-apptemplate/src/prompts.ts — add select option + label
4. create-apptemplate/src/utils/rename.ts — add rename function
5. create-apptemplate/src/utils/package-manager.ts — add install case
6. create-apptemplate/src/index.ts — update showNextSteps()
7. create-apptemplate/src/generator.ts — update updateFolderReferences()
8. Create backend/go/{clean,feature,nlayer}-architecture/{full,minimal}/
9. Create docker/templates/root/Dockerfile.go, docker-compose.go.yml, etc.

## Seed Data (all variants)
- Admin: admin@apptemplate.com / Admin@123
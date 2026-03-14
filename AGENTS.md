# Repository Guidelines

## Project Structure & Module Organization
This repository is the source for the `create-apptemplate` generator and all reference templates.

- `create-apptemplate/`: CLI generator source (`src/`) and build output (`dist/`).
- `backend/`: backend templates by stack and architecture:
  - `dotnet/`, `spring/`, `nestjs/`
  - each split into `clean-architecture`, `feature-architecture`, or `nlayer-architecture`, with `minimal/` and `full/` variants.
- `frontend/`: UI templates under `vue/` and `react/`, each with `minimal/` and `full/`.
- `docker/`, `nginx/`, `docker-compose*.yml`: local and deployment container setup.

Prefer changing template source files, not generated build folders such as `dist/`.

## Build, Test, and Development Commands
- Root setup: `npm install && npm run prepare` (installs Husky hooks).
- Run full stack locally: `docker compose up -d --build`.
- CLI development:
  - `cd create-apptemplate && npm run dev` (watch mode)
  - `cd create-apptemplate && npm run build`
  - `cd create-apptemplate && npm run typecheck`
- Frontend template example:
  - `cd frontend/vue/vuetify/minimal && npm install && npm run dev`
  - `npm run lint`, `npm run test`, `npm run test:coverage`
- Backend template examples:
  - `.NET`: `dotnet test backend/dotnet/clean-architecture/minimal/App.Template.sln`
  - `NestJS`: `cd backend/nestjs/nlayer-architecture/minimal && npm run test:cov`
  - `Spring`: `cd backend/spring/clean-architecture/minimal && ./mvnw test`

## Coding Style & Naming Conventions
- JS/TS/Vue/React: 2-space indentation, Prettier + ESLint (`singleQuote: true`, `semi: false`, print width 100 in frontend configs).
- C#: follow module `.editorconfig` (4-space indentation, PascalCase for types/methods, camelCase for locals/parameters).
- Naming: components in PascalCase (e.g., `UserCard.vue`), composables/hooks with `use*`, tests using framework defaults.

## Testing Guidelines
- Frontend: Vitest (`*.test.js|ts|tsx`).
- NestJS: Jest (`*.spec.ts`).
- .NET: xUnit (`*Tests.cs`).
- Spring: JUnit (`*Test.java`).
- Target at least 80% coverage for changed areas; include happy path and key edge cases.

## Commit & Pull Request Guidelines
- Conventional Commits are required (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, etc.), enforced by commitlint.
- Optional scopes should match module names (e.g., `frontend-vuetify`, `backend-nestjs`, `cli`, `docker`).
- Branch naming: `feature/...`, `fix/...`, `refactor/...`, `docs/...`.
- PRs should include: concise summary, linked issue, test evidence, and screenshots for UI changes.

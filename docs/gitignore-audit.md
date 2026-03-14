# .gitignore Audit Report

**Date**: 2026-03-14
**Scope**: Entire monorepo + all template variants

## Summary

| Category | Count |
|----------|-------|
| Total .gitignore files found | 26 |
| Missing .gitignore files | 6 |
| Files needing replacement | 20 |
| Committed secrets found | 0 (git-tracked) |
| Junk files on disk | 12+ (.env, .log files not tracked) |

## Audit Details

### Root Monorepo .gitignore (`./.gitignore`) — 546 lines

**Issues:**
- Massively bloated: full `dotnet new gitignore` dump with hundreds of irrelevant rules (Visual Studio 6, BizTalk, Silverlight, ClickOnce, etc.)
- **Dangerous `*.md` rule**: ignores ALL markdown files then whitelists specific ones — easy to accidentally lose docs
- **Ignores `docs/`** directory with only 3 exceptions — prevents tracking documentation
- **Ignores `.mvn/wrapper/maven-wrapper.jar`** — this file is REQUIRED for Spring Maven wrapper to work
- **Ignores `application.yml`** globally — too broad, prevents tracking non-secret Spring configs
- **Missing**: `!.env.example` negation, `*.pem`, `*.key`, `*.jks`, `*.keystore` (secret key patterns)
- **Missing**: Docker override, proper Node.js/NestJS rules, Spring Boot rules
- **Missing**: `uploads/`, `wwwroot/uploads/`, `storage/`

### .NET Templates (feature/nlayer × full/minimal) — 4 files, 161 lines each

**Files:**
- `backend/dotnet/feature-architecture/full/.gitignore`
- `backend/dotnet/feature-architecture/minimal/.gitignore`
- `backend/dotnet/nlayer-architecture/full/.gitignore`
- `backend/dotnet/nlayer-architecture/minimal/.gitignore`

**Issues:**
- Standard `dotnet new gitignore` dump — bloated with irrelevant rules
- **Missing**: `.env`, `.DS_Store`, `Thumbs.db`, `logs/`, `uploads/`, Docker
- **Missing**: `appsettings.Development.json`, `launchSettings.json`
- **Missing**: `*.pem`, `*.key` (secret key patterns)
- Ignores `.vscode` entirely (should allow some files like extensions.json)

### .NET Clean-Architecture — MISSING .gitignore

**Files missing:**
- `backend/dotnet/clean-architecture/full/.gitignore` ❌
- `backend/dotnet/clean-architecture/minimal/.gitignore` ❌

### NestJS Feature/N-Layer Templates — 4 files, 18 lines each

**Files:**
- `backend/nestjs/feature-architecture/full/.gitignore`
- `backend/nestjs/feature-architecture/minimal/.gitignore`
- `backend/nestjs/nlayer-architecture/full/.gitignore`
- `backend/nestjs/nlayer-architecture/minimal/.gitignore`

**Issues:**
- Too minimal (only 18 lines)
- Uses rooted paths (`/dist`, `/node_modules`) which won't work if .gitignore is nested
- **Missing**: `coverage/`, generic `*.log`, `uploads/`, Docker, `*.tsbuildinfo`
- **Missing**: `!.env.example` negation, `*.pem`, `*.key`
- **Missing**: `pnpm-debug.log*`, `.nyc_output/`

### NestJS Clean-Architecture — MISSING .gitignore

**Files missing:**
- `backend/nestjs/clean-architecture/full/.gitignore` ❌
- `backend/nestjs/clean-architecture/minimal/.gitignore` ❌

### Spring Clean-Architecture — 2 files, 50 lines each

**Files:**
- `backend/spring/clean-architecture/full/.gitignore`
- `backend/spring/clean-architecture/minimal/.gitignore`

**Issues:**
- Ignores `.mvn/wrapper/maven-wrapper.jar` — should be tracked
- Has `*.local` which is overly broad (catches unrelated files)
- **Missing**: `uploads/`, Docker, `!.env.example`, `*.pem`, `*.key`
- **Missing**: `application-local.yml`, `application-local.properties`

### Spring Feature/N-Layer — 4 files, 33 lines each

**Files:**
- `backend/spring/feature-architecture/full/.gitignore`
- `backend/spring/feature-architecture/minimal/.gitignore`
- `backend/spring/nlayer-architecture/full/.gitignore`
- `backend/spring/nlayer-architecture/minimal/.gitignore`

**Issues:**
- Spring Initializr default — missing critical rules
- **Missing**: `.env`, `.DS_Store`, `Thumbs.db`, `*.log`, `uploads/`, Docker
- **Missing**: `*.pem`, `*.key`, `application-local.yml`, `application-local.properties`
- Ignores `HELP.md` (fine) but has no environment protection

### Frontend Vue/Vuetify — 2 files, 64 lines each

**Files:**
- `frontend/vue/vuetify/full/.gitignore`
- `frontend/vue/vuetify/minimal/.gitignore`

**Issues:**
- Best of the frontend templates — has `.env.*` exclusion with `!.env.example`
- Has Thumbs.db, .DS_Store, coverage, caches
- Duplicate `.eslintcache` entry
- **Missing**: `*.pem`, `*.key`

### Frontend Vue/PrimeVue — MISSING .gitignore

**Files missing:**
- `frontend/vue/primevue/full/.gitignore` ❌
- `frontend/vue/primevue/minimal/.gitignore` ❌

### Frontend React (MUI + PrimeReact) — 4 files, 29 lines each

**Files:**
- `frontend/react/mui/full/.gitignore`
- `frontend/react/mui/minimal/.gitignore`
- `frontend/react/primereact/full/.gitignore`
- `frontend/react/primereact/minimal/.gitignore`

**Issues:**
- Vite default template — minimal
- Has `*.local` which catches `.env.*.local` but is overly broad
- **Missing**: `!.env.example` negation, `Thumbs.db`
- **Missing**: `*.pem`, `*.key`, `coverage/`

### shared/common/.gitignore — 542 lines

**Issues:**
- Same bloated `dotnet new gitignore` as root with monorepo-specific additions
- Same problems as root: `*.md` rule, `docs/` rule, missing secret patterns
- **This is what ALL generated fullstack projects inherit** — needs to be clean and universal

### create-apptemplate/.gitignore — 32 lines ✅

- Clean and appropriate for a Node.js TypeScript CLI tool
- No changes needed

### .idea/.gitignore — 2 files (Spring clean-arch)

- `backend/spring/clean-architecture/full/.idea/.gitignore`
- `backend/spring/clean-architecture/minimal/.idea/.gitignore`
- Auto-generated by IntelliJ — no changes needed (parent .gitignore will ignore .idea/ entirely)

## Junk Files on Disk (not git-tracked)

| File | Location |
|------|----------|
| `.env` | `backend/nestjs/clean-architecture/full/` |
| `.env` | `backend/nestjs/clean-architecture/minimal/` |
| `.env` | `backend/spring/clean-architecture/full/` |
| `build.log` | `backend/dotnet/feature-architecture/full/` |
| `startup.log` | `backend/nestjs/clean-architecture/full/` |
| `startup_rollback.log` | `backend/nestjs/clean-architecture/full/` |
| `startup_rollback_2.log` | `backend/nestjs/clean-architecture/full/` |
| `startup_verification.log` | `backend/nestjs/clean-architecture/full/` |
| Various `.log` files | `backend/nestjs/clean-architecture/minimal/` |
| `maven.log`, `test.log` | `backend/spring/clean-architecture/full/api/` |

## Security Check Results

| Check | Result |
|-------|--------|
| Tracked `.env` files | ✅ None found |
| Tracked secret keys (`.pem`, `.key`, `.p12`, `.pfx`, `.jks`) | ✅ None found |
| Tracked OS junk (`.DS_Store`, `Thumbs.db`) | ✅ None found |
| Tracked build artifacts (`bin/`, `obj/`, `target/`, `dist/`, `node_modules/`) | ✅ None found |

## Remediation Plan

1. Replace root .gitignore with clean, well-organized multi-stack version
2. Create standardized per-stack .gitignore templates (dotnet, spring, nestjs, frontend)
3. Apply to all 26 template directories (including 6 missing ones)
4. Replace shared/common/.gitignore with clean universal version
5. Add .gitignore completeness tests to Layer 1 test suite

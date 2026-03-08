# Minimal Variant Specification

**Status**: Normative specification
**Applies to**: All 13 minimal variants (9 backend + 4 frontend) across dotnet, spring, nestjs, vue, react

This document defines what "minimal" means. Every minimal variant MUST conform to this spec.
Non-conformance is a bug.

---

## 1. Backend Minimal Specification

Applies to all 9 backend minimal variants:
- `backend/{dotnet,spring,nestjs}/{clean,feature,nlayer}-architecture/minimal/`

### 1.1 Project Structure

| Requirement | Included | Notes |
|-------------|:--------:|-------|
| Same architecture layers as full variant | YES | Clean: 4 layers; Feature: feature folders; N-Layer: horizontal layers |
| Solution/project files build successfully | YES | `dotnet build` / `mvnw compile` / `npm run build` must pass |
| Dockerfile with HEALTHCHECK | YES | Multi-stage build, curl-based health check |
| Environment configuration | YES | `.env` / `appsettings.json` / `application.yml` |
| `.gitignore` | YES | Language-appropriate |

### 1.2 Features — INCLUDED

| Feature | Details |
|---------|---------|
| **Authentication** | SSO/JWT login + refresh token + logout. NO password registration, NO forgot-password, NO reset-password, NO change-password |
| **Health checks** | `GET /health`, `GET /health/ready`, `GET /health/live` |
| **Swagger/OpenAPI** | API documentation auto-generated and accessible at `/swagger` |
| **Structured logging** | Serilog (.NET) / Logback+Logstash (Spring) / Pino (NestJS) — JSON format |
| **PostgreSQL** | Database connection + ORM setup (EF Core / JPA+Hibernate / TypeORM) |
| **Base middleware** | Correlation ID, global exception handler, request logging |
| **Notification entity** | Simple CRUD: list, get, mark-as-read, delete. No complex relationships |
| **Audit log entity + service** | Record and query audit events. View-only endpoint (no delete/edit) |
| **File upload entity + service** | Upload, list, download, delete files |
| **Seed data** | Admin user (`admin@apptemplate.com` / `Admin@123`) seeded on first startup |
| **Tests** | Minimum 2 test files: 1 unit test + 1 integration/controller test |

### 1.3 Features — EXCLUDED

| Feature | Rationale |
|---------|-----------|
| **User management CRUD** | No list/create/update/delete users endpoints. No User entity beyond auth identity |
| **Department management CRUD** | No Department entity, no endpoints |
| **Export service** | No CSV/XLSX/PDF export. No export dependencies (ClosedXML, CsvHelper, QuestPDF, POI, exceljs, etc.) |
| **Password reset flow** | No forgot-password or reset-password endpoints |
| **Real-time notifications** | No SignalR / WebSocket / STOMP / socket.io hub or gateway |
| **Rate limiting middleware** | No AspNetCoreRateLimit / Bucket4j / env-based rate limiter |
| **Complex domain models** | No password history, login attempt tracking, or user-department relationships |
| **Export controller** | No `/api/export/*` endpoints |

### 1.4 Auth Endpoints — Minimal vs Full

| Endpoint | Full | Minimal |
|----------|:----:|:-------:|
| `POST /api/auth/login` | YES | YES |
| `POST /api/auth/refresh` | YES | YES |
| `POST /api/auth/logout` | YES | YES |
| `GET  /api/auth/me` | YES | YES |
| `POST /api/auth/register` | YES | NO |
| `POST /api/auth/forgot-password` | YES | NO |
| `POST /api/auth/reset-password` | YES | NO |
| `PUT  /api/auth/change-password` | YES | NO |
| `PUT  /api/auth/profile` | YES | NO |

### 1.5 Controllers/Endpoints — Minimal

| Controller | Endpoints |
|------------|-----------|
| Auth | login, refresh, logout, me |
| Notifications | list, get, mark-as-read, delete |
| AuditLogs | list (with pagination + filters) |
| Files | upload, list, download, delete |
| Health | /health, /health/ready, /health/live |

Total: **5 controllers**, no more.

### 1.6 Entities — Minimal

| Entity | Included | Notes |
|--------|:--------:|-------|
| Notification | YES | title, message, type, isRead, userId, timestamps |
| AuditLog | YES | action, entity, entityId, userId, details, timestamp |
| UploadedFile | YES | fileName, originalName, contentType, size, userId, timestamps |
| AuditableEntity (base) | YES | createdAt, updatedAt, createdBy, updatedBy |
| User | NO | No standalone User entity. Auth identity handled by JWT claims only |
| Department | NO | Not present |
| RefreshToken | YES | Stored for token refresh flow |

### 1.7 Dependencies — Excluded from Minimal

These packages MUST NOT appear in minimal variant dependency files:

| Stack | Excluded Packages |
|-------|-------------------|
| .NET | ClosedXML, CsvHelper, QuestPDF, BCrypt.Net-Next (if SSO-only), AspNetCoreRateLimit |
| Spring | Apache POI, Commons CSV, iText, Bucket4j |
| NestJS | exceljs, json2csv, pdfkit, @nestjs/throttler |

### 1.8 Test Requirements — Minimal

| Requirement | Minimum |
|-------------|---------|
| Unit test files | 1 (e.g., validator test, service test, or domain test) |
| Integration/controller test files | 1 (e.g., auth controller test or notification controller test) |
| Test framework configured | YES (xUnit/.NET, JUnit/Spring, Jest/NestJS) |
| Tests pass with `dotnet test` / `mvnw test` / `npm test` | YES |

---

## 2. Frontend Minimal Specification

Applies to all 4 frontend minimal variants:
- `frontend/vue/{vuetify,primevue}/minimal/`
- `frontend/react/{mui,primereact}/minimal/`

### 2.1 Pages — INCLUDED

| Page | Route | Notes |
|------|-------|-------|
| Login | `/login` | SSO/JWT login form |
| Forgot Password | `/forgot-password` | Request password reset email |
| Reset Password | `/reset-password` | Set new password from reset link |
| Profile | `/profile` | View/edit own profile (no password change) |
| Notifications | `/notifications` | List, mark-as-read. **Default redirect after login** |
| File Management | `/files` | Upload, list, download, delete |
| Audit Logs | `/audit-logs` | View-only table with pagination + filters |

Total: **7 pages** (+ index redirect page).

### 2.2 Pages — EXCLUDED

| Page | Notes |
|------|-------|
| Dashboard | No statistics, charts, or summary widgets |
| User Management | No user CRUD pages |
| Department Management | No department CRUD pages |

### 2.3 App Shell

| Component | Included | Notes |
|-----------|:--------:|-------|
| Sidebar/navigation drawer | YES | Links only to included pages |
| Top bar / app bar | YES | User menu, theme toggle, locale switch |
| Content area with router-view | YES | Standard layout |
| Notification menu (header) | YES | Bell icon with unread count |

### 2.4 Stores / State Management

| Store | Included | Notes |
|-------|:--------:|-------|
| Auth store | YES | login, logout, token refresh, interceptor |
| Notification store | YES | fetch, mark-as-read, unread count |
| Persistent notification store | YES | Toast/snackbar notifications |
| Theme store | YES | Light/dark toggle, persisted |
| Locale store | YES | en/ar switching, persisted |
| App store | YES | Sidebar state, loading states |
| User store | NO | No user CRUD state |
| Department store | NO | No department CRUD state |

### 2.5 API Services

| Service | Included | Notes |
|---------|:--------:|-------|
| Auth API | YES | login, refresh, logout, me |
| Notification API | YES | list, mark-as-read |
| File service | YES | upload, list, download, delete |
| Audit log service | YES | list with filters |
| User API | NO | No user CRUD calls |
| Department API | NO | No department CRUD calls |
| Export service | NO | No export calls |

### 2.6 Cross-Cutting Concerns

| Concern | Included | Notes |
|---------|:--------:|-------|
| i18n (English + Arabic) | YES | All included pages must have translations |
| RTL support | YES | Arabic locale triggers RTL layout |
| Theme toggle (light/dark) | YES | Persisted to localStorage |
| Axios interceptor + token refresh | YES | Automatic 401 → refresh → retry queue |
| Loading states | YES | Every data-fetching component shows loading indicator |
| Error states | YES | Every data-fetching component handles and displays errors |
| Empty states | YES | Every list/table shows empty state when no data |
| Responsive layout | YES | Mobile-friendly sidebar collapse |

### 2.7 Test Requirements — Frontend Minimal

| Requirement | Minimum |
|-------------|---------|
| Test files | 1 (auth store test) |
| Test framework configured | YES (Vitest) |
| Tests pass with `npm test` | YES |

### 2.8 Components — EXCLUDED

| Component | Notes |
|-----------|-------|
| ExportButton | No export functionality |
| SearchFilterBar (if user/dept-specific) | Not needed without CRUD pages |
| DateRangePicker (if export-specific) | Not needed without export |
| ConfirmDialog (if user/dept delete only) | Keep if used by file delete or notification delete |

### 2.9 Types — NO Dead Code

| Type File | Included | Notes |
|-----------|:--------:|-------|
| `auth.ts` | YES | Login request/response, token types |
| `notification.ts` | YES | Notification model |
| `pagination.ts` | YES | Shared pagination types |
| `file.ts` | YES | File upload/download types |
| `audit-log.ts` | YES | Audit log model |
| `user.ts` | NO | Must not exist if no user CRUD |
| `department.ts` | NO | Must not exist if no department CRUD |

---

## 3. No Dead Code Rule

The minimal variant MUST NOT contain:

| Category | Examples of Violations |
|----------|----------------------|
| Unused type/model files | `user.ts`, `department.ts`, `UserDto.cs`, `DepartmentDto.java` |
| Unused API service files | `userApi.ts`, `departmentApi.ts`, `ExportService.cs` |
| Unused store files | `userStore.ts`, `departmentStore.ts` |
| Unused route definitions | Routes pointing to pages that don't exist |
| Unused sidebar menu items | Menu entries for excluded pages |
| Unused imports | Importing excluded modules/components |
| Unused dependencies | npm/NuGet/Maven packages only needed by excluded features |
| Commented-out code | Code blocks from full variant left as comments |

**Enforcement**: `grep -r "department\|Department" src/` should return zero results in any minimal variant (except this spec file itself). Same for user CRUD references.

---

## 4. Default Redirect

| Variant | After Login Redirect |
|---------|---------------------|
| Full | `/dashboard` |
| Minimal | `/notifications` |

The index route (`/`) MUST redirect to `/notifications` in minimal variants, never to `/dashboard`.

---

## 5. Full vs Minimal Summary Matrix

| Feature | Full | Minimal |
|---------|:----:|:-------:|
| Dashboard page | YES | NO |
| User management CRUD (backend + frontend) | YES | NO |
| Department management CRUD (backend + frontend) | YES | NO |
| Export (XLSX/CSV/PDF) | YES | NO |
| Password management (register/forgot/reset/change) | YES | NO (backend) |
| Forgot/reset password pages | YES | YES (frontend) |
| Rate limiting | YES | NO |
| Real-time notifications (WebSocket) | YES | NO |
| File management | YES | YES |
| Audit logs | YES | YES |
| Notifications (REST, no real-time) | YES | YES |
| Auth (SSO login/refresh/logout) | YES | YES |
| Profile page | YES | YES |
| Health checks | YES | YES |
| Swagger/OpenAPI | YES | YES |
| Structured logging | YES | YES |
| Docker + HEALTHCHECK | YES | YES |
| Correlation ID middleware | YES | YES |
| Seed data (admin user) | YES | YES |
| i18n (en + ar) | YES | YES |
| Theme toggle | YES | YES |
| Tests (minimum 2 backend, 1 frontend) | YES | YES |

---

## 6. Verification Commands

### 6.1 Backend Verification

```bash
# ---- Run from any backend minimal variant root ----

# 1. Build succeeds
dotnet build                     # .NET
./mvnw clean compile             # Spring
npm run build                    # NestJS

# 2. Tests pass
dotnet test                      # .NET
./mvnw test                      # Spring
npm test                         # NestJS

# 3. No excluded entities (should return 0 results)
grep -ri "department" src/ --include="*.cs" --include="*.java" --include="*.ts" -l
grep -ri "UserManagement\|UsersController\|UserService\|UserRepository" src/ --include="*.cs" --include="*.java" --include="*.ts" -l
grep -ri "ExportService\|ExportController\|IExportService" src/ --include="*.cs" --include="*.java" --include="*.ts" -l

# 4. No excluded packages
grep -i "closedxml\|csvhelper\|questpdf" *.csproj                    # .NET
grep -i "poi\|commons-csv\|itext" pom.xml                           # Spring
grep -i "exceljs\|json2csv\|pdfkit" package.json                    # NestJS

# 5. No rate limiting
grep -ri "ratelimit\|throttl\|bucket4j" src/ -l

# 6. No real-time/WebSocket
grep -ri "signalr\|websocket\|stomp\|socket\.io" src/ -l

# 7. Health endpoints exist
grep -ri "health" src/ --include="*.cs" --include="*.java" --include="*.ts" -l

# 8. Minimum test file count
find . -path "*/test*" -o -path "*/Test*" | grep -E "\.(cs|java|ts)$" | wc -l
# Expected: >= 2

# 9. Auth is SSO-only (no password reset endpoints)
grep -ri "forgot.password\|reset.password\|change.password\|register" src/ --include="*Controller*" --include="*controller*" -l
# Expected: 0 results

# 10. Swagger configured
grep -ri "swagger\|openapi" src/ -l
# Expected: >= 1 result
```

### 6.2 Frontend Verification

```bash
# ---- Run from any frontend minimal variant root ----

# 1. Build succeeds
npm run build

# 2. Tests pass
npm test

# 3. No excluded pages exist
ls src/pages/dashboard* src/pages/Dashboard* 2>/dev/null
ls src/pages/users* src/pages/Users* 2>/dev/null
ls src/pages/departments* src/pages/Departments* 2>/dev/null
# Expected: all "No such file or directory"

# 4. No excluded types
ls src/types/user.ts src/types/department.ts 2>/dev/null
# Expected: "No such file or directory"

# 5. No excluded stores
grep -rl "userStore\|departmentStore\|user-store\|department-store" src/ --include="*.ts" --include="*.js" --include="*.vue" --include="*.tsx"
# Expected: 0 results

# 6. No excluded API services
grep -rl "userApi\|departmentApi\|user-api\|department-api\|exportService\|export-service\|exportApi\|export-api" src/ --include="*.ts" --include="*.js" --include="*.vue" --include="*.tsx"
# Expected: 0 results

# 7. No dead route definitions
grep -ri "dashboard\|/users\|/departments" src/router/ src/routes/ 2>/dev/null
# Expected: 0 results

# 8. No dead sidebar items
grep -ri "dashboard\|user.management\|department" src/ --include="*.ts" --include="*.js" --include="*.vue" --include="*.tsx" | grep -i "menu\|sidebar\|nav"
# Expected: 0 results

# 9. Default redirect is /notifications
grep -ri "redirect.*notification\|defaultRedirect\|/notifications" src/router/ src/routes/ src/App* 2>/dev/null
# Expected: >= 1 result

# 10. i18n has both locales
ls src/locales/en* src/locales/ar* src/i18n/en* src/i18n/ar* 2>/dev/null
# Expected: both en and ar files exist

# 11. Required pages exist
ls src/pages/login* src/pages/Login* 2>/dev/null            # Login
ls src/pages/forgot* src/pages/Forgot* 2>/dev/null           # Forgot password
ls src/pages/reset* src/pages/Reset* 2>/dev/null             # Reset password
ls src/pages/profile* src/pages/Profile* 2>/dev/null         # Profile
ls src/pages/notification* src/pages/Notification* 2>/dev/null # Notifications
ls src/pages/file* src/pages/File* 2>/dev/null               # Files
ls src/pages/audit* src/pages/Audit* 2>/dev/null             # Audit logs
# Expected: all found

# 12. Auth store test exists
find . -path "*test*" -name "*auth*" -o -path "*spec*" -name "*auth*" | head -5
# Expected: >= 1 result
```

### 6.3 Cross-Variant Consistency Check

```bash
# Run from monorepo root to verify all minimal variants conform

BACKEND_MINIMALS=(
  "backend/dotnet/clean-architecture/minimal"
  "backend/dotnet/feature-architecture/minimal"
  "backend/dotnet/nlayer-architecture/minimal"
  "backend/spring/clean-architecture/minimal"
  "backend/spring/feature-architecture/minimal"
  "backend/spring/nlayer-architecture/minimal"
  "backend/nestjs/clean-architecture/minimal"
  "backend/nestjs/feature-architecture/minimal"
  "backend/nestjs/nlayer-architecture/minimal"
)

FRONTEND_MINIMALS=(
  "frontend/vue/vuetify/minimal"
  "frontend/vue/primevue/minimal"
  "frontend/react/mui/minimal"
  "frontend/react/primereact/minimal"
)

echo "=== Backend Minimal Dead Code Check ==="
for dir in "${BACKEND_MINIMALS[@]}"; do
  if [ -d "$dir" ]; then
    count=$(grep -ri "department" "$dir/src/" 2>/dev/null | wc -l)
    echo "$dir: department references = $count (expected: 0)"
  fi
done

echo ""
echo "=== Frontend Minimal Dead Code Check ==="
for dir in "${FRONTEND_MINIMALS[@]}"; do
  if [ -d "$dir" ]; then
    count=$(grep -ri "dashboard\|userStore\|departmentStore\|userApi\|departmentApi" "$dir/src/" 2>/dev/null | wc -l)
    echo "$dir: dead code references = $count (expected: 0)"
  fi
done
```

---

## 7. Known Non-Conformances

Current violations of this spec that need to be fixed:

| Variant | Violation | Spec Section |
|---------|-----------|--------------|
| `backend/dotnet/feature-architecture/minimal` | 0 test files (requires 2) | 1.8 |
| `backend/dotnet/nlayer-architecture/minimal` | 0 test files (requires 2) | 1.8 |
| `backend/dotnet/clean-architecture/minimal` | ExportService/ExportController still present | 1.3 |
| `backend/dotnet/feature-architecture/minimal` | ExportService/ExportController still present | 1.3 |
| `backend/dotnet/nlayer-architecture/minimal` | ExportService still present | 1.3 |
| `frontend/vue/primevue/minimal` | Missing forgot-password, reset-password, profile pages | 2.1 |
| `frontend/react/mui/minimal` | Ships `types/user.ts` and `types/department.ts` (dead code) | 3 |
| `frontend/react/primereact/minimal` | Ships `types/user.ts` and `types/department.ts` (dead code) | 3 |

---

## 8. Changelog

| Date | Change |
|------|--------|
| 2026-03-08 | Initial specification created |

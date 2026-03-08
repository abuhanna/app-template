# Zero Variant Specification

**Status**: Normative specification
**Applies to**: All zero variants across dotnet, spring, nestjs, vue, react
**Use case**: Backend microservice behind an API gateway or service mesh — auth handled at the gateway level

This document defines what "zero" means. Every zero variant MUST conform to this spec.
Non-conformance is a bug.

---

## 1. Backend Zero Specification

Applies to all 9 backend zero variants:
- `backend/{dotnet,spring,nestjs}/{clean,feature,nlayer}-architecture/zero/`

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
| **Health checks** | `GET /health`, `GET /health/ready`, `GET /health/live` |
| **Swagger/OpenAPI** | API documentation auto-generated and accessible at `/swagger` |
| **Structured logging** | Serilog (.NET) / Logback+Logstash (Spring) / Pino (NestJS) — JSON format |
| **PostgreSQL** | Database connection + ORM setup (EF Core / JPA+Hibernate / TypeORM) |
| **Base middleware** | Correlation ID, global exception handler, request logging |
| **Notifications** | Simple CRUD: list, get, mark-as-read, delete. No user association — use `X-User-Id` header or similar for caller identification |
| **Audit logs** | Record and query audit events. View-only endpoint (no delete/edit). No user tracking — record caller via header |
| **File management** | Upload, list, download, delete files. No user association — ownership not enforced |
| **Docker + Dockerfile** | Multi-stage build with HEALTHCHECK |
| **CI/CD pipeline** | GitHub Actions or equivalent |
| **Tests** | Minimum 2 test files: 1 unit test + 1 integration/controller test |

### 1.3 Features — EXCLUDED

| Feature | Rationale |
|---------|-----------|
| **ALL auth middleware and endpoints** | No authentication — gateway handles auth |
| **JWT validation/middleware** | No token parsing, no `[Authorize]` / `@UseGuards` / `@PreAuthorize` |
| **User entity and management** | No User model, no user CRUD, no user endpoints |
| **Department entity and management** | No Department model, no department CRUD |
| **Rate limiting middleware** | Handled at the API gateway level |
| **Export service and endpoints** | No CSV/XLSX/PDF export (no user context for permissions) |
| **Password hashing libraries** | No BCrypt.Net-Next / BCrypt (Spring Security) / bcrypt (Node) |
| **Refresh token logic** | No RefreshToken entity, no token storage |
| **Real-time notifications** | No SignalR / WebSocket / STOMP / socket.io hub or gateway |
| **Seed data** | No admin user seeding (no User entity). DB schema migration only |

### 1.4 Auth Endpoints — Zero vs Minimal vs Full

| Endpoint | Full | Minimal | Zero |
|----------|:----:|:-------:|:----:|
| `POST /api/auth/login` | YES | YES | NO |
| `POST /api/auth/refresh` | YES | YES | NO |
| `POST /api/auth/logout` | YES | YES | NO |
| `GET  /api/auth/me` | YES | YES | NO |
| `POST /api/auth/register` | YES | NO | NO |
| `POST /api/auth/forgot-password` | YES | NO | NO |
| `POST /api/auth/reset-password` | YES | NO | NO |
| `PUT  /api/auth/change-password` | YES | NO | NO |
| `PUT  /api/auth/profile` | YES | NO | NO |

Zero has **no auth controller at all**.

### 1.5 Controllers/Endpoints — Zero

| Controller | Endpoints |
|------------|-----------|
| Notifications | list, get, mark-as-read, delete |
| AuditLogs | list (with pagination + filters) |
| Files | upload, list, download, delete |
| Health | /health, /health/ready, /health/live |

Total: **4 controllers**. No Auth controller.

### 1.6 Entities — Zero

| Entity | Included | Notes |
|--------|:--------:|-------|
| Notification | YES | title, message, type, isRead, timestamps. No userId FK — optional caller ID from header |
| AuditLog | YES | action, entity, entityId, details, timestamp. No userId FK — caller recorded from header |
| UploadedFile | YES | fileName, originalName, contentType, size, timestamps. No userId FK |
| AuditableEntity (base) | YES | createdAt, updatedAt (no createdBy/updatedBy if those reference User entity) |
| User | NO | Does not exist |
| Department | NO | Does not exist |
| RefreshToken | NO | Does not exist |

### 1.7 Dependencies — Excluded from Zero

These packages MUST NOT appear in zero variant dependency files:

| Stack | Excluded Packages |
|-------|-------------------|
| .NET | ClosedXML, CsvHelper, QuestPDF, BCrypt.Net-Next, AspNetCoreRateLimit, System.IdentityModel.Tokens.Jwt, Microsoft.AspNetCore.Authentication.JwtBearer |
| Spring | Apache POI, Commons CSV, iText, Bucket4j, JJWT, spring-boot-starter-security |
| NestJS | exceljs, json2csv, pdfkit, @nestjs/throttler, @nestjs/jwt, @nestjs/passport, passport, passport-jwt, bcrypt |

### 1.8 Test Requirements — Zero

| Requirement | Minimum |
|-------------|---------|
| Unit test files | 1 (e.g., service test or domain test) |
| Integration/controller test files | 1 (e.g., notification controller test or file controller test) |
| Test framework configured | YES (xUnit/.NET, JUnit/Spring, Jest/NestJS) |
| Tests pass with `dotnet test` / `mvnw test` / `npm test` | YES |

---

## 2. Frontend Zero Specification

Applies to all 4 frontend zero variants:
- `frontend/vue/{vuetify,primevue}/zero/`
- `frontend/react/{mui,primereact}/zero/`

### 2.1 Pages — INCLUDED

| Page | Route | Notes |
|------|-------|-------|
| Notifications | `/notifications` | List, mark-as-read, delete. **Default route** |
| File Management | `/files` | Upload, list, download, delete |
| Audit Logs | `/audit-logs` | View-only table with pagination + filters |

Total: **3 pages** (+ index redirect page).

### 2.2 Pages — EXCLUDED

| Page | Notes |
|------|-------|
| Login | No authentication |
| Forgot Password | No authentication |
| Reset Password | No authentication |
| Profile | No user identity |
| Dashboard | No statistics, charts, or summary widgets |
| User Management | No user CRUD pages |
| Department Management | No department CRUD pages |

### 2.3 App Shell

| Component | Included | Notes |
|-----------|:--------:|-------|
| Sidebar/navigation drawer | YES | Links only to notifications, files, audit logs |
| Top bar / app bar | YES | Theme toggle, locale switch. **No user avatar or user menu** |
| Content area with router-view | YES | Standard layout |
| Notification menu (header) | YES | Bell icon with unread count |

### 2.4 Stores / State Management

| Store | Included | Notes |
|-------|:--------:|-------|
| Notification store | YES | fetch, mark-as-read, unread count |
| Persistent notification store | YES | Toast/snackbar notifications |
| Theme store | YES | Light/dark toggle, persisted |
| Locale store | YES | en/ar switching, persisted |
| App store | YES | Sidebar state, loading states |
| Auth store | NO | No token management, no login state |
| User store | NO | No user CRUD state |
| Department store | NO | No department CRUD state |

### 2.5 API Services

| Service | Included | Notes |
|---------|:--------:|-------|
| Notification API | YES | list, get, mark-as-read, delete |
| File service | YES | upload, list, download, delete |
| Audit log service | YES | list with filters |
| Auth API | NO | No login/refresh/logout/me calls |
| User API | NO | No user CRUD calls |
| Department API | NO | No department CRUD calls |
| Export service | NO | No export calls |

### 2.6 Cross-Cutting Concerns

| Concern | Included | Notes |
|---------|:--------:|-------|
| i18n (English + Arabic) | YES | All included pages must have translations |
| RTL support | YES | Arabic locale triggers RTL layout |
| Theme toggle (light/dark) | YES | Persisted to localStorage |
| Loading states | YES | Every data-fetching component shows loading indicator |
| Error states | YES | Every data-fetching component handles and displays errors |
| Empty states | YES | Every list/table shows empty state when no data |
| Responsive layout | YES | Mobile-friendly sidebar collapse |
| Axios interceptor + token refresh | NO | No JWT, no Authorization header |
| Route guards (auth) | NO | No protected routes — all routes are public |

### 2.7 Axios/HTTP Client — Zero

The HTTP client in zero variant:
- Uses a plain Axios instance with base URL configuration
- Includes correlation ID header if applicable
- Does **NOT** attach `Authorization` header
- Does **NOT** implement 401 interceptor or token refresh queue
- Does **NOT** redirect to login on authentication errors

### 2.8 Test Requirements — Frontend Zero

| Requirement | Minimum |
|-------------|---------|
| Test files | 1 (e.g., notification store test or component test) |
| Test framework configured | YES (Vitest) |
| Tests pass with `npm test` | YES |

### 2.9 Components — EXCLUDED

| Component | Notes |
|-----------|-------|
| LoginForm | No authentication |
| UserAvatar | No user identity |
| UserMenu / ProfileMenu | No user identity |
| ExportButton | No export functionality |
| AuthGuard / ProtectedRoute | No route protection |
| PasswordField | No password input anywhere |

### 2.10 Types — NO Dead Code

| Type File | Included | Notes |
|-----------|:--------:|-------|
| `notification.ts` | YES | Notification model |
| `pagination.ts` | YES | Shared pagination types |
| `file.ts` | YES | File upload/download types |
| `audit-log.ts` | YES | Audit log model |
| `auth.ts` | NO | Must not exist |
| `user.ts` | NO | Must not exist |
| `department.ts` | NO | Must not exist |

---

## 3. No Dead Code Rule

The zero variant MUST NOT contain:

| Category | Examples of Violations |
|----------|----------------------|
| Unused auth files | `AuthController.cs`, `JwtService.cs`, `auth.guard.ts`, `AuthFilter.java` |
| Unused type/model files | `user.ts`, `department.ts`, `UserDto.cs`, `DepartmentDto.java`, `RefreshToken.cs` |
| Unused API service files | `authApi.ts`, `userApi.ts`, `departmentApi.ts`, `ExportService.cs` |
| Unused store files | `authStore.ts`, `userStore.ts`, `departmentStore.ts` |
| Unused route definitions | Routes pointing to pages that don't exist (login, profile, dashboard) |
| Unused sidebar menu items | Menu entries for excluded pages |
| Unused imports | Importing excluded modules/components |
| Unused dependencies | npm/NuGet/Maven packages only needed by excluded features |
| Unused middleware | JWT validation, auth middleware, rate limiting middleware |
| Commented-out code | Code blocks from full/minimal variant left as comments |

**Enforcement**: The following searches should return zero results in any zero variant:

```bash
# No auth references (except this spec)
grep -ri "authorize\|authentication\|jwt\|bearer\|login\|logout\|refresh.token" src/ -l

# No user/department references
grep -ri "department" src/ -l
grep -ri "UserManagement\|UsersController\|UserService\|UserRepository\|UserEntity" src/ -l

# No export references
grep -ri "ExportService\|ExportController\|IExportService" src/ -l

# No rate limiting references
grep -ri "ratelimit\|throttl\|bucket4j" src/ -l
```

---

## 4. Default Redirect

| Variant | Default Route |
|---------|--------------|
| Full | `/dashboard` |
| Minimal | `/notifications` |
| Zero | `/notifications` |

The index route (`/`) MUST redirect to `/notifications` in zero variants.

In the frontend, there is **no login page** — the app loads directly into `/notifications`.

---

## 5. Full vs Minimal vs Zero Summary Matrix

| Feature | Full | Minimal | Zero |
|---------|:----:|:-------:|:----:|
| Dashboard page | YES | NO | NO |
| User management CRUD (backend + frontend) | YES | NO | NO |
| Department management CRUD (backend + frontend) | YES | NO | NO |
| Export (XLSX/CSV/PDF) | YES | NO | NO |
| Password management (register/forgot/reset/change) | YES | NO | NO |
| Forgot/reset password pages (frontend) | YES | YES | NO |
| Rate limiting | YES | NO | NO |
| Real-time notifications (WebSocket) | YES | NO | NO |
| Profile page | YES | YES | NO |
| Auth (login/refresh/logout) | YES | YES (SSO) | NO |
| Auth store + JWT interceptor (frontend) | YES | YES | NO |
| Route guards (frontend) | YES | YES | NO |
| User entity (backend) | YES | NO* | NO |
| RefreshToken entity (backend) | YES | YES | NO |
| Seed data (admin user) | YES | YES | NO |
| File management | YES | YES | YES |
| Audit logs | YES | YES | YES |
| Notifications (REST) | YES | YES | YES |
| Health checks | YES | YES | YES |
| Swagger/OpenAPI | YES | YES | YES |
| Structured logging | YES | YES | YES |
| Docker + HEALTHCHECK | YES | YES | YES |
| Correlation ID middleware | YES | YES | YES |
| i18n (en + ar) | YES | YES | YES |
| Theme toggle | YES | YES | YES |
| Tests (minimum 2 backend, 1 frontend) | YES | YES | YES |

\* Minimal has no standalone User entity — auth identity from JWT claims only.

---

## 6. Verification Commands

### 6.1 Backend Verification

```bash
# ---- Run from any backend zero variant root ----

# 1. Build succeeds
dotnet build                     # .NET
./mvnw clean compile             # Spring
npm run build                    # NestJS

# 2. Tests pass
dotnet test                      # .NET
./mvnw test                      # Spring
npm test                         # NestJS

# 3. No auth code (should return 0 results)
grep -ri "authorize\|[Aa]uthenticat\|JwtBearer\|jwt\|bearer\|[Aa]uth[CS]" src/ --include="*.cs" --include="*.java" --include="*.ts" -l
# Expected: 0 results

# 4. No user/department entities (should return 0 results)
grep -ri "department" src/ --include="*.cs" --include="*.java" --include="*.ts" -l
grep -ri "UserManagement\|UsersController\|UserService\|UserRepository" src/ --include="*.cs" --include="*.java" --include="*.ts" -l

# 5. No excluded packages
grep -i "closedxml\|csvhelper\|questpdf\|bcrypt\|AspNetCoreRateLimit\|JwtBearer" *.csproj    # .NET
grep -i "poi\|commons-csv\|itext\|bucket4j\|jjwt\|spring-security" pom.xml                  # Spring
grep -i "exceljs\|json2csv\|pdfkit\|@nestjs/throttler\|@nestjs/jwt\|@nestjs/passport\|bcrypt" package.json  # NestJS

# 6. No rate limiting
grep -ri "ratelimit\|throttl\|bucket4j" src/ -l
# Expected: 0 results

# 7. No real-time/WebSocket
grep -ri "signalr\|websocket\|stomp\|socket\.io" src/ -l
# Expected: 0 results

# 8. No export service
grep -ri "ExportService\|ExportController\|IExportService" src/ -l
# Expected: 0 results

# 9. Health endpoints exist
grep -ri "health" src/ --include="*.cs" --include="*.java" --include="*.ts" -l
# Expected: >= 1 result

# 10. Swagger configured
grep -ri "swagger\|openapi" src/ -l
# Expected: >= 1 result

# 11. Minimum test file count
find . -path "*/test*" -o -path "*/Test*" | grep -E "\.(cs|java|ts)$" | wc -l
# Expected: >= 2

# 12. No seed data referencing users
grep -ri "SeedAsync\|seed.*admin\|admin@apptemplate" src/ -l
# Expected: 0 results
```

### 6.2 Frontend Verification

```bash
# ---- Run from any frontend zero variant root ----

# 1. Build succeeds
npm run build

# 2. Tests pass
npm test

# 3. No auth pages exist
ls src/pages/login* src/pages/Login* 2>/dev/null
ls src/pages/forgot* src/pages/Forgot* 2>/dev/null
ls src/pages/reset* src/pages/Reset* 2>/dev/null
ls src/pages/profile* src/pages/Profile* 2>/dev/null
# Expected: all "No such file or directory"

# 4. No excluded pages exist
ls src/pages/dashboard* src/pages/Dashboard* 2>/dev/null
ls src/pages/users* src/pages/Users* 2>/dev/null
ls src/pages/departments* src/pages/Departments* 2>/dev/null
# Expected: all "No such file or directory"

# 5. No auth types/stores
ls src/types/auth.ts src/types/user.ts src/types/department.ts 2>/dev/null
# Expected: "No such file or directory"

# 6. No auth store
grep -rl "authStore\|auth-store\|useAuth" src/ --include="*.ts" --include="*.js" --include="*.vue" --include="*.tsx"
# Expected: 0 results

# 7. No JWT interceptor
grep -ri "Authorization\|Bearer\|refreshToken\|token.*refresh\|401.*retry" src/ --include="*.ts" --include="*.js" -l
# Expected: 0 results

# 8. No excluded API services
grep -rl "authApi\|auth-api\|userApi\|departmentApi\|exportService\|export-service" src/ --include="*.ts" --include="*.js" --include="*.vue" --include="*.tsx"
# Expected: 0 results

# 9. No dead route definitions
grep -ri "dashboard\|/users\|/departments\|/login\|/profile\|/forgot\|/reset" src/router/ src/routes/ 2>/dev/null
# Expected: 0 results

# 10. No dead sidebar items
grep -ri "dashboard\|user.management\|department\|profile\|login" src/ --include="*.ts" --include="*.js" --include="*.vue" --include="*.tsx" | grep -i "menu\|sidebar\|nav"
# Expected: 0 results

# 11. Default redirect is /notifications
grep -ri "redirect.*notification\|defaultRedirect\|/notifications" src/router/ src/routes/ src/App* 2>/dev/null
# Expected: >= 1 result

# 12. i18n has both locales
ls src/locales/en* src/locales/ar* src/i18n/en* src/i18n/ar* 2>/dev/null
# Expected: both en and ar files exist

# 13. Required pages exist
ls src/pages/notification* src/pages/Notification* 2>/dev/null  # Notifications
ls src/pages/file* src/pages/File* 2>/dev/null                  # Files
ls src/pages/audit* src/pages/Audit* 2>/dev/null                # Audit logs
# Expected: all found

# 14. No route guards
grep -ri "authGuard\|ProtectedRoute\|requireAuth\|isAuthenticated\|beforeEach.*auth" src/ --include="*.ts" --include="*.js" --include="*.vue" --include="*.tsx" -l
# Expected: 0 results
```

### 6.3 Cross-Variant Consistency Check

```bash
# Run from monorepo root to verify all zero variants conform

BACKEND_ZEROS=(
  "backend/dotnet/clean-architecture/zero"
  "backend/dotnet/feature-architecture/zero"
  "backend/dotnet/nlayer-architecture/zero"
  "backend/spring/clean-architecture/zero"
  "backend/spring/feature-architecture/zero"
  "backend/spring/nlayer-architecture/zero"
  "backend/nestjs/clean-architecture/zero"
  "backend/nestjs/feature-architecture/zero"
  "backend/nestjs/nlayer-architecture/zero"
)

FRONTEND_ZEROS=(
  "frontend/vue/vuetify/zero"
  "frontend/vue/primevue/zero"
  "frontend/react/mui/zero"
  "frontend/react/primereact/zero"
)

echo "=== Backend Zero Dead Code Check ==="
for dir in "${BACKEND_ZEROS[@]}"; do
  if [ -d "$dir" ]; then
    auth_count=$(grep -ri "authorize\|authentication\|jwt\|bearer" "$dir/src/" 2>/dev/null | wc -l)
    dept_count=$(grep -ri "department" "$dir/src/" 2>/dev/null | wc -l)
    user_count=$(grep -ri "UserService\|UserRepository\|UserController" "$dir/src/" 2>/dev/null | wc -l)
    echo "$dir: auth=$auth_count dept=$dept_count user=$user_count (all expected: 0)"
  else
    echo "$dir: NOT YET CREATED"
  fi
done

echo ""
echo "=== Frontend Zero Dead Code Check ==="
for dir in "${FRONTEND_ZEROS[@]}"; do
  if [ -d "$dir" ]; then
    count=$(grep -ri "authStore\|auth-store\|login\|dashboard\|userStore\|departmentStore\|userApi\|departmentApi\|Authorization\|Bearer" "$dir/src/" 2>/dev/null | wc -l)
    echo "$dir: dead code references = $count (expected: 0)"
  else
    echo "$dir: NOT YET CREATED"
  fi
done
```

---

## 7. Changelog

| Date | Change |
|------|--------|
| 2026-03-08 | Initial specification created |

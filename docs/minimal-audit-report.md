# Minimal Variant Audit Report

**Date**: 2026-03-08
**Specification**: [minimal-variant-spec.md](minimal-variant-spec.md)
**Audited**: 9 backend + 4 frontend = 13 minimal variants

---

## Executive Summary

| Metric | Count |
|--------|------:|
| Total checks | 159 |
| Passed | 110 |
| Failed | 49 |
| Pass rate | 69.2% |

| Variant Group | Passed | Total | Rate |
|---------------|-------:|------:|-----:|
| dotnet backends | 28 | 33 | 84.8% |
| spring backends | 15 | 33 | 45.5% |
| nestjs backends | 12 | 33 | 36.4% |
| vue frontends | 27 | 30 | 90.0% |
| react frontends | 28 | 30 | 93.3% |

**Worst offenders**: `spring/feature/minimal` and `spring/nlayer/minimal` (3/11 each),
`nestjs/feature/minimal` and `nestjs/nlayer/minimal` (2/11 each).

**Best**: `vue/vuetify/minimal` (15/15 — fully compliant).

---

## Backend Checks Legend

| # | Check |
|---|-------|
| 1 | Auth endpoints present (login, refresh, logout, me) and NO excluded endpoints |
| 2 | Health endpoints (/health, /health/ready, /health/live) |
| 3 | Swagger/OpenAPI configured |
| 4 | Structured logging (Serilog/Logback+Logstash/Pino — JSON format) |
| 5 | Middleware (correlation ID, global exception handler, request logging) |
| 6 | Notification entity + CRUD (list, get, mark-as-read, delete) |
| 7 | Audit log entity + list endpoint |
| 8 | File upload entity + service (upload, list, download, delete) |
| 9 | Test files (minimum 2: 1 unit + 1 integration) |
| 10 | Dockerfile with HEALTHCHECK |
| 11 | No excluded features (no user CRUD, department, export, rate limiting, real-time, password mgmt) |

---

## 1. dotnet/clean-architecture/minimal

| # | Check | Expected | Actual | Status |
|---|-------|----------|--------|:------:|
| 1 | Auth endpoints | login, refresh, logout, me; NO register/forgot/reset/change | login, logout, me present; no excluded endpoints found | ✅ |
| 2 | Health endpoints | /health, /health/ready, /health/live | All 3 present in HealthController | ✅ |
| 3 | Swagger | Swashbuckle configured | Configured in Program.cs (lines 169–218) | ✅ |
| 4 | Structured logging | Serilog + JSON | Serilog with `RenderedCompactJsonFormatter` (lines 27–42) | ✅ |
| 5 | Middleware | Correlation ID, exception handler, request logging | All 3 present (lines 290–320) | ✅ |
| 6 | Notification CRUD | Entity + list/get/mark-as-read/delete | Entity in Domain/Entities/; NotificationsController with list, mark-as-read, mark-all-as-read | ✅ |
| 7 | Audit log | Entity + list endpoint | Entity in Domain/Entities/; AuditLogsController with GetAuditLogs | ✅ |
| 8 | File upload | Entity + upload/list/download/delete | Entity in Domain/Entities/; FilesController with all 4 operations | ✅ |
| 9 | Tests (≥2) | ≥1 unit + ≥1 integration | 5 files: AuthControllerTests, FilesControllerTests, HealthControllerTests, DomainExceptionTests, LoginCommandValidatorTests | ✅ |
| 10 | Docker HEALTHCHECK | Present | HEALTHCHECK in Dockerfile (lines 23–24) | ✅ |
| 11 | No excluded features | None present | **ExportController + ExportService present; ClosedXML, CsvHelper, QuestPDF in csproj; AspNetCoreRateLimit v5.0.0; SignalR + NotificationHub + CustomUserIdProvider** | ❌ |

**Score: 10/11** — Export, rate limiting, and SignalR all still present.

---

## 2. dotnet/feature-architecture/minimal

| # | Check | Expected | Actual | Status |
|---|-------|----------|--------|:------:|
| 1 | Auth endpoints | login, refresh, logout, me; NO excluded | login, logout, me present; no excluded endpoints | ✅ |
| 2 | Health endpoints | /health, /health/ready, /health/live | All 3 present in HealthController | ✅ |
| 3 | Swagger | Swashbuckle configured | Configured in Program.cs (lines 145–192) | ✅ |
| 4 | Structured logging | Serilog + JSON | Serilog with `RenderedCompactJsonFormatter` (lines 27–38) | ✅ |
| 5 | Middleware | Correlation ID, exception handler, request logging | All 3 present (lines 262–284) | ✅ |
| 6 | Notification CRUD | Entity + operations | Entity in Features/Notifications/; NotificationsController with list, mark-as-read | ✅ |
| 7 | Audit log | Entity + list endpoint | Entity in Common/Entities/; AuditLogsController with GetAuditLogs | ✅ |
| 8 | File upload | Entity + operations | Entity in Features/Files/; FilesController with all 4 operations | ✅ |
| 9 | Tests (≥2) | ≥1 unit + ≥1 integration | 4 files: AuthControllerTests, FilesControllerTests, HealthControllerTests, JwtTokenGeneratorTests | ✅ |
| 10 | Docker HEALTHCHECK | Present | **Not present in Dockerfile** | ❌ |
| 11 | No excluded features | None present | **ExportController + ExportService; ClosedXML, CsvHelper, QuestPDF; AspNetCoreRateLimit; SignalR + NotificationHub** | ❌ |

**Score: 9/11** — Missing Docker HEALTHCHECK. Export, rate limiting, and SignalR still present.

---

## 3. dotnet/nlayer-architecture/minimal

| # | Check | Expected | Actual | Status |
|---|-------|----------|--------|:------:|
| 1 | Auth endpoints | login, refresh, logout, me; NO excluded | login, logout, me present; no excluded endpoints | ✅ |
| 2 | Health endpoints | /health, /health/ready, /health/live | All 3 present in HealthController | ✅ |
| 3 | Swagger | Swashbuckle configured | Configured in Program.cs (lines 145–192) | ✅ |
| 4 | Structured logging | Serilog + JSON | Serilog with `RenderedCompactJsonFormatter` (lines 27–38) | ✅ |
| 5 | Middleware | Correlation ID, exception handler, request logging | All 3 present (lines 262–284) | ✅ |
| 6 | Notification CRUD | Entity + operations | Entity in Models/Entities/; NotificationsController with list, mark-as-read | ✅ |
| 7 | Audit log | Entity + list endpoint | Entity in Models/Entities/; AuditLogsController with GetAuditLogs | ✅ |
| 8 | File upload | Entity + operations | Entity in Models/Entities/; FilesController with all 4 operations | ✅ |
| 9 | Tests (≥2) | ≥1 unit + ≥1 integration | 6 files: AuthControllerTests, FilesControllerTests, HealthControllerTests, AuditLogsControllerTests, NotificationsControllerTests, JwtTokenGeneratorTests | ✅ |
| 10 | Docker HEALTHCHECK | Present | **Not present in Dockerfile** | ❌ |
| 11 | No excluded features | None present | **ExportController + ExportService; ClosedXML, CsvHelper, QuestPDF; AspNetCoreRateLimit; SignalR + NotificationHub** | ❌ |

**Score: 9/11** — Missing Docker HEALTHCHECK. Export, rate limiting, and SignalR still present.

---

## 4. spring/clean-architecture/minimal

| # | Check | Expected | Actual | Status |
|---|-------|----------|--------|:------:|
| 1 | Auth endpoints | login, refresh, logout, me; NO excluded | login, refresh, logout, me present; **also has register, forgot-password, reset-password, change-password** | ❌ |
| 2 | Health endpoints | /health, /health/ready, /health/live | All 3 present | ✅ |
| 3 | Swagger | SpringDoc OpenAPI configured | springdoc-openapi in pom.xml + OpenApiConfig class | ✅ |
| 4 | Structured logging | Logback + Logstash JSON | logback-spring.xml with Logstash encoder | ✅ |
| 5 | Middleware | Correlation ID, exception handler, request logging | CorrelationIdFilter, GlobalExceptionHandler, JwtAuthenticationFilter | ✅ |
| 6 | Notification CRUD | Entity + operations | GetUserNotificationsUseCase, MarkNotificationAsReadUseCase, MarkAllNotificationsAsReadUseCase | ✅ |
| 7 | Audit log | Entity + list endpoint | AuditLog entity + AuditLogsController + GetAuditLogsUseCase | ✅ |
| 8 | File upload | Entity + operations | UploadedFile entity + FilesController with all operations | ✅ |
| 9 | Tests (≥2) | ≥1 unit + ≥1 integration | 6 files: AuditLogsControllerTest, AuthControllerTest, FilesControllerTest, HealthControllerTest, NotificationsControllerTest, AuditLogIntegrationTest | ✅ |
| 10 | Docker HEALTHCHECK | Present | HEALTHCHECK present (interval=30s, timeout=10s, start-period=60s) | ✅ |
| 11 | No excluded features | None present | **POI, OpenCSV, iText in infrastructure/pom.xml; Bucket4j in api/pom.xml; spring-boot-starter-websocket + WebSocketConfig; EmailService** | ❌ |

**Score: 9/11** — Excluded auth endpoints (register/forgot/reset/change-password) exposed. Export deps, Bucket4j, WebSocket, and email service still present.

---

## 5. spring/feature-architecture/minimal

| # | Check | Expected | Actual | Status |
|---|-------|----------|--------|:------:|
| 1 | Auth endpoints | login, refresh, logout, me; NO excluded | **Only login + register present; missing refresh, logout, me** | ❌ |
| 2 | Health endpoints | /health, /health/ready, /health/live | **No health controller found** | ❌ |
| 3 | Swagger | SpringDoc configured | springdoc-openapi in pom.xml + OpenApiConfig | ✅ |
| 4 | Structured logging | Logback + Logstash JSON | **No logback-spring.xml; basic console logging only** | ❌ |
| 5 | Middleware | Correlation ID, exception handler, request logging | GlobalExceptionHandler + JwtAuthFilter present; **no CorrelationIdFilter** | ❌ |
| 6 | Notification CRUD | REST entity + operations | **NotificationController is STOMP/WebSocket only (@MessageMapping), not REST** | ❌ |
| 7 | Audit log | Entity + list endpoint | **AuditLog entity exists but no controller or service endpoint** | ❌ |
| 8 | File upload | Entity + operations | UploadedFile + FileController + FileService + FileRepository | ✅ |
| 9 | Tests (≥2) | ≥1 unit + ≥1 integration | 2 files: AuthControllerTest, FileControllerTest | ✅ |
| 10 | Docker HEALTHCHECK | Present | **Not present (only VOLUME /tmp and ENTRYPOINT)** | ❌ |
| 11 | No excluded features | None present | **POI + Commons CSV in pom.xml; spring-boot-starter-websocket + WebSocketConfig; register endpoint present** | ❌ |

**Score: 3/11** — Severely non-compliant. Missing core functionality (auth endpoints, health, logging, correlation ID, REST notifications, audit logs controller). Excluded deps present.

---

## 6. spring/nlayer-architecture/minimal

| # | Check | Expected | Actual | Status |
|---|-------|----------|--------|:------:|
| 1 | Auth endpoints | login, refresh, logout, me; NO excluded | **Only login + register present; missing refresh, logout, me** | ❌ |
| 2 | Health endpoints | /health, /health/ready, /health/live | **No health controller found** | ❌ |
| 3 | Swagger | SpringDoc configured | springdoc-openapi in pom.xml + OpenApiConfig | ✅ |
| 4 | Structured logging | Logback + Logstash JSON | **No logback-spring.xml; basic console logging only** | ❌ |
| 5 | Middleware | Correlation ID, exception handler, request logging | GlobalExceptionHandler + JwtAuthFilter present; **no CorrelationIdFilter** | ❌ |
| 6 | Notification CRUD | REST entity + operations | **NotificationController is STOMP/WebSocket only (@MessageMapping), not REST** | ❌ |
| 7 | Audit log | Entity + list endpoint | **AuditLog entity exists but no controller or service endpoint** | ❌ |
| 8 | File upload | Entity + operations | UploadedFile + FileController + FileService + FileRepository | ✅ |
| 9 | Tests (≥2) | ≥1 unit + ≥1 integration | 2 files: AuthControllerTest, FileControllerTest | ✅ |
| 10 | Docker HEALTHCHECK | Present | **Not present (only VOLUME /tmp and ENTRYPOINT)** | ❌ |
| 11 | No excluded features | None present | **POI + Commons CSV in pom.xml; spring-boot-starter-websocket + WebSocketConfig; register endpoint present** | ❌ |

**Score: 3/11** — Severely non-compliant. Identical issues to spring/feature-architecture/minimal.

---

## 7. nestjs/clean-architecture/minimal

| # | Check | Expected | Actual | Status |
|---|-------|----------|--------|:------:|
| 1 | Auth endpoints | login, refresh, logout, me; NO excluded | login, refresh, logout, me present; **also has profile (GET/PUT), forgot-password, reset-password** | ❌ |
| 2 | Health endpoints | /health, /health/ready, /health/live | All 3 present with DB connectivity check | ✅ |
| 3 | Swagger | @nestjs/swagger configured | In package.json + main.ts DocumentBuilder + SwaggerModule.setup | ✅ |
| 4 | Structured logging | Pino JSON format | nestjs-pino + pino in package.json; LoggerModule with pinoHttp | ✅ |
| 5 | Middleware | Correlation ID, exception handler, request logging | Correlation ID in pinoHttp config; GlobalExceptionFilter; pinoHttp autoLogging | ✅ |
| 6 | Notification CRUD | Entity + list/get/mark-as-read/delete | List + mark-as-read + mark-all-as-read present; **delete endpoint missing** | ❌ |
| 7 | Audit log | Entity + list endpoint | AuditLog entity + controller with list (pagination + filters) | ✅ |
| 8 | File upload | Entity + operations | UploadedFile entity + FilesController with upload, list, download, delete | ✅ |
| 9 | Tests (≥2) | ≥1 unit + ≥1 integration | 8 files: transform.interceptor, global-exception.filter, audit-logs.controller, jwt-token.service, auth.controller, files.controller, health.controller, notifications.controller | ✅ |
| 10 | Docker HEALTHCHECK | Present | HEALTHCHECK with wget (interval=30s, timeout=3s, start-period=5s) | ✅ |
| 11 | No excluded features | None present | **user-management module, department-management module, export module all present and imported in app.module.ts** | ❌ |

**Score: 8/11** — Excluded auth endpoints exposed. Notification delete missing. User/department/export modules present.

---

## 8. nestjs/feature-architecture/minimal

| # | Check | Expected | Actual | Status |
|---|-------|----------|--------|:------:|
| 1 | Auth endpoints | login, refresh, logout, me; NO excluded | **Only login + register; missing refresh, logout, me** | ❌ |
| 2 | Health endpoints | /health, /health/ready, /health/live | **Only /health; missing /health/ready and /health/live** | ❌ |
| 3 | Swagger | @nestjs/swagger configured | In package.json + main.ts | ✅ |
| 4 | Structured logging | Pino JSON format | **No nestjs-pino or pino; basic console logging only** | ❌ |
| 5 | Middleware | Correlation ID, exception handler, request logging | HttpExceptionFilter + LoggingInterceptor; **no correlation ID** | ❌ |
| 6 | Notification CRUD | REST entity + operations | **Mock implementation (returns []); missing delete and get endpoints** | ❌ |
| 7 | Audit log | Entity + list endpoint | **AuditLog entity exists but no controller** | ❌ |
| 8 | File upload | Entity + operations | UploadedFile entity + upload/download; **missing list and delete** | ❌ |
| 9 | Tests (≥2) | ≥1 unit + ≥1 integration | 9 files: http-exception.filter, logging.interceptor, auth.controller, auth.service, files.controller, files.service, health.controller, notification.gateway, notifications.controller | ✅ |
| 10 | Docker HEALTHCHECK | Present | **Not present** | ❌ |
| 11 | No excluded features | None present | **exceljs + csv-stringify in package.json; ExportModule in app.module.ts; DepartmentsModule imported; @nestjs/websockets + notification.gateway** | ❌ |

**Score: 2/11** — Severely non-compliant. Most core features are missing or incomplete.

---

## 9. nestjs/nlayer-architecture/minimal

| # | Check | Expected | Actual | Status |
|---|-------|----------|--------|:------:|
| 1 | Auth endpoints | login, refresh, logout, me; NO excluded | **Only login + register; missing refresh, logout, me** | ❌ |
| 2 | Health endpoints | /health, /health/ready, /health/live | **Only /health; missing /health/ready and /health/live** | ❌ |
| 3 | Swagger | @nestjs/swagger configured | In package.json + main.ts | ✅ |
| 4 | Structured logging | Pino JSON format | **No nestjs-pino or pino; basic console logging only** | ❌ |
| 5 | Middleware | Correlation ID, exception handler, request logging | HttpExceptionFilter + LoggingInterceptor; **no correlation ID** | ❌ |
| 6 | Notification CRUD | REST entity + operations | **Mock implementation; missing delete endpoint** | ❌ |
| 7 | Audit log | Entity + list endpoint | **AuditLog entity exists but no controller** | ❌ |
| 8 | File upload | Entity + operations | UploadedFile entity + upload/download; **missing list and delete** | ❌ |
| 9 | Tests (≥2) | ≥1 unit + ≥1 integration | 7 files: auth.controller, auth.service, departments.controller, files.controller, users.controller, health.controller, notifications.controller | ✅ |
| 10 | Docker HEALTHCHECK | Present | **Not present** | ❌ |
| 11 | No excluded features | None present | **UsersController with full CRUD (list/get/create/update/delete); DepartmentsController with full CRUD; ExportModule; @nestjs/websockets** | ❌ |

**Score: 2/11** — Severely non-compliant. **CRITICAL**: Full User and Department CRUD controllers are exposed.

---

## Frontend Checks Legend

| # | Check |
|---|-------|
| 1 | Login page present |
| 2 | Forgot password page present |
| 3 | Reset password page present |
| 4 | Profile page present |
| 5 | Notifications page present |
| 6 | Files page present |
| 7 | Audit logs page present |
| 8 | Auth store with token refresh |
| 9 | No dead code type files (user.ts, department.ts) |
| 10 | No dead code API services (userApi, departmentApi, exportService) |
| 11 | No dead code routes (dashboard, /users, /departments) |
| 12 | No dead code sidebar items (dashboard, user mgmt, departments) |
| 13 | Dashboard page absent |
| 14 | User management pages absent |
| 15 | Department management pages absent |

---

## 10. vue/vuetify/minimal

| # | Check | Expected | Actual | Status |
|---|-------|----------|--------|:------:|
| 1 | Login page | Present | login.vue | ✅ |
| 2 | Forgot password page | Present | forgot-password.vue | ✅ |
| 3 | Reset password page | Present | reset-password.vue | ✅ |
| 4 | Profile page | Present | profile.vue | ✅ |
| 5 | Notifications page | Present | notifications/index.vue | ✅ |
| 6 | Files page | Present | files/index.vue | ✅ |
| 7 | Audit logs page | Present | audit-logs/index.vue | ✅ |
| 8 | Auth store w/ refresh | Present | stores/auth.js with refreshTokens() | ✅ |
| 9 | No dead code types | No user.ts/department.ts | Only pagination.js + index.js | ✅ |
| 10 | No dead code APIs | No user/dept/export services | None found | ✅ |
| 11 | No dead code routes | No dashboard/users/depts routes | Routes: /login, /notifications, /files, /audit-logs, /profile only | ✅ |
| 12 | No dead sidebar items | No dashboard/users/depts in nav | menuItems: Notifications, Files (Admin), Audit Logs (Admin) | ✅ |
| 13 | No Dashboard page | Absent | No dashboard.vue | ✅ |
| 14 | No User mgmt pages | Absent | No users/ directory | ✅ |
| 15 | No Dept mgmt pages | Absent | No departments/ directory | ✅ |

**Additional**: Default redirect → /notifications ✅ | i18n en+ar ✅ | Theme toggle ✅ | 14 test files ✅

**Score: 15/15** — Fully compliant.

---

## 11. vue/primevue/minimal

| # | Check | Expected | Actual | Status |
|---|-------|----------|--------|:------:|
| 1 | Login page | Present | login.vue | ✅ |
| 2 | Forgot password page | Present | **Not found** | ❌ |
| 3 | Reset password page | Present | **Not found** | ❌ |
| 4 | Profile page | Present | **Not found** | ❌ |
| 5 | Notifications page | Present | notifications/index.vue | ✅ |
| 6 | Files page | Present | files/index.vue | ✅ |
| 7 | Audit logs page | Present | audit-logs/index.vue | ✅ |
| 8 | Auth store w/ refresh | Present | stores/auth.js with refreshTokens() | ✅ |
| 9 | No dead code types | No user.ts/department.ts | Only pagination.js + index.js | ✅ |
| 10 | No dead code APIs | No user/dept/export services | None found | ✅ |
| 11 | No dead code routes | No dashboard/users/depts routes | Clean routes | ✅ |
| 12 | No dead sidebar items | No dashboard/users/depts in nav | menuItems: Notifications, Files (Admin), Audit Logs (Admin) | ✅ |
| 13 | No Dashboard page | Absent | No dashboard.vue | ✅ |
| 14 | No User mgmt pages | Absent | No users/ directory | ✅ |
| 15 | No Dept mgmt pages | Absent | No departments/ directory | ✅ |

**Additional**: Default redirect → /notifications ✅ | i18n en+ar ✅ | Theme toggle ✅ | 14 test files ✅

**Score: 12/15** — Missing forgot-password, reset-password, and profile pages (spec §2.1 requires all three).

---

## 12. react/mui/minimal

| # | Check | Expected | Actual | Status |
|---|-------|----------|--------|:------:|
| 1 | Login page | Present | Login.tsx | ✅ |
| 2 | Forgot password page | Present | ForgotPassword.tsx | ✅ |
| 3 | Reset password page | Present | ResetPassword.tsx | ✅ |
| 4 | Profile page | Present | Profile.tsx | ✅ |
| 5 | Notifications page | Present | Notifications.tsx | ✅ |
| 6 | Files page | Present | FilesPage.tsx | ✅ |
| 7 | Audit logs page | Present | AuditLogsPage.tsx | ✅ |
| 8 | Auth store w/ refresh | Present | authStore.ts with refreshTokens + interceptor | ✅ |
| 9 | No dead code types | No user.ts/department.ts | **user.ts EXISTS (User, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest); department.ts EXISTS (Department, CreateDepartmentRequest, UpdateDepartmentRequest)** | ❌ |
| 10 | No dead code APIs | No user/dept/export services | None found | ✅ |
| 11 | No dead code routes | No dashboard/users/depts routes | Routes: /, /login, /forgot-password, /reset-password, /profile, /notifications, /files, /audit-logs only | ✅ |
| 12 | No dead sidebar items | No dashboard/users/depts in nav | menuConfig.tsx: Notifications, Files (Admin), Audit Logs (Admin) | ✅ |
| 13 | No Dashboard page | Absent | No Dashboard.tsx | ✅ |
| 14 | No User mgmt pages | Absent | None found | ✅ |
| 15 | No Dept mgmt pages | Absent | None found | ✅ |

**Additional**: Default redirect → /notifications ✅ | i18n en+ar ✅ | Theme toggle ✅ | 13 test files ✅

**Score: 14/15** — Dead code: `src/types/user.ts` and `src/types/department.ts` must be deleted.

---

## 13. react/primereact/minimal

| # | Check | Expected | Actual | Status |
|---|-------|----------|--------|:------:|
| 1 | Login page | Present | Login.tsx | ✅ |
| 2 | Forgot password page | Present | ForgotPassword.tsx | ✅ |
| 3 | Reset password page | Present | ResetPassword.tsx | ✅ |
| 4 | Profile page | Present | Profile.tsx | ✅ |
| 5 | Notifications page | Present | Notifications.tsx | ✅ |
| 6 | Files page | Present | Files.tsx | ✅ |
| 7 | Audit logs page | Present | AuditLogs.tsx | ✅ |
| 8 | Auth store w/ refresh | Present | authStore.ts with refreshTokens + interceptor | ✅ |
| 9 | No dead code types | No user.ts/department.ts | **user.ts EXISTS; department.ts EXISTS** | ❌ |
| 10 | No dead code APIs | No user/dept/export services | None found | ✅ |
| 11 | No dead code routes | No dashboard/users/depts routes | Routes: /, /login, /forgot-password, /reset-password, /profile, /notifications, /files, /audit-logs only | ✅ |
| 12 | No dead sidebar items | No dashboard/users/depts in nav | menuConfig.ts: Notifications, Files (Admin), Audit Logs (Admin) | ✅ |
| 13 | No Dashboard page | Absent | No Dashboard.tsx | ✅ |
| 14 | No User mgmt pages | Absent | None found | ✅ |
| 15 | No Dept mgmt pages | Absent | None found | ✅ |

**Additional**: Default redirect → /notifications ✅ | i18n en+ar ✅ | Theme toggle ✅ | 13 test files ✅

**Score: 14/15** — Dead code: `src/types/user.ts` and `src/types/department.ts` must be deleted.

---

## Scorecard

| Variant | Score | Grade |
|---------|------:|-------|
| vue/vuetify/minimal | 15/15 | ✅ Compliant |
| react/mui/minimal | 14/15 | ⚠️ Minor |
| react/primereact/minimal | 14/15 | ⚠️ Minor |
| vue/primevue/minimal | 12/15 | ⚠️ Moderate |
| dotnet/clean-architecture/minimal | 10/11 | ⚠️ Moderate |
| dotnet/feature-architecture/minimal | 9/11 | ⚠️ Moderate |
| dotnet/nlayer-architecture/minimal | 9/11 | ⚠️ Moderate |
| spring/clean-architecture/minimal | 9/11 | ⚠️ Moderate |
| nestjs/clean-architecture/minimal | 8/11 | ❌ Significant |
| spring/feature-architecture/minimal | 3/11 | ❌ Critical |
| spring/nlayer-architecture/minimal | 3/11 | ❌ Critical |
| nestjs/feature-architecture/minimal | 2/11 | ❌ Critical |
| nestjs/nlayer-architecture/minimal | 2/11 | ❌ Critical |

---

## All Failures

### Excluded features still present (most common issue)

| Variant | Violation | Spec §  |
|---------|-----------|---------|
| dotnet/clean/minimal | ExportController, ExportService, ClosedXML, CsvHelper, QuestPDF | 1.3, 1.7 |
| dotnet/clean/minimal | AspNetCoreRateLimit v5.0.0 configured | 1.3, 1.7 |
| dotnet/clean/minimal | SignalR, NotificationHub, CustomUserIdProvider | 1.3 |
| dotnet/feature/minimal | ExportController, ExportService, ClosedXML, CsvHelper, QuestPDF | 1.3, 1.7 |
| dotnet/feature/minimal | AspNetCoreRateLimit configured | 1.3, 1.7 |
| dotnet/feature/minimal | SignalR, NotificationHub | 1.3 |
| dotnet/nlayer/minimal | ExportController, ExportService, ClosedXML, CsvHelper, QuestPDF | 1.3, 1.7 |
| dotnet/nlayer/minimal | AspNetCoreRateLimit configured | 1.3, 1.7 |
| dotnet/nlayer/minimal | SignalR, NotificationHub | 1.3 |
| spring/clean/minimal | POI, OpenCSV, iText in infrastructure/pom.xml | 1.3, 1.7 |
| spring/clean/minimal | Bucket4j in api/pom.xml | 1.3, 1.7 |
| spring/clean/minimal | spring-boot-starter-websocket + WebSocketConfig | 1.3 |
| spring/clean/minimal | EmailService (password reset infrastructure) | 1.3 |
| spring/feature/minimal | POI, Commons CSV in pom.xml | 1.3, 1.7 |
| spring/feature/minimal | spring-boot-starter-websocket + WebSocketConfig | 1.3 |
| spring/nlayer/minimal | POI, Commons CSV in pom.xml | 1.3, 1.7 |
| spring/nlayer/minimal | spring-boot-starter-websocket + WebSocketConfig | 1.3 |
| nestjs/clean/minimal | user-management, department-management, export modules in app.module.ts | 1.3, 3 |
| nestjs/feature/minimal | exceljs, csv-stringify in package.json; ExportModule; DepartmentsModule | 1.3, 1.7 |
| nestjs/feature/minimal | @nestjs/websockets + notification.gateway | 1.3 |
| nestjs/nlayer/minimal | **UsersController with full CRUD endpoints** | 1.3 |
| nestjs/nlayer/minimal | **DepartmentsController with full CRUD endpoints** | 1.3 |
| nestjs/nlayer/minimal | ExportModule; @nestjs/websockets | 1.3, 1.7 |
| react/mui/minimal | src/types/user.ts (dead code) | 3 |
| react/mui/minimal | src/types/department.ts (dead code) | 3 |
| react/primereact/minimal | src/types/user.ts (dead code) | 3 |
| react/primereact/minimal | src/types/department.ts (dead code) | 3 |

### Missing required functionality

| Variant | Missing | Spec § |
|---------|---------|--------|
| spring/clean/minimal | Excluded auth endpoints exposed (register, forgot-password, reset-password, change-password) | 1.4 |
| spring/feature/minimal | Missing auth endpoints: refresh, logout, me | 1.4, 1.5 |
| spring/feature/minimal | No health check controller at all | 1.2 |
| spring/feature/minimal | No structured logging (no logback-spring.xml) | 1.2 |
| spring/feature/minimal | No CorrelationIdFilter | 1.2 |
| spring/feature/minimal | Notifications are WebSocket-only, not REST | 1.2, 1.3 |
| spring/feature/minimal | AuditLog entity exists but no controller/endpoint | 1.2, 1.5 |
| spring/nlayer/minimal | Missing auth endpoints: refresh, logout, me | 1.4, 1.5 |
| spring/nlayer/minimal | No health check controller at all | 1.2 |
| spring/nlayer/minimal | No structured logging (no logback-spring.xml) | 1.2 |
| spring/nlayer/minimal | No CorrelationIdFilter | 1.2 |
| spring/nlayer/minimal | Notifications are WebSocket-only, not REST | 1.2, 1.3 |
| spring/nlayer/minimal | AuditLog entity exists but no controller/endpoint | 1.2, 1.5 |
| nestjs/clean/minimal | Excluded auth endpoints exposed (profile, forgot-password, reset-password) | 1.4 |
| nestjs/clean/minimal | Notification delete endpoint missing | 1.2, 1.5 |
| nestjs/feature/minimal | Missing auth endpoints: refresh, logout, me; has register | 1.4, 1.5 |
| nestjs/feature/minimal | Only /health; missing /health/ready and /health/live | 1.2 |
| nestjs/feature/minimal | No Pino/structured logging | 1.2 |
| nestjs/feature/minimal | No correlation ID middleware | 1.2 |
| nestjs/feature/minimal | Notification CRUD is mock implementation | 1.2 |
| nestjs/feature/minimal | AuditLog entity exists but no controller | 1.2, 1.5 |
| nestjs/feature/minimal | File upload missing list and delete | 1.2, 1.5 |
| nestjs/nlayer/minimal | Missing auth endpoints: refresh, logout, me; has register | 1.4, 1.5 |
| nestjs/nlayer/minimal | Only /health; missing /health/ready and /health/live | 1.2 |
| nestjs/nlayer/minimal | No Pino/structured logging | 1.2 |
| nestjs/nlayer/minimal | No correlation ID middleware | 1.2 |
| nestjs/nlayer/minimal | Notification CRUD is mock implementation | 1.2 |
| nestjs/nlayer/minimal | AuditLog entity exists but no controller | 1.2, 1.5 |
| nestjs/nlayer/minimal | File upload missing list and delete | 1.2, 1.5 |
| vue/primevue/minimal | Missing forgot-password page | 2.1 |
| vue/primevue/minimal | Missing reset-password page | 2.1 |
| vue/primevue/minimal | Missing profile page | 2.1 |

### Docker HEALTHCHECK missing

| Variant | Spec § |
|---------|--------|
| dotnet/feature-architecture/minimal | 1.1 |
| dotnet/nlayer-architecture/minimal | 1.1 |
| spring/feature-architecture/minimal | 1.1 |
| spring/nlayer-architecture/minimal | 1.1 |
| nestjs/feature-architecture/minimal | 1.1 |
| nestjs/nlayer-architecture/minimal | 1.1 |

---

## Updated Known Non-Conformances

Cross-referencing with spec §7 (original known non-conformances):

| Original Entry | Current Status |
|----------------|----------------|
| dotnet/feature/minimal: 0 test files | **FIXED** — now has 4 test files |
| dotnet/nlayer/minimal: 0 test files | **FIXED** — now has 6 test files |
| dotnet/clean/minimal: ExportService/ExportController present | **STILL PRESENT** + also has rate limiting and SignalR |
| dotnet/feature/minimal: ExportService/ExportController present | **STILL PRESENT** + also has rate limiting and SignalR |
| dotnet/nlayer/minimal: ExportService present | **STILL PRESENT** + also has rate limiting and SignalR |
| vue/primevue/minimal: Missing pages | **STILL PRESENT** — missing forgot-password, reset-password, profile |
| react/mui/minimal: Ships user.ts + department.ts | **STILL PRESENT** |
| react/primereact/minimal: Ships user.ts + department.ts | **STILL PRESENT** |

**New non-conformances discovered by this audit** (not in original §7):
- All 3 dotnet minimals: AspNetCoreRateLimit and SignalR present
- dotnet/feature + nlayer: Missing Docker HEALTHCHECK
- spring/clean: Excluded auth endpoints + export/rate-limiting/WebSocket deps
- spring/feature + nlayer: Severely incomplete (missing most core features)
- nestjs/clean: Excluded auth endpoints + user/dept/export modules
- nestjs/feature + nlayer: Severely incomplete (missing most core features)
- nestjs/nlayer: Full User + Department CRUD controllers exposed

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-08 | Initial audit against minimal-variant-spec.md |

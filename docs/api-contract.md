# API Contract Specification

> **Single Source of Truth** for all AppTemplate backends (dotnet, spring, nestjs)
> and frontends (vue, react). Every implementation MUST conform to this contract.

---

## Table of Contents

1. [Naming Conventions](#naming-conventions)
2. [Variant Feature Matrix](#variant-feature-matrix)
3. [Standard Response Envelopes](#standard-response-envelopes)
4. [Standard Pagination](#standard-pagination)
5. [Authentication](#authentication)
6. [User Management](#user-management)
7. [Department Management](#department-management)
8. [Notifications](#notifications)
9. [File Management](#file-management)
10. [Audit Logs](#audit-logs)
11. [Export](#export)
12. [Health Checks](#health-checks)
13. [Data Models](#data-models)
14. [Real-time Events](#real-time-events)

---

## Naming Conventions

| Concern              | Convention                          | Example                    |
|----------------------|-------------------------------------|----------------------------|
| JSON field names     | camelCase                           | `firstName`, `isActive`    |
| Endpoint paths       | lowercase kebab-case                | `/api/auth/forgot-password`|
| Query parameters     | camelCase                           | `pageSize`, `sortBy`       |
| Date/time format     | ISO 8601 UTC with `Z` suffix        | `2026-01-15T09:30:00Z`     |
| ID format            | Integer (auto-increment)            | `1`, `42`, `1337`          |
| Boolean fields       | `is` prefix where applicable        | `isActive`, `isRead`       |
| Enum string values   | lowercase                           | `admin`, `info`, `create`  |

---

## Variant Feature Matrix

| Feature                | full | minimal | zero *(planned)* |
|------------------------|:----:|:-------:|:----------------:|
| Internal auth (JWT)    | ✅   | ❌      | ❌               |
| External auth / SSO    | ❌   | ✅      | ❌               |
| No auth                | ❌   | ❌      | ✅               |
| User management CRUD   | ✅   | ❌      | ❌               |
| Department mgmt CRUD   | ✅   | ❌      | ❌               |
| Notifications          | ✅   | ✅      | ✅               |
| File management        | ✅   | ✅      | ✅               |
| Audit logs             | ✅   | ✅      | ✅               |
| Export                  | ✅   | ✅      | ❌               |
| Health checks          | ✅   | ✅      | ✅               |
| Rate limiting          | ✅   | ✅      | ❌               |
| Structured logging     | ✅   | ✅      | ✅               |
| Swagger / OpenAPI      | ✅   | ✅      | ✅               |

> **Note:** The `zero` variant is planned but not yet implemented. It is included
> here to define the target contract for when it is built.

---

## Standard Response Envelopes

### Success — Single Item

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Success — Paginated List

```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": [ ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Success — No Body

Some mutations return no body (e.g., delete). Use HTTP `204 No Content`.

### Error

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": ["field-level error 1", "field-level error 2"]
}
```

- `errors` is **optional** — omit when there are no field-level details.
- HTTP status codes carry the error category (400, 401, 403, 404, 409, 422, 500).

### Standard HTTP Status Codes

| Code | Usage                                                    |
|------|----------------------------------------------------------|
| 200  | Successful GET, PUT, POST (non-create)                   |
| 201  | Successful resource creation (POST)                      |
| 204  | Successful delete or action with no response body        |
| 400  | Bad request / validation error                           |
| 401  | Missing or invalid authentication                        |
| 403  | Authenticated but insufficient permissions               |
| 404  | Resource not found                                       |
| 409  | Conflict (duplicate email, username, etc.)               |
| 422  | Unprocessable entity (semantic validation failure)       |
| 500  | Internal server error                                    |

---

## Standard Pagination

All list endpoints accept these **exact** query parameter names:

| Parameter   | Type     | Default  | Description                              |
|-------------|----------|----------|------------------------------------------|
| `page`      | integer  | `1`      | 1-based page number                      |
| `pageSize`  | integer  | `10`     | Items per page (max 100)                 |
| `search`    | string   | —        | Free-text search across relevant fields  |
| `sortBy`    | string   | —        | Field name to sort by                    |
| `sortOrder` | string   | `desc`   | `asc` or `desc`                          |

Additional filters are defined per-endpoint below.

---

## Authentication

### Full Variant — Internal JWT Auth

#### `POST /api/auth/register`

Create a new user account.

- **Auth:** none
- **Variant:** full

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

| Field       | Type   | Required | Constraints                          |
|-------------|--------|----------|--------------------------------------|
| `username`  | string | yes      | 3–50 chars, alphanumeric + underscore|
| `email`     | string | yes      | Valid email format                   |
| `password`  | string | yes      | Min 8 chars, upper + lower + digit   |
| `firstName` | string | no       |                                      |
| `lastName`  | string | no       |                                      |

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "dGhpcyBpcyBh...",
    "expiresIn": 900,
    "user": { "...User object" }
  }
}
```

**Errors:**
- `409` — Email or username already exists
- `400` — Validation failure

---

#### `POST /api/auth/login`

Authenticate with email/username and password.

- **Auth:** none
- **Variant:** full

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

| Field      | Type   | Required | Notes                         |
|------------|--------|----------|-------------------------------|
| `email`    | string | no*      | Either `email` or `username`  |
| `username` | string | no*      | Either `email` or `username`  |
| `password` | string | yes      |                               |

> *At least one of `email` or `username` must be provided.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "dGhpcyBpcyBh...",
    "expiresIn": 900,
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "role": "user",
      "departmentId": 1,
      "departmentName": "Engineering",
      "isActive": true
    }
  }
}
```

**Errors:**
- `401` — Invalid credentials
- `403` — Account deactivated

---

#### `POST /api/auth/refresh`

Exchange a refresh token for a new access token.

- **Auth:** none
- **Variant:** full

**Request:**
```json
{
  "refreshToken": "dGhpcyBpcyBh..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "bmV3IHJlZnJl...",
    "expiresIn": 900
  }
}
```

**Errors:**
- `401` — Invalid or expired refresh token

---

#### `POST /api/auth/logout`

Invalidate the current refresh token.

- **Auth:** jwt-required
- **Variant:** full

**Request:** No body required. The access token in the `Authorization` header identifies the session.

**Response:** `204 No Content`

---

#### `GET /api/auth/me`

Get current user info from JWT claims (no database lookup).

- **Auth:** jwt-required
- **Variant:** full, minimal

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User info retrieved",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "admin",
    "departmentId": 1,
    "departmentName": "Engineering",
    "isActive": true
  }
}
```

---

#### `GET /api/auth/profile`

Get full user profile from database.

- **Auth:** jwt-required
- **Variant:** full, minimal

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": { "...User object (see Data Models)" }
}
```

---

#### `PUT /api/auth/profile`

Update own profile.

- **Auth:** jwt-required
- **Variant:** full, minimal

**Request:**
```json
{
  "firstName": "Jonathan",
  "lastName": "Doe"
}
```

| Field       | Type   | Required | Notes              |
|-------------|--------|----------|--------------------|
| `firstName` | string | no       |                    |
| `lastName`  | string | no       |                    |

**Response:** `200 OK` — Updated User object wrapped in standard success envelope.

---

#### `POST /api/auth/change-password`

Change own password (requires current password).

- **Auth:** jwt-required
- **Variant:** full

**Request:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

| Field             | Type   | Required |
|-------------------|--------|----------|
| `currentPassword` | string | yes      |
| `newPassword`     | string | yes      |
| `confirmPassword` | string | yes      |

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors:**
- `400` — Passwords don't match or new password doesn't meet requirements
- `401` — Current password is incorrect

---

#### `POST /api/auth/forgot-password`

Request a password reset email.

- **Auth:** none
- **Variant:** full

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK` (always, to prevent email enumeration)
```json
{
  "success": true,
  "message": "If your email is registered, you will receive a password reset link"
}
```

---

#### `POST /api/auth/reset-password`

Reset password using a token from the reset email.

- **Auth:** none
- **Variant:** full

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Errors:**
- `400` — Invalid or expired token, passwords don't match

---

### Minimal Variant — External Auth / SSO

Minimal variant does **not** have login, register, forgot-password, or reset-password.
Authentication is handled by an external identity provider. The backend validates
incoming JWT tokens using a shared secret or public key.

#### `POST /api/auth/validate-token`

Validate an external JWT/SSO token and create/update local user record.

- **Auth:** none
- **Variant:** minimal

**Request:**
```json
{
  "token": "external-jwt-or-sso-token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Token validated",
  "data": {
    "accessToken": "internal-jwt-token",
    "expiresIn": 900,
    "user": { "...User object" }
  }
}
```

**Errors:**
- `401` — Invalid or expired external token

#### Other Minimal Endpoints

- `GET /api/auth/me` — Same as full variant
- `GET /api/auth/profile` — Same as full variant (user auto-created from JWT claims)
- `PUT /api/auth/profile` — Same as full variant

### Zero Variant *(planned)*

No auth endpoints. No auth middleware. All endpoints are publicly accessible.

---

## User Management

> **Variant:** full only

All user management endpoints require `jwt-required`. Create, update, and delete
require `admin` role.

#### `GET /api/users`

List users with pagination, search, and filters.

- **Auth:** jwt-required
- **Variant:** full

**Query Parameters** (in addition to [standard pagination](#standard-pagination)):

| Parameter      | Type    | Description                      |
|----------------|---------|----------------------------------|
| `isActive`     | boolean | Filter by active status          |
| `departmentId` | integer | Filter by department             |

**Response:** `200 OK` — Paginated list of User objects.

---

#### `POST /api/users`

Create a new user (admin action).

- **Auth:** admin-only
- **Variant:** full

**Request:**
```json
{
  "username": "janedoe",
  "email": "jane@example.com",
  "password": "TempPass123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "user",
  "departmentId": 1,
  "isActive": true
}
```

| Field          | Type    | Required | Notes                            |
|----------------|---------|----------|----------------------------------|
| `username`     | string  | yes      | 3–50 chars, unique               |
| `email`        | string  | yes      | Valid email, unique               |
| `password`     | string  | yes      | Min 8 chars, strong               |
| `firstName`    | string  | no       |                                  |
| `lastName`     | string  | no       |                                  |
| `role`         | string  | no       | `admin` or `user` (default: `user`)|
| `departmentId` | integer | no       |                                  |
| `isActive`     | boolean | no       | Default: `true`                  |

**Response:** `201 Created` — User object.

**Errors:**
- `409` — Username or email already exists
- `400` — Validation failure

---

#### `GET /api/users/{id}`

Get a single user by ID.

- **Auth:** jwt-required
- **Variant:** full

**Response:** `200 OK` — User object.

**Errors:**
- `404` — User not found

---

#### `PUT /api/users/{id}`

Update a user.

- **Auth:** admin-only
- **Variant:** full

**Request:**
```json
{
  "email": "newemail@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "admin",
  "departmentId": 2,
  "isActive": false
}
```

All fields are optional. Only provided fields are updated.

**Response:** `200 OK` — Updated User object.

**Errors:**
- `404` — User not found
- `409` — Email conflict

---

#### `DELETE /api/users/{id}`

Soft-delete a user (sets `isActive = false`).

- **Auth:** admin-only
- **Variant:** full

**Response:** `204 No Content`

**Errors:**
- `404` — User not found

---

## Department Management

> **Variant:** full only

All department endpoints require `jwt-required`. Create, update, and delete
require `admin` role.

#### `GET /api/departments`

List departments with pagination.

- **Auth:** jwt-required
- **Variant:** full

**Query Parameters** (in addition to [standard pagination](#standard-pagination)):

| Parameter  | Type    | Description               |
|------------|---------|---------------------------|
| `isActive` | boolean | Filter by active status   |

**Response:** `200 OK` — Paginated list of Department objects.

---

#### `POST /api/departments`

Create a new department.

- **Auth:** admin-only
- **Variant:** full

**Request:**
```json
{
  "code": "ENG",
  "name": "Engineering",
  "description": "Software engineering team"
}
```

| Field         | Type   | Required | Notes        |
|---------------|--------|----------|--------------|
| `code`        | string | yes      | Unique code  |
| `name`        | string | yes      |              |
| `description` | string | no       |              |

**Response:** `201 Created` — Department object.

**Errors:**
- `409` — Department code already exists

---

#### `GET /api/departments/{id}`

- **Auth:** jwt-required
- **Variant:** full

**Response:** `200 OK` — Department object.

---

#### `PUT /api/departments/{id}`

- **Auth:** admin-only
- **Variant:** full

**Request:** Same fields as create, all optional. Additionally:

| Field      | Type    | Required | Notes |
|------------|---------|----------|-------|
| `isActive` | boolean | no       |       |

**Response:** `200 OK` — Updated Department object.

---

#### `DELETE /api/departments/{id}`

- **Auth:** admin-only
- **Variant:** full

**Response:** `204 No Content`

---

## Notifications

> **Variant:** all (full, minimal, zero)

#### `GET /api/notifications`

List notifications for the current user (paginated).

- **Auth:** jwt-required (none for zero variant)
- **Variant:** all

**Query Parameters** (in addition to [standard pagination](#standard-pagination)):

| Parameter    | Type    | Description                          |
|--------------|---------|--------------------------------------|
| `unreadOnly` | boolean | If `true`, return only unread items  |

**Response:** `200 OK` — Paginated list of Notification objects.

---

#### `GET /api/notifications/unread-count`

Get the count of unread notifications.

- **Auth:** jwt-required (none for zero variant)
- **Variant:** all

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Unread count retrieved",
  "data": {
    "count": 5
  }
}
```

---

#### `PUT /api/notifications/{id}/read`

Mark a single notification as read.

- **Auth:** jwt-required (none for zero variant)
- **Variant:** all

**Response:** `204 No Content`

---

#### `PUT /api/notifications/read-all`

Mark all notifications as read for the current user.

- **Auth:** jwt-required (none for zero variant)
- **Variant:** all

**Response:** `204 No Content`

---

#### `DELETE /api/notifications/{id}`

Delete a notification.

- **Auth:** jwt-required (none for zero variant)
- **Variant:** all

**Response:** `204 No Content`

---

## File Management

> **Variant:** all (full, minimal, zero)

#### `GET /api/files`

List files (paginated).

- **Auth:** jwt-required (none for zero variant)
- **Variant:** all

**Query Parameters** (in addition to [standard pagination](#standard-pagination)):

| Parameter  | Type    | Description                 |
|------------|---------|-----------------------------|
| `category` | string  | Filter by file category     |
| `isPublic` | boolean | Filter by public/private    |

**Response:** `200 OK` — Paginated list of File objects.

---

#### `POST /api/files`

Upload a file.

- **Auth:** jwt-required (none for zero variant)
- **Variant:** all
- **Content-Type:** `multipart/form-data`

**Form Fields:**

| Field         | Type    | Required | Notes                     |
|---------------|---------|----------|---------------------------|
| `file`        | binary  | yes      | Max 50 MB                 |
| `description` | string  | no       |                           |
| `category`    | string  | no       |                           |
| `isPublic`    | boolean | no       | Default: `false`          |

**Response:** `201 Created` — File object.

**Errors:**
- `400` — No file provided or file exceeds size limit

---

#### `GET /api/files/{id}`

Get file metadata.

- **Auth:** jwt-required (none for zero variant)
- **Variant:** all

**Response:** `200 OK` — File object.

---

#### `GET /api/files/{id}/download`

Download file content.

- **Auth:** none (public files accessible anonymously)
- **Variant:** all

**Response:** Binary file stream.

**Headers:**
```
Content-Type: application/pdf (varies)
Content-Disposition: attachment; filename="report.pdf"
```

**Errors:**
- `404` — File not found
- `403` — Private file, not authorized

---

#### `DELETE /api/files/{id}`

Delete a file.

- **Auth:** jwt-required (none for zero variant)
- **Variant:** all

**Response:** `204 No Content`

---

## Audit Logs

> **Variant:** all (full, minimal, zero) — read-only

#### `GET /api/audit-logs`

List audit log entries (paginated, filterable).

- **Auth:** admin-only (none for zero variant)
- **Variant:** all

**Query Parameters** (in addition to [standard pagination](#standard-pagination)):

| Parameter    | Type   | Description                                          |
|--------------|--------|------------------------------------------------------|
| `entityType` | string | Filter by entity (`User`, `Department`, `File`, etc.)|
| `entityId`   | string | Filter by specific entity ID                         |
| `userId`     | string | Filter by acting user ID                             |
| `action`     | string | Filter by action (`create`, `update`, `delete`, etc.)|
| `fromDate`   | string | ISO 8601 start date filter                           |
| `toDate`     | string | ISO 8601 end date filter                             |

**Response:** `200 OK` — Paginated list of AuditLog objects.

---

#### `GET /api/audit-logs/{id}`

Get a single audit log entry.

- **Auth:** admin-only (none for zero variant)
- **Variant:** all

**Response:** `200 OK` — AuditLog object.

---

## Export

> **Variant:** full, minimal (not zero)

All export endpoints return a binary file download. The response includes:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (xlsx)
              text/csv (csv)
              application/pdf (pdf)
Content-Disposition: attachment; filename="users_20260115.xlsx"
```

#### `GET /api/export/users`

- **Auth:** jwt-required
- **Variant:** full only

**Query Parameters:**

| Parameter      | Type    | Default | Values               |
|----------------|---------|---------|----------------------|
| `format`       | string  | `xlsx`  | `xlsx`, `csv`, `pdf` |
| `search`       | string  | —       | Filter text          |
| `isActive`     | boolean | —       | Filter active status |
| `departmentId` | integer | —       | Filter by department |

**Response:** File download.

---

#### `GET /api/export/departments`

- **Auth:** jwt-required
- **Variant:** full only

**Query Parameters:**

| Parameter  | Type    | Default | Values               |
|------------|---------|---------|----------------------|
| `format`   | string  | `xlsx`  | `xlsx`, `csv`, `pdf` |
| `search`   | string  | —       |                      |
| `isActive` | boolean | —       |                      |

**Response:** File download.

---

#### `GET /api/export/audit-logs`

- **Auth:** jwt-required
- **Variant:** full, minimal

**Query Parameters:**

| Parameter    | Type   | Default | Values               |
|--------------|--------|---------|----------------------|
| `format`     | string | `xlsx`  | `xlsx`, `csv`, `pdf` |
| `entityType` | string | —       |                      |
| `action`     | string | —       |                      |
| `fromDate`   | string | —       | ISO 8601             |
| `toDate`     | string | —       | ISO 8601             |

**Response:** File download.

---

#### `GET /api/export/notifications`

- **Auth:** jwt-required
- **Variant:** full, minimal

**Query Parameters:**

| Parameter | Type   | Default | Values               |
|-----------|--------|---------|----------------------|
| `format`  | string | `xlsx`  | `xlsx`, `csv`, `pdf` |

**Response:** File download.

---

## Health Checks

> **Variant:** all — no `/api` prefix

These endpoints do **not** use the standard response envelope. They return
plain JSON for compatibility with container orchestrators and load balancers.

#### `GET /health`

Basic health check.

- **Auth:** none
- **Variant:** all

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T09:30:00Z",
  "application": "AppTemplate API",
  "version": "1.0.0"
}
```

---

#### `GET /health/ready`

Readiness probe — checks database connectivity.

- **Auth:** none
- **Variant:** all

**Response:** `200 OK` or `503 Service Unavailable`
```json
{
  "status": "ready",
  "timestamp": "2026-01-15T09:30:00Z",
  "database": "connected"
}
```

---

#### `GET /health/live`

Liveness probe — confirms process is alive.

- **Auth:** none
- **Variant:** all

**Response:** `200 OK`
```json
{
  "status": "alive",
  "timestamp": "2026-01-15T09:30:00Z"
}
```

---

## Data Models

These are the **exact JSON shapes** returned by all backends. Field names are
**identical** across dotnet, spring, and nestjs.

### User

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "role": "admin",
  "departmentId": 1,
  "departmentName": "Engineering",
  "isActive": true,
  "lastLoginAt": "2026-01-15T09:30:00Z",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-10T12:00:00Z"
}
```

| Field            | Type             | Notes                                  |
|------------------|------------------|----------------------------------------|
| `id`             | integer          | Auto-increment primary key             |
| `username`       | string           | Unique                                 |
| `email`          | string           | Unique                                 |
| `firstName`      | string \| null   |                                        |
| `lastName`       | string \| null   |                                        |
| `fullName`       | string \| null   | Computed: `firstName + " " + lastName` |
| `role`           | string           | `admin` or `user`                      |
| `departmentId`   | integer \| null  | FK to departments                      |
| `departmentName` | string \| null   | Denormalized for convenience           |
| `isActive`       | boolean          |                                        |
| `lastLoginAt`    | string \| null   | ISO 8601                               |
| `createdAt`      | string           | ISO 8601                               |
| `updatedAt`      | string \| null   | ISO 8601                               |

---

### Department

```json
{
  "id": 1,
  "code": "ENG",
  "name": "Engineering",
  "description": "Software engineering team",
  "isActive": true,
  "userCount": 15,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-10T12:00:00Z"
}
```

| Field         | Type           | Notes                           |
|---------------|----------------|---------------------------------|
| `id`          | integer        |                                 |
| `code`        | string         | Unique short code               |
| `name`        | string         |                                 |
| `description` | string \| null |                                 |
| `isActive`    | boolean        |                                 |
| `userCount`   | integer        | Count of users in department    |
| `createdAt`   | string         | ISO 8601                        |
| `updatedAt`   | string \| null | ISO 8601                        |

---

### Notification

```json
{
  "id": 1,
  "title": "New user registered",
  "message": "John Doe has registered",
  "type": "info",
  "referenceId": "42",
  "referenceType": "User",
  "isRead": false,
  "createdAt": "2026-01-15T09:30:00Z"
}
```

| Field           | Type           | Notes                                   |
|-----------------|----------------|-----------------------------------------|
| `id`            | integer        |                                         |
| `title`         | string         |                                         |
| `message`       | string         |                                         |
| `type`          | string         | `info`, `warning`, `error`, `success`   |
| `referenceId`   | string \| null | Related entity ID (for deep linking)     |
| `referenceType` | string \| null | Related entity type                      |
| `isRead`        | boolean        |                                         |
| `createdAt`     | string         | ISO 8601                                |

---

### File

```json
{
  "id": 1,
  "fileName": "a1b2c3d4_report.pdf",
  "originalFileName": "quarterly-report.pdf",
  "contentType": "application/pdf",
  "fileSize": 1048576,
  "description": "Q1 2026 financial report",
  "category": "reports",
  "isPublic": false,
  "createdAt": "2026-01-15T09:30:00Z",
  "updatedAt": null,
  "createdBy": "1",
  "downloadUrl": "/api/files/1/download"
}
```

| Field              | Type           | Notes                            |
|--------------------|----------------|----------------------------------|
| `id`               | integer        |                                  |
| `fileName`         | string         | Server-generated unique name     |
| `originalFileName` | string         | User's original file name        |
| `contentType`      | string         | MIME type                        |
| `fileSize`         | integer        | Size in bytes                    |
| `description`      | string \| null |                                  |
| `category`         | string \| null |                                  |
| `isPublic`         | boolean        |                                  |
| `createdAt`        | string         | ISO 8601                         |
| `updatedAt`        | string \| null | ISO 8601                         |
| `createdBy`        | string \| null | User ID of uploader              |
| `downloadUrl`      | string         | Relative URL path                |

---

### AuditLog

```json
{
  "id": 1,
  "action": "create",
  "entityType": "User",
  "entityId": "42",
  "userId": "1",
  "userName": "John Doe",
  "details": "Created user jane@example.com",
  "ipAddress": "192.168.1.1",
  "createdAt": "2026-01-15T09:30:00Z"
}
```

| Field        | Type           | Notes                                             |
|--------------|----------------|----------------------------------------------------|
| `id`         | integer        |                                                    |
| `action`     | string         | `create`, `update`, `delete`, `login`, `logout`    |
| `entityType` | string         | `User`, `Department`, `File`, `Notification`       |
| `entityId`   | string \| null | ID of the affected entity                          |
| `userId`     | string \| null | ID of the acting user                              |
| `userName`   | string \| null | Name of the acting user (denormalized)             |
| `details`    | string \| null | Human-readable description of what happened        |
| `ipAddress`  | string \| null | Client IP address                                  |
| `createdAt`  | string         | ISO 8601                                           |

---

### Auth Response — Login / Register

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "dGhpcyBpcyBh...",
  "expiresIn": 900,
  "user": { "...User object (subset)" }
}
```

| Field          | Type           | Notes                              |
|----------------|----------------|------------------------------------|
| `accessToken`  | string         | JWT access token                   |
| `refreshToken` | string         | Opaque refresh token               |
| `expiresIn`    | integer        | Access token TTL in seconds        |
| `user`         | object         | User info (see below)              |

**User object in auth response** (subset — no timestamps):

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "role": "admin",
  "departmentId": 1,
  "departmentName": "Engineering",
  "isActive": true
}
```

### Auth Response — Token Refresh

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "bmV3IHJlZnJl...",
  "expiresIn": 900
}
```

No `user` object on refresh — the client already has user info.

---

## Real-time Events

Notifications are pushed to connected clients in real-time. The transport varies
by backend, but the **event payload** is identical.

### Transport by Backend

| Backend | Protocol            | Connection URL              | Subscribe Target              |
|---------|---------------------|-----------------------------|-------------------------------|
| dotnet  | SignalR             | `/hubs/notifications`       | Hub method: `ReceiveNotification` |
| spring  | WebSocket + STOMP   | `/ws`                       | `/user/queue/notifications`   |
| nestjs  | Socket.IO           | `/notifications` namespace  | Event: `notification`         |

### Event Payload — New Notification

```json
{
  "id": 1,
  "title": "New user registered",
  "message": "John Doe has registered",
  "type": "info",
  "referenceId": "42",
  "referenceType": "User",
  "isRead": false,
  "createdAt": "2026-01-15T09:30:00Z"
}
```

The payload matches the [Notification data model](#notification) exactly.

### Connection Authentication

| Backend | Auth Mechanism                                              |
|---------|-------------------------------------------------------------|
| dotnet  | `accessTokenFactory` option in `HubConnectionBuilder`       |
| spring  | `Authorization: Bearer {token}` header on STOMP CONNECT     |
| nestjs  | `auth: { token }` in Socket.IO handshake options            |

### Frontend Detection

Frontends select the transport using the `VITE_BACKEND_TYPE` environment variable:
- `dotnet` → SignalR client (`@microsoft/signalr`)
- `spring` → STOMP client (`@stomp/stompjs`)
- `nestjs` → Socket.IO client (`socket.io-client`)

---

## Endpoint Summary

Quick reference of all endpoints with auth and variant requirements.

| Method | Path                              | Auth          | Variant          |
|--------|-----------------------------------|---------------|------------------|
| POST   | `/api/auth/register`              | none          | full             |
| POST   | `/api/auth/login`                 | none          | full             |
| POST   | `/api/auth/refresh`               | none          | full             |
| POST   | `/api/auth/logout`                | jwt-required  | full             |
| GET    | `/api/auth/me`                    | jwt-required  | full, minimal    |
| GET    | `/api/auth/profile`               | jwt-required  | full, minimal    |
| PUT    | `/api/auth/profile`               | jwt-required  | full, minimal    |
| POST   | `/api/auth/change-password`       | jwt-required  | full             |
| POST   | `/api/auth/forgot-password`       | none          | full             |
| POST   | `/api/auth/reset-password`        | none          | full             |
| POST   | `/api/auth/validate-token`        | none          | minimal          |
| GET    | `/api/users`                      | jwt-required  | full             |
| POST   | `/api/users`                      | admin-only    | full             |
| GET    | `/api/users/{id}`                 | jwt-required  | full             |
| PUT    | `/api/users/{id}`                 | admin-only    | full             |
| DELETE | `/api/users/{id}`                 | admin-only    | full             |
| GET    | `/api/departments`                | jwt-required  | full             |
| POST   | `/api/departments`                | admin-only    | full             |
| GET    | `/api/departments/{id}`           | jwt-required  | full             |
| PUT    | `/api/departments/{id}`           | admin-only    | full             |
| DELETE | `/api/departments/{id}`           | admin-only    | full             |
| GET    | `/api/notifications`              | jwt-required  | all              |
| GET    | `/api/notifications/unread-count` | jwt-required  | all              |
| PUT    | `/api/notifications/{id}/read`    | jwt-required  | all              |
| PUT    | `/api/notifications/read-all`     | jwt-required  | all              |
| DELETE | `/api/notifications/{id}`         | jwt-required  | all              |
| GET    | `/api/files`                      | jwt-required  | all              |
| POST   | `/api/files`                      | jwt-required  | all              |
| GET    | `/api/files/{id}`                 | jwt-required  | all              |
| GET    | `/api/files/{id}/download`        | none          | all              |
| DELETE | `/api/files/{id}`                 | jwt-required  | all              |
| GET    | `/api/audit-logs`                 | admin-only    | all              |
| GET    | `/api/audit-logs/{id}`            | admin-only    | all              |
| GET    | `/api/export/users`               | jwt-required  | full             |
| GET    | `/api/export/departments`         | jwt-required  | full             |
| GET    | `/api/export/audit-logs`          | jwt-required  | full, minimal    |
| GET    | `/api/export/notifications`       | jwt-required  | full, minimal    |
| GET    | `/health`                         | none          | all              |
| GET    | `/health/ready`                   | none          | all              |
| GET    | `/health/live`                    | none          | all              |

---

## JWT Token Structure

The JWT payload must include these standard claims:

```json
{
  "sub": "1",
  "email": "john@example.com",
  "username": "johndoe",
  "role": "admin",
  "departmentId": "1",
  "departmentName": "Engineering",
  "iat": 1737000000,
  "exp": 1737000900
}
```

| Claim            | Type   | Notes                                |
|------------------|--------|--------------------------------------|
| `sub`            | string | User ID (as string)                  |
| `email`          | string |                                      |
| `username`       | string |                                      |
| `role`           | string | `admin` or `user`                    |
| `departmentId`   | string | Nullable                             |
| `departmentName` | string | Nullable                             |
| `iat`            | number | Issued at (Unix timestamp)           |
| `exp`            | number | Expiration (Unix timestamp)          |

---

## Request Headers

All authenticated requests must include:

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

File uploads use:
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

Export downloads should set:
```
Authorization: Bearer {accessToken}
Accept: application/octet-stream
```

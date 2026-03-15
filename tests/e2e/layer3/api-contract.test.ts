/**
 * Layer 3 — API Contract Tests
 *
 * Starts actual backend servers and validates API contract compliance
 * against live HTTP endpoints with a real PostgreSQL test database.
 *
 * Prerequisites:
 *   ./scripts/test-db.sh start   (PostgreSQL on port 5433)
 *
 * Run:
 *   npm run test:e2e:contract
 *
 * Environment:
 *   LAYER3_ALL=1   Test all 18 backend combinations (default: 3, one per stack)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ensureTestDb, resetTestDb, isTestDbRunning } from '../config/test-db.js';
import {
  getContractTargets,
  getBaseUrl,
  HAS_REGISTER,
  type BackendTarget,
} from '../config/backend-config.js';
import {
  startServer,
  waitForHealth,
  waitForPostStartup,
  loginAsAdmin,
  stopServer,
  killPort,
  waitForPortFree,
  setupProcessCleanup,
  unwrapHealth,
  type ServerHandle,
} from '../helpers/server.js';
import {
  httpGet,
  httpPost,
  httpPut,
  httpDelete,
  httpPostMultipart,
  authHeader,
} from '../helpers/http-client.js';
import {
  validateApiResponse,
  validatePaginatedResponse,
  validateErrorResponse,
  validateCamelCase,
  validateIsoDate,
  validateNumericId,
} from '../helpers/contract.js';

// ─── Setup ──────────────────────────────────────────────────────────────────

setupProcessCleanup();

const targets = getContractTargets();
const BASE_URL = getBaseUrl();

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('API Contract Tests', () => {
  beforeAll(() => {
    if (!isTestDbRunning()) {
      ensureTestDb();
    }
  });

  for (const target of targets) {
    const label = `${target.stack}/${target.arch}/${target.variant}`;

    describe(`API Contract: ${label}`, () => {
      let server: ServerHandle;
      let accessToken: string;
      let refreshToken: string;
      const isFull = target.variant === 'full';

      beforeAll(async () => {
        // Kill anything on port from previous run and wait for release
        killPort(5100);
        await waitForPortFree(5100);

        // Reset DB so migrations run fresh
        resetTestDb();

        // Start the backend
        server = startServer(target);

        // Wait for process to not die immediately
        await new Promise((r) => setTimeout(r, 2000));
        if (server.process.exitCode !== null) {
          throw new Error(`Backend exited immediately with code ${server.process.exitCode}`);
        }

        // Wait for health (180s default, pre-build already compiled)
        const healthy = await waitForHealth(BASE_URL);
        if (!healthy) {
          const logs = server.serverOutput?.slice(-20).join('') || '';
          throw new Error(`Health check timed out for ${label}\n--- Server output ---\n${logs}`);
        }

        // Wait for post-startup tasks (seeding)
        await waitForPostStartup(target.stack);

        // Login (full variant has internal auth)
        if (isFull) {
          const tokens = await loginAsAdmin(BASE_URL, server);
          accessToken = tokens.accessToken;
          refreshToken = tokens.refreshToken;
        }
      }, 600_000); // 10 min: pre-build + startup + health check

      afterAll(async () => {
        if (server) {
          await stopServer(server);
        }
      }, 30_000);

      // ─── Health Endpoints ───────────────────────────────────────────

      describe('Health endpoints', () => {
        it('GET /health returns 200 with status "healthy" or "ok"', async () => {
          const res = await httpGet(`${BASE_URL}/health`);
          expect(res.status).toBe(200);

          const health = unwrapHealth(res.body);
          const status = health?.status?.toLowerCase();
          expect(['healthy', 'ok']).toContain(status);
          expect(health).toHaveProperty('timestamp');
          expect(validateIsoDate(health.timestamp, 'timestamp')).toHaveLength(0);
        });

        it('GET /health/ready returns 200 with database "connected"', async () => {
          const res = await httpGet(`${BASE_URL}/health/ready`);
          expect(res.status).toBe(200);

          const health = unwrapHealth(res.body);
          expect(health?.status?.toLowerCase()).toBe('ready');
          expect(health?.database?.toLowerCase()).toBe('connected');
        });

        it('GET /health/live returns 200 with status "alive"', async () => {
          const res = await httpGet(`${BASE_URL}/health/live`);
          expect(res.status).toBe(200);

          const health = unwrapHealth(res.body);
          expect(health?.status?.toLowerCase()).toBe('alive');
        });
      });

      // ─── Response Envelope ──────────────────────────────────────────

      describe('Response envelope', () => {
        it('success response has { success: true, message, data }', async () => {
          if (!isFull) return;
          const res = await httpGet(
            `${BASE_URL}/api/notifications?page=1&pageSize=10`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          const errors = validateApiResponse(res.body, true);
          expect(errors).toHaveLength(0);
          expect(res.body.success).toBe(true);
        });

        it('paginated response has { data: [], pagination: { page, pageSize, totalItems, totalPages } }', async () => {
          if (!isFull) return;
          const res = await httpGet(
            `${BASE_URL}/api/notifications?page=1&pageSize=10`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          const errors = validatePaginatedResponse(res.body);
          expect(errors).toHaveLength(0);

          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.pagination).toHaveProperty('page');
          expect(res.body.pagination).toHaveProperty('pageSize');
          expect(res.body.pagination).toHaveProperty('totalItems');
          expect(res.body.pagination).toHaveProperty('totalPages');
          expect(res.body.pagination).toHaveProperty('hasNext');
          expect(res.body.pagination).toHaveProperty('hasPrevious');
        });

        it('error response has { success: false, message }', async () => {
          const res = await httpPost(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            email: 'admin@apptemplate.com',
            password: 'WrongPassword123',
          });

          expect(res.status).not.toBe(200);
          expect(res.body?.success).toBe(false);
          expect(typeof res.body?.message).toBe('string');
        });
      });

      // ─── Naming Conventions ─────────────────────────────────────────

      describe('Naming conventions', () => {
        it('user fields are camelCase', async () => {
          if (!isFull) return;
          const res = await httpGet(
            `${BASE_URL}/api/auth/me`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          const data = res.body?.data;
          expect(data).toBeDefined();

          const errors = validateCamelCase(data, 'data');
          expect(errors).toHaveLength(0);

          // Spot-check camelCase fields
          expect(data).toHaveProperty('firstName');
          expect(data).toHaveProperty('lastName');
          expect(data).toHaveProperty('createdAt');

          // Ensure no snake_case keys
          const keys = Object.keys(data);
          for (const key of keys) {
            expect(key).not.toMatch(/_[a-z]/);
          }
        });

        it('notification fields are camelCase', async () => {
          if (!isFull) return;
          const res = await httpGet(
            `${BASE_URL}/api/notifications?page=1&pageSize=10`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          if (Array.isArray(res.body.data) && res.body.data.length > 0) {
            const notification = res.body.data[0];
            const errors = validateCamelCase(notification, 'notification');
            expect(errors).toHaveLength(0);
          }
        });

        it('date fields use ISO 8601 format', async () => {
          if (!isFull) return;
          const res = await httpGet(
            `${BASE_URL}/api/auth/me`,
            authHeader(accessToken),
          );
          const data = res.body?.data;
          if (data?.createdAt) {
            const errors = validateIsoDate(data.createdAt, 'createdAt');
            expect(errors).toHaveLength(0);
          }
          if (data?.updatedAt) {
            const errors = validateIsoDate(data.updatedAt, 'updatedAt');
            expect(errors).toHaveLength(0);
          }
        });

        it('IDs are integers, not UUIDs', async () => {
          if (!isFull) return;
          const res = await httpGet(
            `${BASE_URL}/api/auth/me`,
            authHeader(accessToken),
          );
          const data = res.body?.data;
          expect(data).toBeDefined();

          const errors = validateNumericId(data.id, 'user.id');
          expect(errors).toHaveLength(0);
        });
      });

      // ─── Authentication ─────────────────────────────────────────────

      describe('Authentication (full variant)', () => {
        it('POST /api/auth/login accepts valid credentials', async () => {
          if (!isFull) return;
          const res = await httpPost(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            email: 'admin@apptemplate.com',
            password: 'Admin@123',
          });
          expect(res.status).toBe(200);

          const errors = validateApiResponse(res.body, true);
          expect(errors).toHaveLength(0);

          const data = res.body.data;
          expect(typeof data.accessToken).toBe('string');
          expect(typeof data.refreshToken).toBe('string');
          expect(typeof data.expiresIn).toBe('number');

          // Validate embedded user
          expect(data.user).toBeDefined();
          expect(validateNumericId(data.user.id, 'user.id')).toHaveLength(0);
          expect(typeof data.user.email).toBe('string');
          expect(typeof data.user.username).toBe('string');
          expect(typeof data.user.role).toBe('string');
          expect(validateCamelCase(data.user, 'user')).toHaveLength(0);
        });

        it('POST /api/auth/login rejects invalid credentials', async () => {
          if (!isFull) return;
          const res = await httpPost(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            email: 'admin@apptemplate.com',
            password: 'WrongPassword123',
          });
          expect(res.status).not.toBe(200);
          expect(res.body?.success).toBe(false);
        });

        it('POST /api/auth/refresh refreshes a valid token', async () => {
          if (!isFull || !refreshToken) return;
          const res = await httpPost(`${BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });
          expect(res.status).toBe(200);

          const errors = validateApiResponse(res.body, true);
          expect(errors).toHaveLength(0);

          const data = res.body.data;
          expect(typeof data.accessToken).toBe('string');
          expect(typeof data.refreshToken).toBe('string');
          expect(typeof data.expiresIn).toBe('number');

          // Update tokens for subsequent tests
          accessToken = data.accessToken;
          refreshToken = data.refreshToken;
        });

        it('POST /api/auth/logout returns 200 or 204', async () => {
          if (!isFull || !accessToken) return;

          // First get fresh tokens (don't invalidate the main ones)
          const loginRes = await httpPost(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            email: 'admin@apptemplate.com',
            password: 'Admin@123',
          });
          const tempToken = loginRes.body?.data?.accessToken;
          const tempRefresh = loginRes.body?.data?.refreshToken;
          if (!tempToken) return;

          const res = await httpPost(
            `${BASE_URL}/api/auth/logout`,
            tempRefresh ? { refreshToken: tempRefresh } : undefined,
            authHeader(tempToken),
          );
          expect([200, 204]).toContain(res.status);
        });

        it('GET /api/auth/me returns current user', async () => {
          if (!isFull || !accessToken) return;
          const res = await httpGet(
            `${BASE_URL}/api/auth/me`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          const errors = validateApiResponse(res.body, true);
          expect(errors).toHaveLength(0);
          expect(validateCamelCase(res.body.data, 'data')).toHaveLength(0);
        });

        it('GET /api/auth/profile returns full user', async () => {
          if (!isFull || !accessToken) return;
          const res = await httpGet(
            `${BASE_URL}/api/auth/profile`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          const errors = validateApiResponse(res.body, true);
          expect(errors).toHaveLength(0);
        });
      });

      // ─── Register ───────────────────────────────────────────────────

      describe('Registration (where available)', () => {
        it('POST /api/auth/register creates a new user', async () => {
          if (!isFull) return;
          const key = `${target.stack}/${target.arch}`;
          if (!HAS_REGISTER[key]) return;

          const ts = Date.now();
          const res = await httpPost(`${BASE_URL}/api/auth/register`, {
            username: `testuser_${ts}`,
            email: `testuser_${ts}@apptemplate.com`,
            password: 'TestPass@123',
            firstName: 'Test',
            lastName: 'User',
          });

          expect([200, 201]).toContain(res.status);

          const errors = validateApiResponse(res.body, true);
          expect(errors).toHaveLength(0);

          const data = res.body.data;
          // Register may return tokens or just user data
          const hasTokens = typeof data.accessToken === 'string';
          const hasUser = typeof data.id === 'number' || typeof data.user?.id === 'number';
          expect(hasTokens || hasUser).toBe(true);
          expect(validateCamelCase(data, 'data')).toHaveLength(0);
        });
      });

      // ─── User Management ────────────────────────────────────────────

      describe('User management (full variant)', () => {
        it('GET /api/users returns paginated list', async () => {
          if (!isFull || !accessToken) return;
          const res = await httpGet(
            `${BASE_URL}/api/users?page=1&pageSize=10`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          const errors = validatePaginatedResponse(res.body);
          expect(errors).toHaveLength(0);

          // Validate items if present
          if (Array.isArray(res.body.data) && res.body.data.length > 0) {
            const user = res.body.data[0];
            expect(validateNumericId(user.id, 'user.id')).toHaveLength(0);
            expect(typeof user.email).toBe('string');
            expect(validateCamelCase(user, 'user')).toHaveLength(0);
          }
        });

        it('GET /api/users/{id} returns single user', async () => {
          if (!isFull || !accessToken) return;

          // Get first user ID from list
          const listRes = await httpGet(
            `${BASE_URL}/api/users?page=1&pageSize=1`,
            authHeader(accessToken),
          );
          if (!Array.isArray(listRes.body?.data) || listRes.body.data.length === 0) return;

          const userId = listRes.body.data[0].id;
          const res = await httpGet(
            `${BASE_URL}/api/users/${userId}`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          const errors = validateApiResponse(res.body, true);
          expect(errors).toHaveLength(0);
          expect(validateCamelCase(res.body.data, 'data')).toHaveLength(0);
        });
      });

      // ─── Department Management ──────────────────────────────────────

      describe('Department management (full variant)', () => {
        it('GET /api/departments returns paginated list', async () => {
          if (!isFull || !accessToken) return;
          const res = await httpGet(
            `${BASE_URL}/api/departments?page=1&pageSize=10`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          const errors = validatePaginatedResponse(res.body);
          expect(errors).toHaveLength(0);
        });
      });

      // ─── Notifications ──────────────────────────────────────────────

      describe('Notifications', () => {
        it('GET /api/notifications returns paginated list', async () => {
          if (!isFull || !accessToken) return;
          const res = await httpGet(
            `${BASE_URL}/api/notifications?page=1&pageSize=10`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          const errors = validatePaginatedResponse(res.body);
          expect(errors).toHaveLength(0);

          // Validate item fields if any
          if (Array.isArray(res.body.data) && res.body.data.length > 0) {
            const item = res.body.data[0];
            expect(validateNumericId(item.id, 'notification.id')).toHaveLength(0);
            expect(typeof item.title).toBe('string');
            expect(typeof item.message).toBe('string');
            expect(typeof item.type).toBe('string');
            expect(typeof item.isRead).toBe('boolean');
            expect(validateIsoDate(item.createdAt, 'notification.createdAt')).toHaveLength(0);
            expect(validateCamelCase(item, 'notification')).toHaveLength(0);
          }
        });

        it('GET /api/notifications/unread-count returns count', async () => {
          if (!isFull || !accessToken) return;
          const res = await httpGet(
            `${BASE_URL}/api/notifications/unread-count`,
            authHeader(accessToken),
          );

          // Endpoint may or may not exist in all archs
          if (res.status === 404) return;

          expect(res.status).toBe(200);
          // Count can be wrapped differently per stack
          const count = res.body?.data?.count ?? res.body?.count ?? res.body?.data;
          expect(typeof count).toBe('number');
        });
      });

      // ─── File Management ────────────────────────────────────────────

      describe('File management', () => {
        let uploadedFileId: number | null = null;

        it('POST /api/files uploads a file (multipart)', async () => {
          if (!isFull || !accessToken) return;

          const formData = new FormData();
          const fileContent = new Blob(['integration test file content'], {
            type: 'text/plain',
          });
          formData.append('file', fileContent, 'test-file.txt');
          formData.append('description', 'Integration test upload');
          formData.append('category', 'test');
          formData.append('isPublic', 'false');

          const res = await httpPostMultipart(
            `${BASE_URL}/api/files`,
            formData,
            authHeader(accessToken),
          );

          expect([200, 201]).toContain(res.status);

          const errors = validateApiResponse(res.body, true);
          expect(errors).toHaveLength(0);

          const data = res.body.data;
          expect(validateNumericId(data.id, 'file.id')).toHaveLength(0);
          expect(typeof data.originalFileName).toBe('string');
          expect(typeof data.contentType).toBe('string');
          expect(typeof data.fileSize).toBe('number');
          expect(validateIsoDate(data.createdAt, 'file.createdAt')).toHaveLength(0);
          expect(validateCamelCase(data, 'file')).toHaveLength(0);

          if (typeof data.id === 'number') uploadedFileId = data.id;
        });

        it('GET /api/files returns paginated list', async () => {
          if (!isFull || !accessToken) return;
          const res = await httpGet(
            `${BASE_URL}/api/files?page=1&pageSize=10`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          const errors = validatePaginatedResponse(res.body);
          expect(errors).toHaveLength(0);
        });

        it('GET /api/files/{id} returns file metadata', async () => {
          if (!isFull || !accessToken || !uploadedFileId) return;
          const res = await httpGet(
            `${BASE_URL}/api/files/${uploadedFileId}`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          const errors = validateApiResponse(res.body, true);
          expect(errors).toHaveLength(0);
          expect(validateCamelCase(res.body.data, 'file')).toHaveLength(0);
        });

        it('GET /api/files/{id}/download returns binary', async () => {
          if (!isFull || !accessToken || !uploadedFileId) return;
          const res = await httpGet(
            `${BASE_URL}/api/files/${uploadedFileId}/download`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);
        });

        it('DELETE /api/files/{id} removes file', async () => {
          if (!isFull || !accessToken || !uploadedFileId) return;
          const res = await httpDelete(
            `${BASE_URL}/api/files/${uploadedFileId}`,
            authHeader(accessToken),
          );
          expect([200, 204]).toContain(res.status);

          // Verify it's gone
          const checkRes = await httpGet(
            `${BASE_URL}/api/files/${uploadedFileId}`,
            authHeader(accessToken),
          );
          expect(checkRes.status).toBe(404);
        });
      });

      // ─── Audit Logs ─────────────────────────────────────────────────

      describe('Audit logs', () => {
        it('GET /api/audit-logs returns paginated list', async () => {
          if (!isFull || !accessToken) return;
          const res = await httpGet(
            `${BASE_URL}/api/audit-logs?page=1&pageSize=10`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          const errors = validatePaginatedResponse(res.body);
          expect(errors).toHaveLength(0);

          // Validate item fields if any
          if (Array.isArray(res.body.data) && res.body.data.length > 0) {
            const item = res.body.data[0];
            expect(validateNumericId(item.id, 'auditLog.id')).toHaveLength(0);
            expect(typeof item.action).toBe('string');
            expect(typeof item.entityType).toBe('string');
            expect(validateIsoDate(item.createdAt, 'auditLog.createdAt')).toHaveLength(0);
            expect(validateCamelCase(item, 'auditLog')).toHaveLength(0);
          }
        });

        it('GET /api/audit-logs without auth returns 401', async () => {
          if (!isFull) return;
          const res = await httpGet(`${BASE_URL}/api/audit-logs?page=1&pageSize=10`);
          expect(res.status).toBe(401);
        });
      });

      // ─── Export ─────────────────────────────────────────────────────

      describe('Export', () => {
        it('GET /api/export/audit-logs?format=xlsx returns file', async () => {
          if (!isFull || !accessToken) return;
          const res = await httpGet(
            `${BASE_URL}/api/export/audit-logs?format=xlsx`,
            authHeader(accessToken),
          );
          // Export might return 200 (file) or 204 (no data)
          expect([200, 204]).toContain(res.status);
        });
      });

      // ─── Pagination Parameters ──────────────────────────────────────

      describe('Pagination parameters', () => {
        it('accepts page, pageSize, sortBy, sortOrder', async () => {
          if (!isFull || !accessToken) return;
          const res = await httpGet(
            `${BASE_URL}/api/notifications?page=1&pageSize=5&sortBy=createdAt&sortOrder=desc`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);

          const errors = validatePaginatedResponse(res.body);
          expect(errors).toHaveLength(0);
          expect(res.body.pagination.pageSize).toBe(5);
        });
      });

      // ─── Required Endpoints Existence ───────────────────────────────

      describe('Required endpoints exist', () => {
        it('GET /health returns non-404', async () => {
          const res = await httpGet(`${BASE_URL}/health`);
          expect(res.status).not.toBe(404);
        });

        it('GET /health/ready returns non-404', async () => {
          const res = await httpGet(`${BASE_URL}/health/ready`);
          expect(res.status).not.toBe(404);
        });

        it('GET /health/live returns non-404', async () => {
          const res = await httpGet(`${BASE_URL}/health/live`);
          expect(res.status).not.toBe(404);
        });

        it('POST /api/auth/login returns 200 or 401', async () => {
          if (!isFull) return;
          const res = await httpPost(`${BASE_URL}/api/auth/login`, {
            email: 'test@test.com',
            password: 'test',
          });
          expect([200, 400, 401, 403]).toContain(res.status);
        });

        it('GET /api/auth/me returns 200 or 401', async () => {
          if (!isFull) return;
          const res = await httpGet(
            `${BASE_URL}/api/auth/me`,
            accessToken ? authHeader(accessToken) : undefined,
          );
          expect([200, 401]).toContain(res.status);
        });

        it('GET /api/notifications returns 200 or 401', async () => {
          if (!isFull) return;
          const res = await httpGet(
            `${BASE_URL}/api/notifications`,
            accessToken ? authHeader(accessToken) : undefined,
          );
          expect([200, 401]).toContain(res.status);
        });

        it('GET /api/files returns 200 or 401', async () => {
          if (!isFull) return;
          const res = await httpGet(
            `${BASE_URL}/api/files`,
            accessToken ? authHeader(accessToken) : undefined,
          );
          expect([200, 401]).toContain(res.status);
        });

        it('GET /api/audit-logs returns 200 or 401', async () => {
          if (!isFull) return;
          const res = await httpGet(
            `${BASE_URL}/api/audit-logs`,
            accessToken ? authHeader(accessToken) : undefined,
          );
          expect([200, 401, 403]).toContain(res.status);
        });

        it('GET /api/users returns 200 (full only)', async () => {
          if (!isFull || !accessToken) return;
          const res = await httpGet(
            `${BASE_URL}/api/users`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);
        });

        it('GET /api/departments returns 200 (full only)', async () => {
          if (!isFull || !accessToken) return;
          const res = await httpGet(
            `${BASE_URL}/api/departments`,
            authHeader(accessToken),
          );
          expect(res.status).toBe(200);
        });
      });
    });
  }
});

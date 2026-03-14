/**
 * Layer 3 — Cross-Stack Response Parity Tests
 *
 * Starts all 3 backends (dotnet, spring, nestjs) sequentially,
 * captures responses from the same endpoints, then compares
 * response STRUCTURE (keys, types) across stacks.
 *
 * Prerequisites:
 *   ./scripts/test-db.sh start   (PostgreSQL on port 5433)
 *
 * Run:
 *   npm run test:e2e:contract
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ensureTestDb, resetTestDb, isTestDbRunning } from '../config/test-db.js';
import {
  getBaseUrl,
  type BackendTarget,
  type Stack,
} from '../config/backend-config.js';
import {
  startServer,
  waitForHealth,
  waitForPostStartup,
  loginAsAdmin,
  stopServer,
  killPort,
  setupProcessCleanup,
  unwrapHealth,
} from '../helpers/server.js';
import {
  httpGet,
  httpPost,
  httpPostMultipart,
  authHeader,
} from '../helpers/http-client.js';

// ─── Setup ──────────────────────────────────────────────────────────────────

setupProcessCleanup();

const BASE_URL = getBaseUrl();

const STACKS: Stack[] = ['dotnet', 'spring', 'nestjs'];

interface CapturedResponses {
  health: any;
  healthReady: any;
  healthLive: any;
  login: any;
  me: any;
  notifications: any;
  files: any;
  auditLogs: any;
  users: any;
  departments: any;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Extract sorted keys from an object, or from the first array item.
 */
function getKeys(value: any): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.length > 0 && typeof value[0] === 'object'
      ? Object.keys(value[0]).sort()
      : [];
  }
  if (typeof value === 'object') {
    return Object.keys(value).sort();
  }
  return [];
}

/**
 * Report which keys are missing across stacks.
 */
function describeKeyDiff(
  stackA: string, keysA: string[],
  stackB: string, keysB: string[],
): string {
  const setA = new Set(keysA);
  const setB = new Set(keysB);
  const onlyA = keysA.filter((k) => !setB.has(k));
  const onlyB = keysB.filter((k) => !setA.has(k));
  const parts: string[] = [];
  if (onlyA.length > 0) parts.push(`only in ${stackA}: [${onlyA.join(', ')}]`);
  if (onlyB.length > 0) parts.push(`only in ${stackB}: [${onlyB.join(', ')}]`);
  return parts.join('; ');
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Cross-stack response parity', () => {
  const captures: Record<string, CapturedResponses> = {};
  let captureError: string | null = null;

  beforeAll(async () => {
    if (!isTestDbRunning()) {
      ensureTestDb();
    }

    for (const stack of STACKS) {
      const target: BackendTarget = {
        stack,
        arch: 'clean',
        variant: 'full',
      };

      killPort(5100);
      resetTestDb();

      let server;
      try {
        server = startServer(target);

        // Wait for process to not die immediately
        await new Promise((r) => setTimeout(r, 2000));
        if (server.process.exitCode !== null) {
          captureError = `${stack} exited immediately with code ${server.process.exitCode}`;
          continue;
        }

        const healthy = await waitForHealth(BASE_URL, 120);
        if (!healthy) {
          captureError = `${stack} health check timed out`;
          await stopServer(server);
          continue;
        }

        await waitForPostStartup(stack);

        // Login
        const { accessToken } = await loginAsAdmin(BASE_URL);
        const headers = authHeader(accessToken);

        // Capture responses
        const [
          healthRes,
          healthReadyRes,
          healthLiveRes,
          loginRes,
          meRes,
          notifRes,
          filesRes,
          auditRes,
          usersRes,
          deptsRes,
        ] = await Promise.all([
          httpGet(`${BASE_URL}/health`),
          httpGet(`${BASE_URL}/health/ready`),
          httpGet(`${BASE_URL}/health/live`),
          httpPost(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            email: 'admin@apptemplate.com',
            password: 'Admin@123',
          }),
          httpGet(`${BASE_URL}/api/auth/me`, headers),
          httpGet(`${BASE_URL}/api/notifications?page=1&pageSize=10`, headers),
          httpGet(`${BASE_URL}/api/files?page=1&pageSize=10`, headers),
          httpGet(`${BASE_URL}/api/audit-logs?page=1&pageSize=10`, headers),
          httpGet(`${BASE_URL}/api/users?page=1&pageSize=10`, headers),
          httpGet(`${BASE_URL}/api/departments?page=1&pageSize=10`, headers),
        ]);

        captures[stack] = {
          health: unwrapHealth(healthRes.body),
          healthReady: unwrapHealth(healthReadyRes.body),
          healthLive: unwrapHealth(healthLiveRes.body),
          login: loginRes.body,
          me: meRes.body,
          notifications: notifRes.body,
          files: filesRes.body,
          auditLogs: auditRes.body,
          users: usersRes.body,
          departments: deptsRes.body,
        };

        await stopServer(server);
      } catch (e: any) {
        captureError = `${stack}: ${e.message}`;
        if (server) await stopServer(server);
      }
    }
  }, 600_000); // 10 min for all 3 stacks

  afterAll(() => {
    killPort(5100);
  });

  // ─── Structure Comparison Tests ───────────────────────────────────

  describe('Response structure comparison', () => {
    function ensureAllCaptured(): boolean {
      if (captureError) return false;
      for (const stack of STACKS) {
        if (!captures[stack]) return false;
      }
      return true;
    }

    it('all 3 backends responded successfully', () => {
      if (captureError) {
        throw new Error(`Backend capture failed: ${captureError}`);
      }
      for (const stack of STACKS) {
        expect(captures[stack], `Missing captures for ${stack}`).toBeDefined();
      }
    });

    it('POST /api/auth/login returns same top-level keys across all stacks', () => {
      if (!ensureAllCaptured()) return;

      const dotnetKeys = getKeys(captures.dotnet.login);
      const springKeys = getKeys(captures.spring.login);
      const nestjsKeys = getKeys(captures.nestjs.login);

      expect(
        dotnetKeys,
        describeKeyDiff('dotnet', dotnetKeys, 'spring', springKeys),
      ).toEqual(springKeys);
      expect(
        springKeys,
        describeKeyDiff('spring', springKeys, 'nestjs', nestjsKeys),
      ).toEqual(nestjsKeys);
    });

    it('POST /api/auth/login data.user has same keys across all stacks', () => {
      if (!ensureAllCaptured()) return;

      const dotnetKeys = getKeys(captures.dotnet.login?.data?.user);
      const springKeys = getKeys(captures.spring.login?.data?.user);
      const nestjsKeys = getKeys(captures.nestjs.login?.data?.user);

      expect(
        dotnetKeys,
        describeKeyDiff('dotnet', dotnetKeys, 'spring', springKeys),
      ).toEqual(springKeys);
      expect(
        springKeys,
        describeKeyDiff('spring', springKeys, 'nestjs', nestjsKeys),
      ).toEqual(nestjsKeys);
    });

    it('GET /api/auth/me data has same keys across all stacks', () => {
      if (!ensureAllCaptured()) return;

      const dotnetKeys = getKeys(captures.dotnet.me?.data);
      const springKeys = getKeys(captures.spring.me?.data);
      const nestjsKeys = getKeys(captures.nestjs.me?.data);

      expect(
        dotnetKeys,
        describeKeyDiff('dotnet', dotnetKeys, 'spring', springKeys),
      ).toEqual(springKeys);
      expect(
        springKeys,
        describeKeyDiff('spring', springKeys, 'nestjs', nestjsKeys),
      ).toEqual(nestjsKeys);
    });

    it('GET /api/notifications pagination has same keys across all stacks', () => {
      if (!ensureAllCaptured()) return;

      const dotnetKeys = getKeys(captures.dotnet.notifications?.pagination);
      const springKeys = getKeys(captures.spring.notifications?.pagination);
      const nestjsKeys = getKeys(captures.nestjs.notifications?.pagination);

      expect(
        dotnetKeys,
        describeKeyDiff('dotnet', dotnetKeys, 'spring', springKeys),
      ).toEqual(springKeys);
      expect(
        springKeys,
        describeKeyDiff('spring', springKeys, 'nestjs', nestjsKeys),
      ).toEqual(nestjsKeys);
    });

    it('GET /api/notifications data items have same keys across all stacks', () => {
      if (!ensureAllCaptured()) return;

      // Notifications may be empty — compare item shape only if data exists
      const dotnetKeys = getKeys(captures.dotnet.notifications?.data);
      const springKeys = getKeys(captures.spring.notifications?.data);
      const nestjsKeys = getKeys(captures.nestjs.notifications?.data);

      // Skip if all empty
      if (dotnetKeys.length === 0 && springKeys.length === 0 && nestjsKeys.length === 0) return;

      if (dotnetKeys.length > 0 && springKeys.length > 0) {
        expect(
          dotnetKeys,
          describeKeyDiff('dotnet', dotnetKeys, 'spring', springKeys),
        ).toEqual(springKeys);
      }
      if (springKeys.length > 0 && nestjsKeys.length > 0) {
        expect(
          springKeys,
          describeKeyDiff('spring', springKeys, 'nestjs', nestjsKeys),
        ).toEqual(nestjsKeys);
      }
    });

    it('GET /api/files data items have same keys across all stacks', () => {
      if (!ensureAllCaptured()) return;

      const dotnetKeys = getKeys(captures.dotnet.files?.data);
      const springKeys = getKeys(captures.spring.files?.data);
      const nestjsKeys = getKeys(captures.nestjs.files?.data);

      if (dotnetKeys.length === 0 && springKeys.length === 0 && nestjsKeys.length === 0) return;

      if (dotnetKeys.length > 0 && springKeys.length > 0) {
        expect(
          dotnetKeys,
          describeKeyDiff('dotnet', dotnetKeys, 'spring', springKeys),
        ).toEqual(springKeys);
      }
      if (springKeys.length > 0 && nestjsKeys.length > 0) {
        expect(
          springKeys,
          describeKeyDiff('spring', springKeys, 'nestjs', nestjsKeys),
        ).toEqual(nestjsKeys);
      }
    });

    it('GET /api/audit-logs data items have same keys across all stacks', () => {
      if (!ensureAllCaptured()) return;

      const dotnetKeys = getKeys(captures.dotnet.auditLogs?.data);
      const springKeys = getKeys(captures.spring.auditLogs?.data);
      const nestjsKeys = getKeys(captures.nestjs.auditLogs?.data);

      if (dotnetKeys.length === 0 && springKeys.length === 0 && nestjsKeys.length === 0) return;

      if (dotnetKeys.length > 0 && springKeys.length > 0) {
        expect(
          dotnetKeys,
          describeKeyDiff('dotnet', dotnetKeys, 'spring', springKeys),
        ).toEqual(springKeys);
      }
      if (springKeys.length > 0 && nestjsKeys.length > 0) {
        expect(
          springKeys,
          describeKeyDiff('spring', springKeys, 'nestjs', nestjsKeys),
        ).toEqual(nestjsKeys);
      }
    });

    it('GET /api/users data items have same keys across all stacks', () => {
      if (!ensureAllCaptured()) return;

      const dotnetKeys = getKeys(captures.dotnet.users?.data);
      const springKeys = getKeys(captures.spring.users?.data);
      const nestjsKeys = getKeys(captures.nestjs.users?.data);

      expect(
        dotnetKeys,
        describeKeyDiff('dotnet', dotnetKeys, 'spring', springKeys),
      ).toEqual(springKeys);
      expect(
        springKeys,
        describeKeyDiff('spring', springKeys, 'nestjs', nestjsKeys),
      ).toEqual(nestjsKeys);
    });

    it('GET /api/departments data items have same keys across all stacks', () => {
      if (!ensureAllCaptured()) return;

      const dotnetKeys = getKeys(captures.dotnet.departments?.data);
      const springKeys = getKeys(captures.spring.departments?.data);
      const nestjsKeys = getKeys(captures.nestjs.departments?.data);

      expect(
        dotnetKeys,
        describeKeyDiff('dotnet', dotnetKeys, 'spring', springKeys),
      ).toEqual(springKeys);
      expect(
        springKeys,
        describeKeyDiff('spring', springKeys, 'nestjs', nestjsKeys),
      ).toEqual(nestjsKeys);
    });

    it('GET /health returns same status field names across all stacks', () => {
      if (!ensureAllCaptured()) return;

      const dotnetKeys = getKeys(captures.dotnet.health);
      const springKeys = getKeys(captures.spring.health);
      const nestjsKeys = getKeys(captures.nestjs.health);

      expect(
        dotnetKeys,
        describeKeyDiff('dotnet', dotnetKeys, 'spring', springKeys),
      ).toEqual(springKeys);
      expect(
        springKeys,
        describeKeyDiff('spring', springKeys, 'nestjs', nestjsKeys),
      ).toEqual(nestjsKeys);
    });
  });
});

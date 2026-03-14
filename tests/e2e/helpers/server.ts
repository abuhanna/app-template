/**
 * Server lifecycle helpers for Layer 3 contract tests.
 * Extracted from scripts/integration-test.ts for reuse in vitest.
 */

import { spawn, execSync, type ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';
import type { BackendTarget } from '../config/backend-config.js';
import {
  getStartCommand,
  getEnvOverrides,
  getBackendDir,
  getBasePort,
} from '../config/backend-config.js';
import { httpPost, authHeader } from './http-client.js';

const IS_WIN = process.platform === 'win32';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ServerHandle {
  process: ChildProcess;
  stack: string;
  port: number;
  baseUrl: string;
  accessToken?: string;
  refreshToken?: string;
}

interface StartOptions {
  verbose?: boolean;
}

// ─── Module State ───────────────────────────────────────────────────────────

let activeHandle: ServerHandle | null = null;

// ─── Server Lifecycle ───────────────────────────────────────────────────────

/**
 * Start a backend server for contract testing.
 * For NestJS: runs npm install + npm run build first.
 */
export function startServer(
  target: BackendTarget,
  options: StartOptions = {},
): ServerHandle {
  const { verbose = false } = options;
  const { command, args, cwd } = getStartCommand(target);
  const envOverrides = getEnvOverrides(target.stack);
  const baseDir = getBackendDir(target);

  // NestJS: pre-install and pre-build
  if (target.stack === 'nestjs') {
    if (!existsSync(resolve(baseDir, 'node_modules'))) {
      execSync(IS_WIN ? 'npm.cmd install' : 'npm install', {
        cwd: baseDir,
        stdio: verbose ? 'inherit' : 'pipe',
      });
    }
    execSync(IS_WIN ? 'npm.cmd run build' : 'npm run build', {
      cwd: baseDir,
      env: { ...process.env, ...envOverrides },
      stdio: verbose ? 'inherit' : 'pipe',
    });
  }

  const env = { ...process.env, ...envOverrides };
  const proc = spawn(command, args, {
    cwd,
    env,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  proc.stdout?.on('data', (data: Buffer) => {
    if (verbose) process.stdout.write(`  [out] ${data.toString()}`);
  });

  proc.stderr?.on('data', (data: Buffer) => {
    if (verbose) process.stderr.write(`  [err] ${data.toString()}`);
  });

  const port = getBasePort();
  const handle: ServerHandle = {
    process: proc,
    stack: target.stack,
    port,
    baseUrl: `http://localhost:${port}`,
  };

  activeHandle = handle;
  return handle;
}

/**
 * Poll /health until the server is ready.
 * Handles NestJS TransformInterceptor wrapping (body.data.status fallback).
 */
export async function waitForHealth(
  baseUrl: string,
  timeoutSec = 120,
): Promise<boolean> {
  const deadline = Date.now() + timeoutSec * 1000;
  const pollInterval = 2000;

  while (Date.now() < deadline) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${baseUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const body: any = await res.json();
        // Handle both raw and wrapped (NestJS TransformInterceptor) responses
        const status = body.status ?? body.data?.status;
        const s = status?.toLowerCase();
        if (s === 'healthy' || s === 'ok') return true;
      }
    } catch {
      // Connection refused, keep polling
    }
    await sleep(pollInterval);
  }
  return false;
}

/**
 * Wait for post-startup tasks (seeding) to complete.
 * NestJS and Spring seed AFTER the HTTP server starts listening.
 */
export async function waitForPostStartup(stack: string): Promise<void> {
  if (stack === 'nestjs' || stack === 'spring') {
    await sleep(5000);
  }
}

/**
 * Login as admin and return tokens.
 */
export async function loginAsAdmin(
  baseUrl: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await httpPost(`${baseUrl}/api/auth/login`, {
    username: 'admin',
    email: 'admin@apptemplate.com',
    password: 'Admin@123',
  });

  if (!res.ok || !res.body?.data?.accessToken) {
    throw new Error(
      `Login failed: status=${res.status} body=${JSON.stringify(res.body)}`,
    );
  }

  return {
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
  };
}

/**
 * Stop a running server, ensuring cleanup even on failure.
 */
export async function stopServer(handle: ServerHandle): Promise<void> {
  if (!handle?.process?.pid) return;

  return new Promise((resolve) => {
    handle.process.on('close', () => resolve());

    try {
      if (IS_WIN) {
        execSync(`taskkill /pid ${handle.process.pid} /T /F`, {
          stdio: 'pipe',
        });
      } else {
        handle.process.kill('SIGTERM');
        setTimeout(() => {
          try {
            handle.process.kill('SIGKILL');
          } catch {
            // already dead
          }
        }, 5000);
      }
    } catch {
      // Process may have already exited
    }

    // Also kill anything remaining on the port
    killPort(handle.port);

    if (activeHandle === handle) {
      activeHandle = null;
    }

    // Safety timeout — don't hang forever
    setTimeout(() => resolve(), 8000);
  });
}

/**
 * Kill any process listening on a given port (Windows only).
 */
export function killPort(port: number): void {
  if (!IS_WIN) return;
  try {
    const out = execSync(
      `netstat -ano | findstr ":${port}" | findstr "LISTENING"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
    ).trim();
    const lines = out.split('\n').filter(Boolean);
    const pids = new Set(
      lines.map((l) => l.trim().split(/\s+/).pop()).filter(Boolean),
    );
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
      } catch {
        // Process might already be gone
      }
    }
  } catch {
    // No process found on port
  }
}

/**
 * Register process cleanup handlers to ensure server is killed on exit.
 */
export function setupProcessCleanup(): void {
  const cleanup = () => {
    if (activeHandle?.process?.pid) {
      try {
        if (IS_WIN) {
          execSync(`taskkill /pid ${activeHandle.process.pid} /T /F`, {
            stdio: 'pipe',
          });
          killPort(activeHandle.port);
        } else {
          activeHandle.process.kill('SIGKILL');
        }
      } catch {
        // ignore
      }
    }
  };

  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(143);
  });
}

/**
 * Unwrap NestJS TransformInterceptor wrapping from health responses.
 * Raw: { status, timestamp, ... }
 * Wrapped: { success, message, data: { status, timestamp, ... } }
 */
export function unwrapHealth(body: any): any {
  return body?.data?.status ? body.data : body;
}

// ─── Internal ───────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

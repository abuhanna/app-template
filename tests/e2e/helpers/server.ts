/**
 * Server lifecycle helpers for Layer 3 contract tests.
 * Extracted from scripts/integration-test.ts for reuse in vitest.
 */

import { spawn, execSync, type ChildProcess } from 'child_process';
import { existsSync, chmodSync } from 'fs';
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
const IS_CI = process.env.CI === 'true';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ServerHandle {
  process: ChildProcess;
  stack: string;
  port: number;
  baseUrl: string;
  accessToken?: string;
  refreshToken?: string;
  /** Captured server output for diagnostics on failure */
  serverOutput: string[];
}

interface StartOptions {
  verbose?: boolean;
}

// ─── Module State ───────────────────────────────────────────────────────────

let activeHandle: ServerHandle | null = null;

// ─── Server Lifecycle ───────────────────────────────────────────────────────

/**
 * Pre-build a backend project so that `startServer` only needs to boot (no compile wait).
 * Separates compile time from health-check timeout.
 */
function preBuild(target: BackendTarget, baseDir: string, env: NodeJS.ProcessEnv, verbose: boolean): void {
  const label = `${target.stack}/${target.arch}/${target.variant}`;

  if (target.stack === 'nestjs') {
    const nestBin = resolve(baseDir, 'node_modules', '.bin', IS_WIN ? 'nest.cmd' : 'nest');
    if (!existsSync(nestBin)) {
      console.log(`  [pre-build] ${label}: npm install`);
      execSync(IS_WIN ? 'npm.cmd install' : 'npm install', {
        cwd: baseDir,
        stdio: verbose ? 'inherit' : 'pipe',
      });
    }
    console.log(`  [pre-build] ${label}: nest build`);
    execSync(IS_WIN ? 'npm.cmd run build' : 'npm run build', {
      cwd: baseDir,
      env,
      stdio: verbose ? 'inherit' : 'pipe',
    });
  }

  if (target.stack === 'dotnet') {
    // Pre-build with dotnet build so that `dotnet run` only needs to start
    const project =
      target.arch === 'clean'
        ? 'src/Presentation/App.Template.WebAPI'
        : 'src/App.Template.Api';
    console.log(`  [pre-build] ${label}: dotnet build`);
    execSync(`dotnet build ${project}`, {
      cwd: baseDir,
      env,
      stdio: verbose ? 'inherit' : 'pipe',
      timeout: 300_000, // 5 min for restore + compile
    });
  }

  if (target.stack === 'spring') {
    // Ensure mvnw is executable on Linux/macOS
    if (!IS_WIN) {
      const mvnwPath = resolve(baseDir, 'mvnw');
      if (existsSync(mvnwPath)) {
        try { chmodSync(mvnwPath, 0o755); } catch { /* ignore */ }
      }
    }

    const mvnw = IS_WIN ? resolve(baseDir, 'mvnw.cmd') : resolve(baseDir, 'mvnw');
    const mvnCmd = existsSync(mvnw) ? mvnw : (IS_WIN ? 'mvn.cmd' : 'mvn');

    if (target.arch === 'clean') {
      // Multi-module: install all modules to local repo so api/ can resolve them
      console.log(`  [pre-build] ${label}: mvn install (multi-module)`);
      execSync(`"${mvnCmd}" install -DskipTests -q`, {
        cwd: baseDir,
        env,
        shell: IS_WIN ? 'cmd.exe' : '/bin/sh',
        stdio: verbose ? 'inherit' : 'pipe',
        timeout: 300_000, // 5 min for Maven compile
      });
    } else {
      // Single-module (feature/nlayer): compile is sufficient
      console.log(`  [pre-build] ${label}: mvn compile`);
      execSync(`"${mvnCmd}" compile -DskipTests -q`, {
        cwd: baseDir,
        env,
        shell: IS_WIN ? 'cmd.exe' : '/bin/sh',
        stdio: verbose ? 'inherit' : 'pipe',
        timeout: 300_000, // 5 min for Maven compile
      });
    }
  }
}

/**
 * Start a backend server for contract testing.
 * Pre-builds the project first, then spawns the server process.
 */
export function startServer(
  target: BackendTarget,
  options: StartOptions = {},
): ServerHandle {
  const { verbose = false } = options;
  const { command, args, cwd } = getStartCommand(target);
  const envOverrides = getEnvOverrides(target.stack);
  const baseDir = getBackendDir(target);
  const env = { ...process.env, ...envOverrides };

  // Pre-build to separate compile time from health-check timeout
  preBuild(target, baseDir, env, verbose);

  const proc = spawn(command, args, {
    cwd,
    env,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Capture server output for diagnostics (always capture, show on CI or verbose)
  const serverOutput: string[] = [];

  proc.stdout?.on('data', (data: Buffer) => {
    const line = data.toString();
    serverOutput.push(line);
    // Keep buffer bounded
    if (serverOutput.length > 200) serverOutput.shift();
    if (verbose || IS_CI) process.stdout.write(`  [${target.stack}:out] ${line}`);
  });

  proc.stderr?.on('data', (data: Buffer) => {
    const line = data.toString();
    serverOutput.push(`[ERR] ${line}`);
    if (serverOutput.length > 200) serverOutput.shift();
    if (verbose || IS_CI) process.stderr.write(`  [${target.stack}:err] ${line}`);
  });

  const port = getBasePort();
  const handle: ServerHandle = {
    process: proc,
    stack: target.stack,
    port,
    baseUrl: `http://localhost:${port}`,
    serverOutput,
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
  timeoutSec = 180,
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
 * Retries once after a short delay to handle post-startup race conditions.
 */
export async function loginAsAdmin(
  baseUrl: string,
  serverHandle?: ServerHandle,
): Promise<{ accessToken: string; refreshToken: string }> {
  // Try login with one retry after delay (handles seed race conditions)
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await httpPost(`${baseUrl}/api/auth/login`, {
      username: 'admin',
      email: 'admin@apptemplate.com',
      password: 'Admin@123',
    });

    if (res.ok && res.body?.data?.accessToken) {
      return {
        accessToken: res.body.data.accessToken,
        refreshToken: res.body.data.refreshToken,
      };
    }

    // On first failure, wait and retry
    if (attempt === 0) {
      console.log(`  [login] Attempt 1 failed (status=${res.status}), retrying after 5s...`);
      await sleep(5000);
      continue;
    }

    // Final failure — include server output for diagnostics
    const serverLogs = serverHandle?.serverOutput?.slice(-30).join('') || '(no server output captured)';
    throw new Error(
      `Login failed: status=${res.status} body=${JSON.stringify(res.body)}\n--- Last server output ---\n${serverLogs}`,
    );
  }

  // Unreachable, but TypeScript needs it
  throw new Error('Login failed after retries');
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
 * Kill any process listening on a given port.
 */
export function killPort(port: number): void {
  try {
    if (IS_WIN) {
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
    } else {
      execSync(`fuser -k ${port}/tcp 2>/dev/null || true`, { stdio: 'pipe' });
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

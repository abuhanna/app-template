/**
 * Backend configuration for Layer 3 contract tests.
 * Extracted from scripts/integration-test.ts for reuse in vitest.
 */

import { resolve } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');

const IS_WIN = process.platform === 'win32';

// ─── Types ──────────────────────────────────────────────────────────────────

export type Stack = 'dotnet' | 'spring' | 'nestjs';
export type Arch = 'clean' | 'feature' | 'nlayer';
export type Variant = 'full' | 'minimal';

export interface BackendTarget {
  stack: Stack;
  arch: Arch;
  variant: Variant;
}

export interface StartCommand {
  command: string;
  args: string[];
  cwd: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ALL_STACKS: Stack[] = ['dotnet', 'spring', 'nestjs'];
const ALL_ARCHS: Arch[] = ['clean', 'feature', 'nlayer'];
const ALL_VARIANTS: Variant[] = ['full', 'minimal'];

const BASE_PORT = 5100;
const BASE_URL = `http://localhost:${BASE_PORT}`;

/**
 * Which stack/arch combinations support POST /api/auth/register.
 */
export const HAS_REGISTER: Record<string, boolean> = {
  'dotnet/clean': false,
  'dotnet/feature': true,
  'dotnet/nlayer': true,
  'spring/clean': false,
  'spring/feature': true,
  'spring/nlayer': true,
  'nestjs/clean': true,
  'nestjs/feature': true,
  'nestjs/nlayer': true,
};

// ─── Functions ──────────────────────────────────────────────────────────────

export function getRepoRoot(): string {
  return REPO_ROOT;
}

export function getBaseUrl(): string {
  return BASE_URL;
}

export function getBasePort(): number {
  return BASE_PORT;
}

/**
 * Resolve the backend directory for a given target.
 */
export function getBackendDir(target: BackendTarget): string {
  return resolve(
    REPO_ROOT,
    'backend',
    target.stack,
    `${target.arch}-architecture`,
    target.variant,
  );
}

/**
 * Get the start command for a backend target.
 */
export function getStartCommand(target: BackendTarget): StartCommand {
  const baseDir = getBackendDir(target);

  switch (target.stack) {
    case 'dotnet': {
      const project =
        target.arch === 'clean'
          ? 'src/Presentation/App.Template.WebAPI'
          : 'src/App.Template.Api';
      return {
        command: 'dotnet',
        args: ['run', '--no-build', '--project', project],
        cwd: baseDir,
      };
    }
    case 'spring': {
      if (target.arch === 'clean') {
        return {
          command: IS_WIN
            ? resolve(baseDir, 'mvnw.cmd')
            : resolve(baseDir, 'mvnw'),
          args: ['spring-boot:run'],
          cwd: resolve(baseDir, 'api'),
        };
      }
      // feature/nlayer: check for mvnw in the variant dir, fall back to system mvn
      const mvnwPath = resolve(baseDir, IS_WIN ? 'mvnw.cmd' : 'mvnw');
      if (existsSync(mvnwPath)) {
        return {
          command: mvnwPath,
          args: ['spring-boot:run'],
          cwd: baseDir,
        };
      }
      return {
        command: IS_WIN ? 'mvn.cmd' : 'mvn',
        args: ['spring-boot:run'],
        cwd: baseDir,
      };
    }
    case 'nestjs':
      return {
        command: IS_WIN ? 'npm.cmd' : 'npm',
        args: ['run', 'start'],
        cwd: baseDir,
      };
  }
}

/**
 * Get environment variable overrides to point a backend at the test DB and run on port 5100.
 * Respects TEST_DB_HOST and TEST_DB_PORT env vars for CI compatibility.
 */
export function getEnvOverrides(stack: Stack): Record<string, string> {
  const dbHost = process.env.TEST_DB_HOST || 'localhost';
  const dbPort = process.env.TEST_DB_PORT || '5433';

  const common = {
    PORT: String(BASE_PORT),
  };

  switch (stack) {
    case 'dotnet':
      return {
        ...common,
        ConnectionStrings__DefaultConnection:
          `Host=${dbHost};Port=${dbPort};Database=apptemplate_test;Username=apptemplate;Password=apptemplate123`,
        ASPNETCORE_ENVIRONMENT: 'Development',
        ASPNETCORE_URLS: `http://+:${BASE_PORT}`,
      };
    case 'spring':
      return {
        ...common,
        DB_HOST: dbHost,
        DB_PORT: dbPort,
        DB_NAME: 'apptemplate_test',
        DB_USER: 'apptemplate',
        DB_PASSWORD: 'apptemplate123',
        JWT_SECRET:
          'test-secret-key-minimum-32-characters-long-for-hs256-algorithm',
        SERVER_PORT: String(BASE_PORT),
      };
    case 'nestjs':
      return {
        ...common,
        DB_HOST: dbHost,
        DB_PORT: dbPort,
        DB_NAME: 'apptemplate_test',
        DB_USERNAME: 'apptemplate',
        DB_PASSWORD: 'apptemplate123',
        DB_SYNCHRONIZE: '', // Empty string is falsy — prevents TypeORM synchronize
        DB_LOGGING: '',
        JWT_SECRET:
          'test-secret-key-minimum-32-characters-long-for-hs256-algorithm',
        JWT_REFRESH_SECRET:
          'test-refresh-secret-key-minimum-32-characters-long-enough',
        NODE_ENV: 'development',
      };
  }
}

/**
 * Get the contract test targets.
 * Default: clean-architecture/full for each stack (3 targets).
 * Set LAYER3_ALL=1 to test all 18 backend combinations.
 */
export function getContractTargets(): BackendTarget[] {
  if (process.env.LAYER3_ALL) {
    const targets: BackendTarget[] = [];
    for (const stack of ALL_STACKS) {
      for (const arch of ALL_ARCHS) {
        for (const variant of ALL_VARIANTS) {
          targets.push({ stack, arch, variant });
        }
      }
    }
    return targets;
  }

  // Default: one per stack (clean/full — the reference implementation)
  return ALL_STACKS.map((stack) => ({
    stack,
    arch: 'clean' as Arch,
    variant: 'full' as Variant,
  }));
}

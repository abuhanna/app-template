import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { detectPackageManager, commandExists } from '../package-manager.js';

describe('detectPackageManager', () => {
  const originalCwd = process.cwd;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Use a temp dir as cwd so no real lockfiles interfere
    process.cwd = () => '/tmp/fake-project';
    delete process.env.npm_config_user_agent;
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
  });

  afterEach(() => {
    process.cwd = originalCwd;
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('returns bun when bun.lockb exists', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      return String(p).endsWith('bun.lockb');
    });
    expect(detectPackageManager()).toBe('bun');
  });

  it('returns pnpm when pnpm-lock.yaml exists', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      return String(p).endsWith('pnpm-lock.yaml');
    });
    expect(detectPackageManager()).toBe('pnpm');
  });

  it('returns yarn when yarn.lock exists', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      return String(p).endsWith('yarn.lock');
    });
    expect(detectPackageManager()).toBe('yarn');
  });

  it('returns npm when package-lock.json exists', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      return String(p).endsWith('package-lock.json');
    });
    expect(detectPackageManager()).toBe('npm');
  });

  it('respects priority: bun > pnpm when both exist', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      const s = String(p);
      return s.endsWith('bun.lockb') || s.endsWith('pnpm-lock.yaml');
    });
    expect(detectPackageManager()).toBe('bun');
  });

  it('falls back to npm_config_user_agent for bun', () => {
    process.env.npm_config_user_agent = 'bun/1.0.0';
    expect(detectPackageManager()).toBe('bun');
  });

  it('falls back to npm_config_user_agent for pnpm', () => {
    process.env.npm_config_user_agent = 'pnpm/8.0.0';
    expect(detectPackageManager()).toBe('pnpm');
  });

  it('falls back to npm_config_user_agent for yarn', () => {
    process.env.npm_config_user_agent = 'yarn/4.0.0';
    expect(detectPackageManager()).toBe('yarn');
  });

  it('returns npm as default fallback', () => {
    expect(detectPackageManager()).toBe('npm');
  });
});

describe('commandExists', () => {
  it('returns true for node command', () => {
    expect(commandExists('node')).toBe(true);
  });

  it('returns false for nonexistent command', () => {
    expect(commandExists('nonexistent-command-xyz-12345')).toBe(false);
  });
});

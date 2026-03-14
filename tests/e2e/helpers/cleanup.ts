import fs from 'fs';
import path from 'path';
import os from 'os';

const TEST_OUTPUT_BASE = path.join(os.tmpdir(), 'apptemplate-e2e');

export function getTestOutputBase(): string {
  return TEST_OUTPUT_BASE;
}

export function getTestOutputDir(testId: string): string {
  return path.join(TEST_OUTPUT_BASE, testId);
}

export function cleanupTestOutput(testId: string): void {
  const dir = getTestOutputDir(testId);
  safeRm(dir);
}

export function cleanupAllTestOutputs(): void {
  safeRm(TEST_OUTPUT_BASE);
}

/** Remove a directory with retry for Windows EBUSY/EPERM file locking. */
function safeRm(dir: string, retries = 3): void {
  if (!fs.existsSync(dir)) return;
  for (let i = 0; i < retries; i++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch (err: any) {
      if (i === retries - 1 || (err.code !== 'EBUSY' && err.code !== 'EPERM')) {
        // Last retry or non-retryable error — swallow to avoid masking test results
        return;
      }
      // Brief sync delay before retry (only used during test teardown)
      const start = Date.now();
      while (Date.now() - start < 500) { /* spin */ }
    }
  }
}

export function ensureTestOutputBase(): void {
  if (!fs.existsSync(TEST_OUTPUT_BASE)) {
    fs.mkdirSync(TEST_OUTPUT_BASE, { recursive: true });
  }
}

/**
 * Global setup: clean and recreate base directory.
 * Call from beforeAll in top-level suites.
 */
export function globalSetup(): void {
  cleanupAllTestOutputs();
  ensureTestOutputBase();
}

/**
 * Global teardown: remove all test output unless KEEP_TEST_OUTPUT is set.
 * Call from afterAll in top-level suites.
 */
export function globalTeardown(): void {
  if (!process.env.KEEP_TEST_OUTPUT) {
    cleanupAllTestOutputs();
  }
}

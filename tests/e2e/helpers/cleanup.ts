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
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export function cleanupAllTestOutputs(): void {
  if (fs.existsSync(TEST_OUTPUT_BASE)) {
    fs.rmSync(TEST_OUTPUT_BASE, { recursive: true, force: true });
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

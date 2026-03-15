import { cleanupAllTestOutputs, ensureTestOutputBase } from './cleanup.js';

/**
 * Vitest globalSetup — runs ONCE in the main process before any forked workers start.
 * This avoids the race condition where multiple forks each call cleanupAllTestOutputs()
 * and destroy each other's test output directories.
 */
export function setup(): void {
  cleanupAllTestOutputs();
  ensureTestOutputBase();
}

export function teardown(): void {
  if (!process.env.KEEP_TEST_OUTPUT) {
    cleanupAllTestOutputs();
  }
}

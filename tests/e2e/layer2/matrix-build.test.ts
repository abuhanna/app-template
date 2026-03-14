import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import {
  getFullMatrix,
  getCriticalSubset,
  type MatrixEntry,
} from '../config/matrix.js';
import { generateLocalProject, entryToConfig } from '../helpers/generate.js';
import {
  getBackendBuildCommands,
  getBackendTestCommands,
  getFrontendBuildCommands,
  getFrontendTypeCheckCommands,
  runBuildSequence,
} from '../helpers/build.js';
import {
  getTestOutputDir,
  cleanupTestOutput,
  ensureTestOutputBase,
  cleanupAllTestOutputs,
} from '../helpers/cleanup.js';

// Default: critical only. E2E_ALL=1 for full matrix.
const entries = process.env.E2E_ALL
  ? getFullMatrix()
  : getCriticalSubset();

beforeAll(() => {
  ensureTestOutputBase();
});

afterAll(() => {
  if (!process.env.KEEP_TEST_OUTPUT) {
    cleanupAllTestOutputs();
  }
});

describe.each(entries)('build $id', (entry: MatrixEntry) => {
  const testDir = getTestOutputDir(`build-${entry.id}`);

  beforeAll(async () => {
    cleanupTestOutput(`build-${entry.id}`);
    const config = entryToConfig(entry, testDir);
    await generateLocalProject({ destDir: testDir, config });
  }, 60_000);

  afterAll(() => {
    if (!process.env.KEEP_TEST_OUTPUT) {
      cleanupTestOutput(`build-${entry.id}`);
    }
  });

  if (entry.backend) {
    const backendDir = (() => {
      const dir = getTestOutputDir(`build-${entry.id}`);
      return path.join(dir, 'backend');
    })();

    it(
      'backend builds successfully',
      async () => {
        const commands = getBackendBuildCommands(entry.backend!, backendDir);
        const result = await runBuildSequence(commands);

        expect(
          result.success,
          `Backend build failed (exit ${result.exitCode}):\n${result.stderr.slice(-2000)}`,
        ).toBe(true);
      },
      300_000,
    );

    it(
      'backend tests pass',
      async () => {
        const commands = getBackendTestCommands(entry.backend!, backendDir);
        const result = await runBuildSequence(commands);

        expect(
          result.success,
          `Backend tests failed (exit ${result.exitCode}):\n${result.stderr.slice(-2000)}`,
        ).toBe(true);
      },
      300_000,
    );
  }

  if (entry.frontendFramework) {
    const frontendDir = (() => {
      const dir = getTestOutputDir(`build-${entry.id}`);
      return path.join(dir, 'frontend');
    })();

    it(
      'frontend builds successfully',
      async () => {
        const commands = getFrontendBuildCommands(frontendDir);
        const result = await runBuildSequence(commands);

        expect(
          result.success,
          `Frontend build failed (exit ${result.exitCode}):\n${result.stderr.slice(-2000)}`,
        ).toBe(true);
      },
      300_000,
    );

    // TypeScript type checking — React uses TypeScript, Vue uses jsconfig
    if (entry.frontendFramework === 'react') {
      it(
        'frontend has zero type errors',
        async () => {
          const commands = getFrontendTypeCheckCommands(frontendDir);
          const result = await runBuildSequence(commands, 60_000);

          expect(
            result.success,
            `Frontend type check failed (exit ${result.exitCode}):\n${result.stderr.slice(-2000)}`,
          ).toBe(true);
        },
        120_000,
      );
    }
  }
});

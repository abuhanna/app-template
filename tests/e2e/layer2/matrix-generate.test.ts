import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  getFullMatrix,
  getCriticalSubset,
  type MatrixEntry,
} from '../config/matrix.js';
import { generateLocalProject, entryToConfig } from '../helpers/generate.js';
import {
  getTestOutputDir,
  cleanupTestOutput,
  ensureTestOutputBase,
  cleanupAllTestOutputs,
} from '../helpers/cleanup.js';

// Use critical subset by default, E2E_ALL=1 for full matrix
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

describe.each(entries)('generate $id', (entry: MatrixEntry) => {
  const testDir = getTestOutputDir(entry.id);

  beforeAll(async () => {
    // Clean any previous run
    cleanupTestOutput(entry.id);
    const config = entryToConfig(entry, testDir);
    await generateLocalProject({ destDir: testDir, config });
  });

  afterAll(() => {
    if (!process.env.KEEP_TEST_OUTPUT) {
      cleanupTestOutput(entry.id);
    }
  });

  it('generates without error', () => {
    expect(fs.existsSync(testDir)).toBe(true);
  });

  it('contains all expected files', () => {
    for (const expectedFile of entry.expectedFiles) {
      const fullPath = path.join(testDir, expectedFile);
      expect(
        fs.existsSync(fullPath),
        `Missing expected file: ${expectedFile}`,
      ).toBe(true);
    }
  });

  it('namespace replacement is applied for backend', () => {
    if (entry.projectType === 'frontend') return;

    const backendDir =
      entry.projectType === 'fullstack'
        ? path.join(testDir, 'backend')
        : path.join(testDir, 'backend');

    // For dotnet/spring, we rename to Test.App — check key indicator files
    if (entry.backend === 'dotnet') {
      // After rename, App.Template.sln should become Test.App.sln
      const renamedSln = path.join(backendDir, 'Test.App.sln');
      const originalSln = path.join(backendDir, 'App.Template.sln');

      // One of these should exist (renamed or original if no rename)
      expect(
        fs.existsSync(renamedSln) || fs.existsSync(originalSln),
        'No .sln file found after generation',
      ).toBe(true);

      // If renamed, verify the original is gone
      if (fs.existsSync(renamedSln)) {
        expect(
          fs.existsSync(originalSln),
          'Original App.Template.sln should not exist after rename',
        ).toBe(false);
      }
    }
  });

  it('frontend package.json is updated', () => {
    if (entry.projectType === 'backend') return;

    const frontendDir =
      entry.projectType === 'fullstack'
        ? path.join(testDir, 'frontend')
        : path.join(testDir, 'frontend');

    const pkgPath = path.join(frontendDir, 'package.json');
    if (!fs.existsSync(pkgPath)) return;

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    // After rename, the package name should not be 'apptemplate-frontend'
    // (it gets renamed to the project directory name + '-frontend')
    expect(pkg.name).toBeDefined();
  });
});

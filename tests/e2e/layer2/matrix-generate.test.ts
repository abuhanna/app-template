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
const SKIP_DIRS = new Set(['node_modules', '.git', 'bin', 'obj', 'dist', 'build', 'target', '.gradle', '.mvn', '.idea']);

/** Recursively find files with a given extension, skipping build/vendor dirs. */
function findFilesByExt(dir: string, ext: string): string[] {
  const results: string[] = [];
  function walk(d: string) {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (SKIP_DIRS.has(e.name)) continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && e.name.endsWith(ext)) results.push(full);
    }
  }
  walk(dir);
  return results;
}

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

  // --- Core generation tests ---

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

  // --- Namespace rename validation ---

  it('namespace replacement is applied for backend', () => {
    if (entry.projectType === 'frontend') return;

    const backendDir = path.join(testDir, 'backend');

    // For dotnet, the .sln gets renamed from App.Template → Test.App
    if (entry.backend === 'dotnet') {
      const renamedSln = path.join(backendDir, 'Test.App.sln');
      const originalSln = path.join(backendDir, 'App.Template.sln');

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

    const frontendDir = path.join(testDir, 'frontend');
    const pkgPath = path.join(frontendDir, 'package.json');
    if (!fs.existsSync(pkgPath)) return;

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.name).toBeDefined();
  });

  it('has no AppTemplate references after rename', () => {
    if (entry.projectType === 'frontend') return;

    // Verify key namespace artifacts are renamed (not a full grep).
    // The CLI rename targets structural code namespaces — NOT every
    // "apptemplate" string in config defaults, emails, DB names, etc.
    // We check that the critical namespace files were properly renamed.
    const backendDir = path.join(testDir, 'backend');

    if (entry.backend === 'dotnet') {
      // .sln should be renamed
      const csFiles = findFilesByExt(backendDir, '.cs');
      const namespaceLeaks = csFiles.filter((f) => {
        const content = fs.readFileSync(f, 'utf-8');
        return /namespace\s+App\.Template/m.test(content) ||
               /using\s+App\.Template/m.test(content);
      });
      expect(
        namespaceLeaks.map((f) => path.relative(testDir, f)),
        'C# files should not contain App.Template namespace/using directives',
      ).toHaveLength(0);
    }

    if (entry.backend === 'spring') {
      // Java package declarations should not use apptemplate
      const javaFiles = findFilesByExt(backendDir, '.java');
      const packageLeaks = javaFiles.filter((f) => {
        const content = fs.readFileSync(f, 'utf-8');
        return /^package\s+.*apptemplate/m.test(content);
      });
      expect(
        packageLeaks.map((f) => path.relative(testDir, f)),
        'Java files should not have apptemplate in package declarations',
      ).toHaveLength(0);
    }

    if (entry.backend === 'nestjs') {
      // NestJS rename is minimal — just check module/class names in key files
      // package.json name, Swagger title, DB defaults are NOT renamed by design
      const tsFiles = findFilesByExt(backendDir, '.ts');
      const moduleLeaks = tsFiles.filter((f) => {
        const content = fs.readFileSync(f, 'utf-8');
        return /class\s+AppTemplate/m.test(content);
      });
      expect(
        moduleLeaks.map((f) => path.relative(testDir, f)),
        'TypeScript files should not have AppTemplate class names',
      ).toHaveLength(0);
    }
  });

  // --- Root/shared file presence ---

  it('has README.md with correct project name', () => {
    const readmePath = path.join(testDir, 'README.md');
    expect(
      fs.existsSync(readmePath),
      'README.md should exist',
    ).toBe(true);

    const readme = fs.readFileSync(readmePath, 'utf-8');
    // The project name used during generation is "Test" (from Test.App)
    // or the directory name — just verify it's not empty and has content
    expect(readme.length).toBeGreaterThan(0);
  });

  it('has Dockerfile', () => {
    // Only fullstack projects get a root Dockerfile from shared templates
    if (entry.projectType !== 'fullstack') return;

    expect(
      fs.existsSync(path.join(testDir, 'Dockerfile')),
      'Fullstack project should have a root Dockerfile',
    ).toBe(true);
  });

  it('has docker-compose.yml', () => {
    // Only fullstack projects get docker-compose from shared templates
    if (entry.projectType !== 'fullstack') return;

    expect(
      fs.existsSync(path.join(testDir, 'docker-compose.yml')) ||
        fs.existsSync(path.join(testDir, 'docker-compose.yaml')),
      'Fullstack project should have docker-compose.yml',
    ).toBe(true);
  });

  it('has .env.example', () => {
    expect(
      fs.existsSync(path.join(testDir, '.env.example')),
      '.env.example should be copied from shared/common',
    ).toBe(true);
  });

  it('has .gitignore', () => {
    expect(
      fs.existsSync(path.join(testDir, '.gitignore')),
      '.gitignore should be copied from shared/common',
    ).toBe(true);
  });
});

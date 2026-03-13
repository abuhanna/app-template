import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getFullMatrix,
  getCriticalSubset,
  getAllBackendCombos,
  getAllFrontendCombos,
} from '../config/matrix.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

describe('Matrix definition', () => {
  const matrix = getFullMatrix();

  it('generates exactly 98 combinations', () => {
    expect(matrix).toHaveLength(98);
  });

  it('has 72 fullstack, 18 backend, 8 frontend entries', () => {
    const fullstack = matrix.filter((e) => e.projectType === 'fullstack');
    const backend = matrix.filter((e) => e.projectType === 'backend');
    const frontend = matrix.filter((e) => e.projectType === 'frontend');

    expect(fullstack).toHaveLength(72);
    expect(backend).toHaveLength(18);
    expect(frontend).toHaveLength(8);
  });

  it('has unique IDs for every entry', () => {
    const ids = matrix.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every entry has non-empty expectedFiles', () => {
    for (const entry of matrix) {
      expect(
        entry.expectedFiles.length,
        `${entry.id} has no expectedFiles`,
      ).toBeGreaterThan(0);
    }
  });

  it('critical subset has entries for each backend stack', () => {
    const critical = getCriticalSubset();
    const backendStacks = new Set(
      critical.filter((e) => e.backend).map((e) => e.backend),
    );
    expect(backendStacks).toContain('dotnet');
    expect(backendStacks).toContain('spring');
    expect(backendStacks).toContain('nestjs');
  });

  it('critical subset includes frontend entries', () => {
    const critical = getCriticalSubset();
    const frontendOnly = critical.filter((e) => e.projectType === 'frontend');
    expect(frontendOnly.length).toBeGreaterThanOrEqual(2);
  });

  it('no entry uses the zero variant (not on disk)', () => {
    const zeroEntries = matrix.filter((e) => e.variant === 'zero');
    expect(zeroEntries).toHaveLength(0);
  });

  it('fullstack entries have expectedEndpoints', () => {
    const fullstack = matrix.filter((e) => e.projectType === 'fullstack');
    for (const entry of fullstack) {
      expect(
        entry.expectedEndpoints?.length,
        `${entry.id} has no expectedEndpoints`,
      ).toBeGreaterThan(0);
    }
  });

  it('only valid framework+UI pairings exist', () => {
    for (const entry of matrix) {
      if (entry.frontendFramework === 'vue') {
        expect(
          ['vuetify', 'primevue'],
          `${entry.id}: vue paired with ${entry.ui}`,
        ).toContain(entry.ui);
      }
      if (entry.frontendFramework === 'react') {
        expect(
          ['mui', 'primereact'],
          `${entry.id}: react paired with ${entry.ui}`,
        ).toContain(entry.ui);
      }
    }
  });
});

describe('Matrix template paths resolve', () => {
  it('all backend template directories exist', () => {
    for (const { stack, arch, variant } of getAllBackendCombos()) {
      const templateDir = path.join(
        REPO_ROOT,
        'backend',
        stack,
        `${arch}-architecture`,
        variant,
      );
      expect(
        fs.existsSync(templateDir),
        `Missing: backend/${stack}/${arch}-architecture/${variant}`,
      ).toBe(true);
    }
  });

  it('all frontend template directories exist', () => {
    for (const { framework, ui, variant } of getAllFrontendCombos()) {
      const templateDir = path.join(
        REPO_ROOT,
        'frontend',
        framework,
        ui,
        variant,
      );
      expect(
        fs.existsSync(templateDir),
        `Missing: frontend/${framework}/${ui}/${variant}`,
      ).toBe(true);
    }
  });
});

describe('CLI function imports', () => {
  it('renameProject is importable', async () => {
    const mod = await import('@cli/utils/rename.js');
    expect(typeof mod.renameProject).toBe('function');
  });

  it('updateFolderReferences is importable', async () => {
    const mod = await import('@cli/generator.js');
    expect(typeof mod.updateFolderReferences).toBe('function');
  });
});

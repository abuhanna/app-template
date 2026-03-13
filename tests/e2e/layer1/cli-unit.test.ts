import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  getFullMatrix,
  getCriticalSubset,
  getAllBackendCombos,
  getAllFrontendCombos,
} from '../config/matrix.js';
import { parseArgs, validateFrameworkUiPairing, validateFlagCombinations } from '@cli/cli.js';
import { renameProject } from '@cli/utils/rename.js';
import { detectPackageManager } from '@cli/utils/package-manager.js';
import type { CLIArgs, ProjectConfig } from '@cli/types.js';

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

// ---------- CLI argument parsing ----------

describe('CLI argument parsing', () => {
  let originalArgv: string[];

  beforeEach(() => {
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  function setArgs(...args: string[]) {
    process.argv = ['node', 'cli', ...args];
  }

  it('valid fullstack args are accepted', () => {
    setArgs('my-app', '-b', 'dotnet', '-n', 'My.App');
    const result = parseArgs();
    expect(result.projectPath).toBe('my-app');
    expect(result.backend).toBe('dotnet');
    expect(result.projectName).toBe('My.App');
  });

  it('valid backend-only args are accepted', () => {
    setArgs('my-api', '-t', 'backend', '-b', 'nestjs', '-a', 'feature');
    const result = parseArgs();
    expect(result.type).toBe('backend');
    expect(result.backend).toBe('nestjs');
    expect(result.architecture).toBe('feature');
  });

  it('valid frontend-only args are accepted', () => {
    setArgs('my-spa', '-t', 'frontend', '-f', 'react', '-u', 'mui');
    const result = parseArgs();
    expect(result.type).toBe('frontend');
    expect(result.framework).toBe('react');
    expect(result.ui).toBe('mui');
  });

  it('--variant must be full, minimal, or zero', () => {
    setArgs('-V', 'full');
    expect(parseArgs().variant).toBe('full');

    setArgs('-V', 'minimal');
    expect(parseArgs().variant).toBe('minimal');

    setArgs('-V', 'zero');
    expect(parseArgs().variant).toBe('zero');

    // Invalid variant is ignored (not stored)
    setArgs('-V', 'invalid');
    expect(parseArgs().variant).toBeUndefined();
  });

  it('--version prints current version from package.json', () => {
    setArgs('-v');
    const result = parseArgs();
    expect(result.version).toBe(true);
  });

  it('--help prints usage information', () => {
    setArgs('-h');
    const result = parseArgs();
    expect(result.help).toBe(true);
  });

  it('long-form flags work (--backend, --type, etc.)', () => {
    setArgs('my-app', '--type', 'fullstack', '--backend', 'spring', '--architecture', 'clean',
      '--framework', 'vue', '--ui', 'vuetify', '--variant', 'minimal', '--name', 'My.App',
      '--install', '--root', '--quiet', '--dry-run');
    const result = parseArgs();
    expect(result.type).toBe('fullstack');
    expect(result.backend).toBe('spring');
    expect(result.architecture).toBe('clean');
    expect(result.framework).toBe('vue');
    expect(result.ui).toBe('vuetify');
    expect(result.variant).toBe('minimal');
    expect(result.projectName).toBe('My.App');
    expect(result.install).toBe(true);
    expect(result.root).toBe(true);
    expect(result.quiet).toBe(true);
    expect(result.dryRun).toBe(true);
  });

  it('invalid values are silently ignored', () => {
    setArgs('-b', 'golang', '-f', 'angular', '-u', 'bootstrap');
    const result = parseArgs();
    expect(result.backend).toBeUndefined();
    expect(result.framework).toBeUndefined();
    expect(result.ui).toBeUndefined();
  });
});

// ---------- Framework + UI pairing validation ----------

describe('validateFrameworkUiPairing', () => {
  it('vue + vuetify is valid', () => {
    expect(validateFrameworkUiPairing('vue', 'vuetify')).toBeNull();
  });

  it('vue + primevue is valid', () => {
    expect(validateFrameworkUiPairing('vue', 'primevue')).toBeNull();
  });

  it('react + mui is valid', () => {
    expect(validateFrameworkUiPairing('react', 'mui')).toBeNull();
  });

  it('react + primereact is valid', () => {
    expect(validateFrameworkUiPairing('react', 'primereact')).toBeNull();
  });

  it('vue + mui is rejected', () => {
    expect(validateFrameworkUiPairing('vue', 'mui')).toBeTypeOf('string');
  });

  it('vue + primereact is rejected', () => {
    expect(validateFrameworkUiPairing('vue', 'primereact')).toBeTypeOf('string');
  });

  it('react + vuetify is rejected', () => {
    expect(validateFrameworkUiPairing('react', 'vuetify')).toBeTypeOf('string');
  });

  it('react + primevue is rejected', () => {
    expect(validateFrameworkUiPairing('react', 'primevue')).toBeTypeOf('string');
  });

  it('undefined framework or UI returns null', () => {
    expect(validateFrameworkUiPairing(undefined, 'mui')).toBeNull();
    expect(validateFrameworkUiPairing('vue', undefined)).toBeNull();
  });
});

// ---------- Flag combination validation ----------

describe('validateFlagCombinations', () => {
  it('--type frontend with --backend is rejected', () => {
    const errors = validateFlagCombinations({ type: 'frontend', backend: 'dotnet' });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('--backend'))).toBe(true);
  });

  it('--type backend with --framework is rejected', () => {
    const errors = validateFlagCombinations({ type: 'backend', framework: 'vue' });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('--framework'))).toBe(true);
  });

  it('--type backend with --ui is rejected', () => {
    const errors = validateFlagCombinations({ type: 'backend', ui: 'vuetify' });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('--ui'))).toBe(true);
  });

  it('--type fullstack with --root is rejected', () => {
    const errors = validateFlagCombinations({ type: 'fullstack', root: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('--root'))).toBe(true);
  });

  it('--framework vue with --ui mui is rejected', () => {
    const errors = validateFlagCombinations({ framework: 'vue', ui: 'mui' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('--framework react with --ui vuetify is rejected', () => {
    const errors = validateFlagCombinations({ framework: 'react', ui: 'vuetify' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('valid fullstack args produce no errors', () => {
    const errors = validateFlagCombinations({
      type: 'fullstack',
      backend: 'dotnet',
      framework: 'vue',
      ui: 'vuetify',
      projectPath: 'my-app',
    });
    expect(errors).toHaveLength(0);
  });

  it('valid frontend args produce no errors', () => {
    const errors = validateFlagCombinations({
      type: 'frontend',
      framework: 'react',
      ui: 'mui',
      projectPath: 'my-spa',
    });
    expect(errors).toHaveLength(0);
  });

  it('valid backend args produce no errors', () => {
    const errors = validateFlagCombinations({
      type: 'backend',
      backend: 'nestjs',
      projectPath: 'my-api',
    });
    expect(errors).toHaveLength(0);
  });
});

// ---------- Rename functions ----------

describe('Rename functions', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = path.join(os.tmpdir(), `rename-test-${crypto.randomUUID()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function mkdirp(relativePath: string) {
    fs.mkdirSync(path.join(tmpDir, relativePath), { recursive: true });
  }

  function writeFile(relativePath: string, content: string) {
    const fullPath = path.join(tmpDir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }

  function readFile(relativePath: string): string {
    return fs.readFileSync(path.join(tmpDir, relativePath), 'utf-8');
  }

  function exists(relativePath: string): boolean {
    return fs.existsSync(path.join(tmpDir, relativePath));
  }

  it('dotnet rename: App.Template → Custom.Name in file content', async () => {
    writeFile('backend/App.Template.sln', 'Project("App.Template.Api") AppTemplate namespace');
    writeFile('backend/src/App.Template.Api/App.Template.Api.csproj',
      '<RootNamespace>AppTemplate</RootNamespace>\n<AssemblyName>App.Template.Api</AssemblyName>');
    writeFile('backend/src/App.Template.Api/Program.cs',
      'namespace AppTemplate;\nusing App.Template.Api;');

    const config: ProjectConfig = {
      projectPath: tmpDir, projectType: 'backend', backend: 'dotnet',
      architecture: 'feature', frontendFramework: 'vue', ui: 'vuetify',
      projectName: 'Custom.Name', installDeps: false, placeInRoot: false, variant: 'full',
    };

    await renameProject(tmpDir, config);

    // Content should be replaced
    const csproj = readFile('backend/src/Custom.Name.Api/Custom.Name.Api.csproj');
    expect(csproj).toContain('CustomName');
    expect(csproj).toContain('Custom.Name.Api');
    expect(csproj).not.toContain('AppTemplate');

    const program = readFile('backend/src/Custom.Name.Api/Program.cs');
    expect(program).toContain('CustomName');
    expect(program).not.toContain('AppTemplate');
  });

  it('dotnet rename: App.Template → Custom.Name in file names', async () => {
    writeFile('backend/App.Template.sln', 'solution content');
    writeFile('backend/src/App.Template.Api/App.Template.Api.csproj', '<Project/>');

    const config: ProjectConfig = {
      projectPath: tmpDir, projectType: 'backend', backend: 'dotnet',
      architecture: 'feature', frontendFramework: 'vue', ui: 'vuetify',
      projectName: 'Custom.Name', installDeps: false, placeInRoot: false, variant: 'full',
    };

    await renameProject(tmpDir, config);

    expect(exists('backend/Custom.Name.sln')).toBe(true);
    expect(exists('backend/App.Template.sln')).toBe(false);
    expect(exists('backend/src/Custom.Name.Api/Custom.Name.Api.csproj')).toBe(true);
  });

  it('dotnet rename: App.Template → Custom.Name in folder names', async () => {
    writeFile('backend/src/App.Template.Api/test.cs', 'content');

    const config: ProjectConfig = {
      projectPath: tmpDir, projectType: 'backend', backend: 'dotnet',
      architecture: 'feature', frontendFramework: 'vue', ui: 'vuetify',
      projectName: 'Custom.Name', installDeps: false, placeInRoot: false, variant: 'full',
    };

    await renameProject(tmpDir, config);

    expect(exists('backend/src/Custom.Name.Api')).toBe(true);
    expect(exists('backend/src/App.Template.Api')).toBe(false);
  });

  it('spring rename: apptemplate → custom.name in packages', async () => {
    writeFile('backend/pom.xml',
      '<artifactId>app-template</artifactId>\n<groupId>com.apptemplate</groupId>');
    writeFile('backend/src/main/java/com/apptemplate/api/App.java',
      'package com.apptemplate.api;\npublic class AppTemplate {}');

    const config: ProjectConfig = {
      projectPath: tmpDir, projectType: 'backend', backend: 'spring',
      architecture: 'feature', frontendFramework: 'vue', ui: 'vuetify',
      projectName: 'Custom.Name', installDeps: false, placeInRoot: false, variant: 'full',
    };

    await renameProject(tmpDir, config);

    const pom = readFile('backend/pom.xml');
    expect(pom).toContain('custom-name');
    expect(pom).toContain('custom.name');
    expect(pom).not.toContain('app-template');

    // Java content updated
    const javaFile = readFile('backend/src/main/java/custom/name/api/App.java');
    expect(javaFile).toContain('custom.name.api');
    expect(javaFile).not.toContain('com.apptemplate');
  });

  it('spring rename: apptemplate → custom.name in directory structure', async () => {
    writeFile('backend/pom.xml', '<artifactId>app-template</artifactId>');
    writeFile('backend/src/main/java/com/apptemplate/api/Main.java',
      'package com.apptemplate.api;');

    const config: ProjectConfig = {
      projectPath: tmpDir, projectType: 'backend', backend: 'spring',
      architecture: 'feature', frontendFramework: 'vue', ui: 'vuetify',
      projectName: 'Custom.Name', installDeps: false, placeInRoot: false, variant: 'full',
    };

    await renameProject(tmpDir, config);

    expect(exists('backend/src/main/java/custom/name/api/Main.java')).toBe(true);
    expect(exists('backend/src/main/java/com/apptemplate')).toBe(false);
  });

  it('nestjs rename: apptemplate → custom-name in package.json', async () => {
    writeFile('backend/package.json',
      '{"name": "apptemplate-backend", "description": "AppTemplate Backend"}');
    writeFile('backend/src/main.ts',
      "import { AppTemplate } from './app';\nconst db = 'apptemplate_db';");

    const config: ProjectConfig = {
      projectPath: tmpDir, projectType: 'backend', backend: 'nestjs',
      architecture: 'feature', frontendFramework: 'vue', ui: 'vuetify',
      projectName: 'Custom.Name', installDeps: false, placeInRoot: false, variant: 'full',
    };

    await renameProject(tmpDir, config);

    const pkg = readFile('backend/package.json');
    expect(pkg).toContain('custom-name-backend');
    expect(pkg).not.toContain('apptemplate-backend');

    const main = readFile('backend/src/main.ts');
    expect(main).toContain('CustomName');
    expect(main).toContain('customname_db');
    expect(main).not.toContain('AppTemplate');
  });

  it('rename handles edge cases: dots and hyphens in project name', async () => {
    writeFile('backend/package.json',
      '{"name": "apptemplate-backend", "description": "AppTemplate"}');
    writeFile('backend/src/app.ts', "const name = 'apptemplate';");

    const config: ProjectConfig = {
      projectPath: tmpDir, projectType: 'backend', backend: 'nestjs',
      architecture: 'feature', frontendFramework: 'vue', ui: 'vuetify',
      projectName: 'Acme.Sales.Portal', installDeps: false, placeInRoot: false, variant: 'full',
    };

    await renameProject(tmpDir, config);

    const pkg = readFile('backend/package.json');
    expect(pkg).toContain('acme-sales-portal-backend');

    const app = readFile('backend/src/app.ts');
    expect(app).toContain('acmesalesportal');
  });
});

// ---------- Package manager detection ----------

describe('Package manager detection', () => {
  let originalCwd: () => string;
  let originalUserAgent: string | undefined;

  beforeEach(() => {
    originalCwd = process.cwd;
    originalUserAgent = process.env.npm_config_user_agent;
  });

  afterEach(() => {
    process.cwd = originalCwd;
    if (originalUserAgent === undefined) {
      delete process.env.npm_config_user_agent;
    } else {
      process.env.npm_config_user_agent = originalUserAgent;
    }
    vi.restoreAllMocks();
  });

  it('detects bun when bun.lockb exists', () => {
    const tmpDir = path.join(os.tmpdir(), `pm-test-${crypto.randomUUID()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'bun.lockb'), '');
    process.cwd = () => tmpDir;
    delete process.env.npm_config_user_agent;

    expect(detectPackageManager()).toBe('bun');
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects pnpm when pnpm-lock.yaml exists', () => {
    const tmpDir = path.join(os.tmpdir(), `pm-test-${crypto.randomUUID()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'pnpm-lock.yaml'), '');
    process.cwd = () => tmpDir;
    delete process.env.npm_config_user_agent;

    expect(detectPackageManager()).toBe('pnpm');
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects yarn when yarn.lock exists', () => {
    const tmpDir = path.join(os.tmpdir(), `pm-test-${crypto.randomUUID()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'yarn.lock'), '');
    process.cwd = () => tmpDir;
    delete process.env.npm_config_user_agent;

    expect(detectPackageManager()).toBe('yarn');
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('falls back to npm when no lockfile exists', () => {
    const tmpDir = path.join(os.tmpdir(), `pm-test-${crypto.randomUUID()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    process.cwd = () => tmpDir;
    delete process.env.npm_config_user_agent;

    expect(detectPackageManager()).toBe('npm');
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects pnpm from npm_config_user_agent', () => {
    const tmpDir = path.join(os.tmpdir(), `pm-test-${crypto.randomUUID()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    process.cwd = () => tmpDir;
    process.env.npm_config_user_agent = 'pnpm/8.0.0 npm/? node/v20.0.0';

    expect(detectPackageManager()).toBe('pnpm');
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});

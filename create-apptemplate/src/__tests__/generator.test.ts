import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Mock all external modules before importing generator
vi.mock('../utils/download.js', () => ({
  downloadBackendTemplate: vi.fn().mockResolvedValue(undefined),
  downloadFrontendTemplate: vi.fn().mockResolvedValue(undefined),
  copyRootFiles: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../utils/rename.js', () => ({
  renameProject: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../utils/package-manager.js', () => ({
  installDependencies: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@clack/prompts', () => ({
  spinner: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    message: vi.fn(),
  }),
}));

vi.mock('picocolors', () => ({
  default: {
    yellow: (s: string) => s,
    gray: (s: string) => s,
  },
}));

import { generateProject } from '../generator.js';
import { renameProject } from '../utils/rename.js';
import { installDependencies } from '../utils/package-manager.js';
import type { ProjectConfig } from '../types.js';

function createConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    projectPath: '/tmp/test',
    projectType: 'fullstack',
    backend: 'dotnet',
    architecture: 'clean',
    frontendFramework: 'vue',
    ui: 'vuetify',
    installDeps: false,
    placeInRoot: false,
    variant: 'full',
    ...overrides,
  };
}

describe('generateProject', () => {
  let tmpDir: string;

  beforeEach(() => {
    vi.clearAllMocks();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('creates project directory if it does not exist', async () => {
    const projectDir = path.join(tmpDir, 'new-project');
    const config = createConfig({ projectPath: projectDir });
    await generateProject(config);
    expect(fs.existsSync(projectDir)).toBe(true);
  });

  it('cleans up directory on failure if we created it', async () => {
    const projectDir = path.join(tmpDir, 'fail-project');
    const { downloadBackendTemplate } = await import('../utils/download.js');
    vi.mocked(downloadBackendTemplate).mockRejectedValueOnce(new Error('download failed'));

    const config = createConfig({ projectPath: projectDir });
    await expect(generateProject(config)).rejects.toThrow('download failed');
    expect(fs.existsSync(projectDir)).toBe(false);
  });

  it('does not clean up directory on failure if it pre-existed', async () => {
    // Pre-create the directory
    const projectDir = path.join(tmpDir, 'existing-project');
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(projectDir, 'existing-file.txt'), 'keep me');

    const { downloadBackendTemplate } = await import('../utils/download.js');
    vi.mocked(downloadBackendTemplate).mockRejectedValueOnce(new Error('download failed'));

    const config = createConfig({ projectPath: projectDir });
    await expect(generateProject(config)).rejects.toThrow('download failed');
    // Directory should still exist with its contents
    expect(fs.existsSync(projectDir)).toBe(true);
    expect(fs.existsSync(path.join(projectDir, 'existing-file.txt'))).toBe(true);
  });

  it('calls renameProject when projectName differs from App.Template', async () => {
    const projectDir = path.join(tmpDir, 'rename-project');
    const config = createConfig({
      projectPath: projectDir,
      projectName: 'My.App',
    });
    await generateProject(config);
    expect(renameProject).toHaveBeenCalled();
  });

  it('skips renameProject when projectName is App.Template', async () => {
    const projectDir = path.join(tmpDir, 'no-rename-project');
    const config = createConfig({
      projectPath: projectDir,
      projectName: 'App.Template',
    });
    await generateProject(config);
    expect(renameProject).not.toHaveBeenCalled();
  });

  it('calls installDependencies only when installDeps is true', async () => {
    const projectDir = path.join(tmpDir, 'install-project');

    // Test with installDeps: false
    const config1 = createConfig({ projectPath: projectDir, installDeps: false });
    await generateProject(config1);
    expect(installDependencies).not.toHaveBeenCalled();

    // Clean up and test with installDeps: true
    vi.clearAllMocks();
    const projectDir2 = path.join(tmpDir, 'install-project-2');
    const config2 = createConfig({ projectPath: projectDir2, installDeps: true });
    await generateProject(config2);
    expect(installDependencies).toHaveBeenCalled();
  });
});

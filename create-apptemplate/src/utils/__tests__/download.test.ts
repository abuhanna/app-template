import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock degit before importing the module
const mockClone = vi.fn().mockResolvedValue(undefined);
vi.mock('degit', () => ({
  default: vi.fn(() => ({ clone: mockClone })),
}));

import degit from 'degit';
import { downloadBackendTemplate, downloadFrontendTemplate, copyRootFiles } from '../download.js';
import type { ProjectConfig } from '../../types.js';

describe('downloadBackendTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('constructs correct degit path for dotnet/clean/full', async () => {
    await downloadBackendTemplate('abuhanna/app-template', 'dotnet', 'clean', 'full', '/tmp/dest');
    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/backend/dotnet/clean-architecture/full',
      { cache: false, force: true, verbose: false }
    );
    expect(mockClone).toHaveBeenCalledWith('/tmp/dest');
  });

  it('constructs correct degit path for spring/feature/minimal', async () => {
    await downloadBackendTemplate('abuhanna/app-template', 'spring', 'feature', 'minimal', '/tmp/dest');
    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/backend/spring/feature-architecture/minimal',
      { cache: false, force: true, verbose: false }
    );
  });

  it('constructs correct degit path for nestjs/nlayer/full', async () => {
    await downloadBackendTemplate('abuhanna/app-template', 'nestjs', 'nlayer', 'full', '/tmp/dest');
    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/backend/nestjs/nlayer-architecture/full',
      { cache: false, force: true, verbose: false }
    );
  });
});

describe('downloadFrontendTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('constructs correct degit path for vue/vuetify/full', async () => {
    await downloadFrontendTemplate('abuhanna/app-template', 'vue', 'vuetify', 'full', '/tmp/dest');
    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/frontend/vue/vuetify/full',
      { cache: false, force: true, verbose: false }
    );
    expect(mockClone).toHaveBeenCalledWith('/tmp/dest');
  });

  it('constructs correct degit path for react/primereact/minimal', async () => {
    await downloadFrontendTemplate('abuhanna/app-template', 'react', 'primereact', 'minimal', '/tmp/dest');
    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/frontend/react/primereact/minimal',
      { cache: false, force: true, verbose: false }
    );
  });

  it('constructs correct degit path for react/mui/full', async () => {
    await downloadFrontendTemplate('abuhanna/app-template', 'react', 'mui', 'full', '/tmp/dest');
    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/frontend/react/mui/full',
      { cache: false, force: true, verbose: false }
    );
  });
});

describe('copyRootFiles', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('mock-content'),
    });
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('downloads common files for all project types', async () => {
    const config: ProjectConfig = {
      projectPath: '/tmp/test',
      projectType: 'backend',
      backend: 'dotnet',
      architecture: 'clean',
      frontendFramework: 'vue',
      ui: 'vuetify',
      installDeps: false,
      placeInRoot: false,
      variant: 'full',
    };

    await copyRootFiles('abuhanna/app-template', '/tmp/test', config);

    // Should download .env.example, .gitignore, CLAUDE.md
    const fetchCalls = fetchSpy.mock.calls.map((c: unknown[]) => c[0]);
    expect(fetchCalls).toContainEqual(expect.stringContaining('.env.example'));
    expect(fetchCalls).toContainEqual(expect.stringContaining('.gitignore'));
    expect(fetchCalls).toContainEqual(expect.stringContaining('CLAUDE.md'));
  });

  it('downloads fullstack-specific files and docker for fullstack projects', async () => {
    const config: ProjectConfig = {
      projectPath: '/tmp/test',
      projectType: 'fullstack',
      backend: 'dotnet',
      architecture: 'clean',
      frontendFramework: 'vue',
      ui: 'vuetify',
      installDeps: false,
      placeInRoot: false,
      variant: 'full',
    };

    await copyRootFiles('abuhanna/app-template', '/tmp/test', config);

    const fetchCalls = fetchSpy.mock.calls.map((c: unknown[]) => c[0]);
    // Should download fullstack-specific root files
    expect(fetchCalls).toContainEqual(expect.stringContaining('Makefile'));
    expect(fetchCalls).toContainEqual(expect.stringContaining('docker-compose.staging.yml'));
    expect(fetchCalls).toContainEqual(expect.stringContaining('docker-compose.production.yml'));
    // Should download fullstack README
    expect(fetchCalls).toContainEqual(expect.stringContaining('README.fullstack.dotnet.md'));
    // Should call degit for docker directory
    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/docker',
      { cache: false, force: true, verbose: false }
    );
  });
});

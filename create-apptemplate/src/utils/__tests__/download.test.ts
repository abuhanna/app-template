import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('downloads shared/common for all project types', async () => {
    const config: ProjectConfig = {
      projectPath: '/tmp/test',
      projectType: 'backend',
      backend: 'dotnet',
      architecture: 'clean',
      frontendFramework: 'vue',
      ui: 'vuetify',
      installDeps: false,
      placeInRoot: true,
      variant: 'full',
    };

    await copyRootFiles('abuhanna/app-template', '/tmp/test', config);

    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/shared/common',
      { cache: false, force: true, verbose: false }
    );
  });

  it('downloads docker infra and backend templates for fullstack', async () => {
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

    // Should clone: common, nginx, supervisor, backend templates
    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/shared/common',
      { cache: false, force: true, verbose: false }
    );
    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/shared/docker/nginx',
      { cache: false, force: true, verbose: false }
    );
    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/shared/docker/supervisor',
      { cache: false, force: true, verbose: false }
    );
    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/shared/templates/dotnet',
      { cache: false, force: true, verbose: false }
    );
  });

  it('downloads multirepo README for non-root split projects', async () => {
    const config: ProjectConfig = {
      projectPath: '/tmp/test',
      projectType: 'backend',
      backend: 'spring',
      architecture: 'clean',
      frontendFramework: 'vue',
      ui: 'vuetify',
      installDeps: false,
      placeInRoot: false,
      variant: 'full',
    };

    await copyRootFiles('abuhanna/app-template', '/tmp/test', config);

    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/shared/common',
      { cache: false, force: true, verbose: false }
    );
    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/shared/templates/spring',
      { cache: false, force: true, verbose: false }
    );
  });

  it('skips templates for placeInRoot projects', async () => {
    const config: ProjectConfig = {
      projectPath: '/tmp/test',
      projectType: 'backend',
      backend: 'dotnet',
      architecture: 'clean',
      frontendFramework: 'vue',
      ui: 'vuetify',
      installDeps: false,
      placeInRoot: true,
      variant: 'full',
    };

    await copyRootFiles('abuhanna/app-template', '/tmp/test', config);

    // Should only clone common, not templates
    expect(degit).toHaveBeenCalledTimes(1);
    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/shared/common',
      { cache: false, force: true, verbose: false }
    );
  });

  it('uses dotnet as default backend for frontend-only non-root projects', async () => {
    const config: ProjectConfig = {
      projectPath: '/tmp/test',
      projectType: 'frontend',
      backend: 'dotnet',
      architecture: 'clean',
      frontendFramework: 'vue',
      ui: 'vuetify',
      installDeps: false,
      placeInRoot: false,
      variant: 'full',
    };

    await copyRootFiles('abuhanna/app-template', '/tmp/test', config);

    expect(degit).toHaveBeenCalledWith(
      'abuhanna/app-template/shared/templates/dotnet',
      { cache: false, force: true, verbose: false }
    );
  });
});

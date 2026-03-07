import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { updateFolderReferences } from '../generator.js';
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

describe('updateFolderReferences (integration)', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'folder-ref-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('replaces backend-dotnet with backend in Dockerfile', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'Dockerfile'),
      'COPY backend-dotnet/ /app/backend/\nWORKDIR /app/backend-dotnet'
    );

    const config = createConfig({ projectType: 'fullstack', backend: 'dotnet' });
    await updateFolderReferences(tmpDir, config);

    const content = fs.readFileSync(path.join(tmpDir, 'Dockerfile'), 'utf-8');
    expect(content).toBe('COPY backend/ /app/backend/\nWORKDIR /app/backend');
    expect(content).not.toContain('backend-dotnet');
  });

  it('replaces frontend-vuetify with frontend in docker-compose.yml', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'docker-compose.yml'),
      'context: ./frontend-vuetify\nvolumes:\n  - ./frontend-vuetify:/app'
    );

    const config = createConfig({ projectType: 'fullstack', ui: 'vuetify' });
    await updateFolderReferences(tmpDir, config);

    const content = fs.readFileSync(path.join(tmpDir, 'docker-compose.yml'), 'utf-8');
    expect(content).toBe('context: ./frontend\nvolumes:\n  - ./frontend:/app');
    expect(content).not.toContain('frontend-vuetify');
  });

  it('replaces all backend variants in same file', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'Makefile'),
      'build:\n\tcd backend-dotnet && build\n\tcd backend-spring && build\n\tcd backend-nestjs && build'
    );

    const config = createConfig({ projectType: 'fullstack' });
    await updateFolderReferences(tmpDir, config);

    const content = fs.readFileSync(path.join(tmpDir, 'Makefile'), 'utf-8');
    expect(content).toBe('build:\n\tcd backend && build\n\tcd backend && build\n\tcd backend && build');
  });

  it('replaces all frontend variants in same file', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'README.md'),
      'frontend-vuetify frontend-primevue frontend-mui frontend-primereact'
    );

    const config = createConfig({ projectType: 'fullstack' });
    await updateFolderReferences(tmpDir, config);

    const content = fs.readFileSync(path.join(tmpDir, 'README.md'), 'utf-8');
    expect(content).toBe('frontend frontend frontend frontend');
  });

  it('handles placeInRoot by replacing folder names with "."', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'Dockerfile'),
      'COPY backend-dotnet/ /app/'
    );

    const config = createConfig({
      projectType: 'backend',
      placeInRoot: true,
    });
    await updateFolderReferences(tmpDir, config);

    const content = fs.readFileSync(path.join(tmpDir, 'Dockerfile'), 'utf-8');
    expect(content).toBe('COPY ./ /app/');
  });

  it('updates files inside docker/ subdirectory', async () => {
    const dockerDir = path.join(tmpDir, 'docker', 'nginx');
    fs.mkdirSync(dockerDir, { recursive: true });
    fs.writeFileSync(
      path.join(dockerDir, 'default.conf'),
      'proxy_pass http://backend-dotnet:8080;'
    );

    const config = createConfig({ projectType: 'fullstack' });
    await updateFolderReferences(tmpDir, config);

    const content = fs.readFileSync(path.join(dockerDir, 'default.conf'), 'utf-8');
    expect(content).toBe('proxy_pass http://backend:8080;');
  });
});

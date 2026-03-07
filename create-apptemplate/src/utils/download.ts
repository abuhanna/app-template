import degit from 'degit';
import path from 'path';
import fs from 'fs';
import type { ProjectConfig, BackendFramework, BackendArchitecture, FrontendFramework, UILibrary, TemplateVariant } from '../types.js';

/**
 * Download a backend template from the new directory structure
 * Path format: backend/{framework}/{architecture}-architecture/{variant}
 */
export async function downloadBackendTemplate(
  repo: string,
  backend: BackendFramework,
  architecture: BackendArchitecture,
  variant: TemplateVariant,
  destPath: string
): Promise<void> {
  const folder = `backend/${backend}/${architecture}-architecture/${variant}`;
  const source = `${repo}/${folder}`;
  const emitter = degit(source, {
    cache: false,
    force: true,
    verbose: false,
  });

  try {
    await emitter.clone(destPath);
  } catch (error) {
    if (error instanceof Error) {
      (error as any).templatePath = folder;
    }
    throw error;
  }
}

/**
 * Download a frontend template from the new directory structure
 * Path format: frontend/{framework}/{ui}/{variant}
 */
export async function downloadFrontendTemplate(
  repo: string,
  framework: FrontendFramework,
  ui: UILibrary,
  variant: TemplateVariant,
  destPath: string
): Promise<void> {
  const folder = `frontend/${framework}/${ui}/${variant}`;
  const source = `${repo}/${folder}`;
  const emitter = degit(source, {
    cache: false,
    force: true,
    verbose: false,
  });

  try {
    await emitter.clone(destPath);
  } catch (error) {
    if (error instanceof Error) {
      (error as any).templatePath = folder;
    }
    throw error;
  }
}

/**
 * Clone a subdirectory from the GitHub repo using degit.
 */
async function degitClone(source: string, dest: string): Promise<void> {
  const emitter = degit(source, { cache: false, force: true, verbose: false });
  try {
    await emitter.clone(dest);
  } catch (error) {
    if (error instanceof Error) {
      (error as any).templatePath = source;
    }
    throw error;
  }
}

/**
 * Download root configuration files based on project type.
 * Uses targeted degit calls to the shared/ folder:
 * - shared/common → common config files (all project types)
 * - shared/docker/nginx → nginx reverse proxy config (fullstack)
 * - shared/docker/supervisor → base supervisor config (fullstack)
 * - shared/templates/{backend} → backend-specific Docker/compose/README (fullstack)
 */
export async function copyRootFiles(repo: string, destPath: string, config: ProjectConfig): Promise<void> {
  // 1. Common files (always needed): .dockerignore, .env.example, .env.production.example,
  //    .gitattributes, .gitignore, CLAUDE.md
  if (config.projectType === 'fullstack') {
    // Fullstack: download common + docker infra in parallel, then backend templates
    await Promise.all([
      degitClone(`${repo}/shared/common`, destPath),
      degitClone(`${repo}/shared/docker/nginx`, path.join(destPath, 'docker/nginx')),
      degitClone(`${repo}/shared/docker/supervisor`, path.join(destPath, 'docker/supervisor')),
    ]);

    // Backend-specific templates (must run after supervisor to overwrite base config)
    const tempDir = path.join(destPath, '.temp-templates');
    try {
      await degitClone(`${repo}/shared/templates/${config.backend}`, tempDir);

      copyFileFromTemp(tempDir, 'Dockerfile', destPath, 'Dockerfile');
      copyFileFromTemp(tempDir, 'docker-compose.yml', destPath, 'docker-compose.yml');
      copyFileFromTemp(tempDir, 'docker-compose.staging.yml', destPath, 'docker-compose.staging.yml');
      copyFileFromTemp(tempDir, 'docker-compose.production.yml', destPath, 'docker-compose.production.yml');
      copyFileFromTemp(tempDir, 'supervisord.conf', path.join(destPath, 'docker/supervisor'), 'supervisord.conf');
      copyFileFromTemp(tempDir, 'README.fullstack.md', destPath, 'README.md');
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  } else if (!config.placeInRoot) {
    // Non-root backend-only or frontend-only: common files + multirepo README
    const backend = config.projectType === 'backend' ? config.backend : 'dotnet';
    const tempDir = path.join(destPath, '.temp-templates');
    try {
      await Promise.all([
        degitClone(`${repo}/shared/common`, destPath),
        degitClone(`${repo}/shared/templates/${backend}`, tempDir),
      ]);
      copyFileFromTemp(tempDir, 'README.multirepo.md', destPath, 'README.md');
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  } else {
    // placeInRoot: only common files, preserve component's own README.md
    await degitClone(`${repo}/shared/common`, destPath);
  }
}

/**
 * Helper to copy a file from temp dir to destination
 */
function copyFileFromTemp(tempDir: string, srcRelative: string, destBase: string, destRelative: string): void {
  const srcPath = path.join(tempDir, srcRelative);
  const destPath = path.join(destBase, destRelative);

  if (fs.existsSync(srcPath)) {
    const parentDir = path.dirname(destPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
  }
}


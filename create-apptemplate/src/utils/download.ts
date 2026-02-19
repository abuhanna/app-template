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

  await emitter.clone(destPath);
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

  await emitter.clone(destPath);
}

/**
 * Download a specific folder from the GitHub repository (legacy function for compatibility)
 */
export async function downloadTemplate(repo: string, folder: string, destPath: string): Promise<void> {
  const source = `${repo}/${folder}`;
  const emitter = degit(source, {
    cache: false,
    force: true,
    verbose: false,
  });

  await emitter.clone(destPath);
}


/**
 * Download root configuration files based on project type
 */
export async function copyRootFiles(repo: string, destPath: string, config: ProjectConfig): Promise<void> {
  // Common files for all projects
  // REMOVED 'README.md' from here
  const commonFiles = [
    '.env.example',
    '.gitignore',
    'CLAUDE.md',
  ];

  // Create a temporary directory for the full repo download
  const tempDir = path.join(destPath, '.temp-download');

  try {
    // Download the entire repository to temp dir
    const emitter = degit(repo, {
      cache: false,
      force: true,
      verbose: false,
    });

    await emitter.clone(tempDir);

    // 1. Copy Common Files
    for (const file of commonFiles) {
      copyFileFromTemp(tempDir, file, destPath, file);
    }

    // 2. Dynamic README Selection
    if (config.projectType === 'fullstack') {
      // Fullstack README
      const readmeTemplate = `docker/templates/root/README.fullstack.${config.backend}.md`;
      copyFileFromTemp(tempDir, readmeTemplate, destPath, 'README.md');
    } else if (!config.placeInRoot) {
      // Split project (subdirectory) - generic README
      const readmeTemplate = `docker/templates/root/README.multirepo.md`;
      copyFileFromTemp(tempDir, readmeTemplate, destPath, 'README.md');
    }
    // If placeInRoot is true (Backend/Frontend Only in root), we do NOTHING.
    // The component's own README.md has already been downloaded to the root by downloadTemplate logic.
    // We effectively preserve it.

    // 3. Fullstack Specific Logic
    if (config.projectType === 'fullstack') {
      // Copy root docker folder (nginx, supervisor, etc.)
      // We exclude templates from the final copy implicitly by not copying the 'templates' subfolder if we iterate,
      // or we just copy 'docker' and then delete 'templates' later.
      // For simplicity, let's copy 'docker/nginx' and 'docker/supervisor' explicitly.
      copyDirectoryFromTemp(tempDir, 'docker/nginx', path.join(destPath, 'docker/nginx'));
      copyDirectoryFromTemp(tempDir, 'docker/supervisor', path.join(destPath, 'docker/supervisor'));

      // Select and copy root Dockerfile
      const dockerfileTemplate = `docker/templates/root/Dockerfile.${config.backend}`;
      copyFileFromTemp(tempDir, dockerfileTemplate, destPath, 'Dockerfile');

      // Select and copy root docker-compose.yml
      const composeTemplate = `docker/templates/root/docker-compose.${config.backend}.yml`;
      copyFileFromTemp(tempDir, composeTemplate, destPath, 'docker-compose.yml');

      // Select and copy root supervisord.conf
      const supervisorTemplate = `docker/templates/root/supervisord.${config.backend}.conf`;
      copyFileFromTemp(tempDir, supervisorTemplate, destPath, 'docker/supervisor/supervisord.conf');

      // Copy Makefile if it exists
      copyFileFromTemp(tempDir, 'Makefile', destPath, 'Makefile');
      copyFileFromTemp(tempDir, 'docker-compose.staging.yml', destPath, 'docker-compose.staging.yml');
      copyFileFromTemp(tempDir, 'docker-compose.production.yml', destPath, 'docker-compose.production.yml');
    }

    // 3. Non-Fullstack Logic
    // We do NOT copy root Dockerfile or docker-compose.yml.
    // We do NOT copy the 'docker' folder (standalone backends/frontends are self-contained).

  } finally {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
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

/**
 * Helper to copy a directory from temp dir to destination
 */
function copyDirectoryFromTemp(tempDir: string, srcRelative: string, destPath: string): void {
  const srcPath = path.join(tempDir, srcRelative);

  if (fs.existsSync(srcPath)) {
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    fs.cpSync(srcPath, destPath, { recursive: true });
  }
}

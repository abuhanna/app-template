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
 * Parse a GitHub repo string (e.g. 'owner/repo') into components
 */
function parseRepo(repo: string): { owner: string; name: string } {
  const [owner, name] = repo.split('/');
  return { owner, name };
}

/**
 * Download a single file from GitHub raw content API (Node 18+ fetch)
 * Returns true if the file was downloaded, false if not found or failed
 */
async function downloadRawFile(
  owner: string,
  repoName: string,
  filePath: string,
  destPath: string
): Promise<boolean> {
  const url = `https://raw.githubusercontent.com/${owner}/${repoName}/HEAD/${filePath}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    const content = await response.text();
    const parentDir = path.dirname(destPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(destPath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Download root configuration files based on project type.
 * Uses targeted downloads instead of cloning the entire repository:
 * - Individual root files via GitHub raw API (small files, no tarball needed)
 * - Docker directory via targeted degit subdirectory download (fullstack only)
 */
export async function copyRootFiles(repo: string, destPath: string, config: ProjectConfig): Promise<void> {
  const { owner, name } = parseRepo(repo);

  // 1. Download common root-level files via GitHub raw API
  const commonFiles = ['.env.example', '.gitignore', 'CLAUDE.md'];
  await Promise.all(
    commonFiles.map(file => downloadRawFile(owner, name, file, path.join(destPath, file)))
  );

  // 2. Dynamic README selection via raw API
  if (config.projectType === 'fullstack') {
    await downloadRawFile(owner, name, `docker/templates/root/README.fullstack.${config.backend}.md`, path.join(destPath, 'README.md'));
  } else if (!config.placeInRoot) {
    // Split project (subdirectory) - generic README
    await downloadRawFile(owner, name, 'docker/templates/root/README.multirepo.md', path.join(destPath, 'README.md'));
  }
  // If placeInRoot is true, preserve the component's own README.md

  // 3. Fullstack-specific files
  if (config.projectType === 'fullstack') {
    // Download additional root files via raw API
    const fullstackRootFiles = ['Makefile', 'docker-compose.staging.yml', 'docker-compose.production.yml'];
    await Promise.all(
      fullstackRootFiles.map(file => downloadRawFile(owner, name, file, path.join(destPath, file)))
    );

    // Download docker/ subdirectory via targeted degit (nginx, supervisor, templates)
    const tempDockerDir = path.join(destPath, '.temp-docker');
    try {
      const emitter = degit(`${repo}/docker`, {
        cache: false,
        force: true,
        verbose: false,
      });
      await emitter.clone(tempDockerDir);

      // Copy nginx and supervisor configs
      copyDirectoryFromTemp(tempDockerDir, 'nginx', path.join(destPath, 'docker/nginx'));
      copyDirectoryFromTemp(tempDockerDir, 'supervisor', path.join(destPath, 'docker/supervisor'));

      // Select backend-specific files from templates/root/
      copyFileFromTemp(tempDockerDir, `templates/root/Dockerfile.${config.backend}`, destPath, 'Dockerfile');
      copyFileFromTemp(tempDockerDir, `templates/root/docker-compose.${config.backend}.yml`, destPath, 'docker-compose.yml');
      copyFileFromTemp(tempDockerDir, `templates/root/supervisord.${config.backend}.conf`, destPath, 'docker/supervisor/supervisord.conf');
    } finally {
      if (fs.existsSync(tempDockerDir)) {
        fs.rmSync(tempDockerDir, { recursive: true, force: true });
      }
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

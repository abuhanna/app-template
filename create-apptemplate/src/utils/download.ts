import degit from 'degit';
import path from 'path';
import fs from 'fs';
import type { ProjectConfig } from '../types.js';

/**
 * Download a specific folder from the GitHub repository
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
  // Files to download based on project type
  const commonFiles = [
    '.env.example',
    '.gitignore',
    'README.md',
    'CLAUDE.md',
  ];

  const fullstackFiles = [
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.staging.yml',
    'docker-compose.production.yml',
    'Makefile',
  ];

  const backendOnlyFiles = [
    'docker/Dockerfile.backend',
    'docker-compose.backend.yml',
  ];

  const frontendOnlyFiles = [
    'docker/Dockerfile.frontend',
    'docker/nginx/frontend-only.conf',
    'docker-compose.frontend.yml',
  ];

  // Determine which files to download
  let filesToDownload = [...commonFiles];

  switch (config.projectType) {
    case 'fullstack':
      filesToDownload = [...filesToDownload, ...fullstackFiles];
      break;
    case 'backend':
      filesToDownload = [...filesToDownload, ...backendOnlyFiles];
      break;
    case 'frontend':
      filesToDownload = [...filesToDownload, ...frontendOnlyFiles];
      break;
  }

  // Download docker folder for all project types
  const dockerFolder = 'docker';
  const dockerDest = path.join(destPath, dockerFolder);

  try {
    await downloadTemplate(repo, dockerFolder, dockerDest);
  } catch {
    // Docker folder might not exist for all project types, ignore error
  }

  // Note: We intentionally DO NOT download the scripts folder
  // The create-project and rename-project scripts are for manual repo cloning
  // Projects created via npm CLI don't need these scripts

  // Download individual root files
  // Note: degit doesn't support individual file downloads, so we download the whole repo
  // and then filter the files we need. This is a workaround.

  // Create a temporary directory for the full repo download
  const tempDir = path.join(destPath, '.temp-download');

  try {
    const emitter = degit(repo, {
      cache: false,
      force: true,
      verbose: false,
    });

    await emitter.clone(tempDir);

    // Copy only the files we need
    for (const file of filesToDownload) {
      const srcFile = path.join(tempDir, file);
      const destFile = path.join(destPath, file);

      if (fs.existsSync(srcFile)) {
        // Ensure parent directory exists
        const parentDir = path.dirname(destFile);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }
        fs.copyFileSync(srcFile, destFile);
      }
    }
  } finally {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

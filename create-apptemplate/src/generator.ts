import * as p from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import fs from 'fs';
import type { ProjectConfig } from './types.js';
import { downloadTemplate, copyRootFiles } from './utils/download.js';
import { renameProject } from './utils/rename.js';
import { installDependencies } from './utils/package-manager.js';

// GitHub repository for templates
const REPO = 'abuhanna/app-template';

export async function generateProject(config: ProjectConfig): Promise<void> {
  const absolutePath = path.resolve(config.projectPath);

  // Create project directory
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }

  const spinner = p.spinner();

  // Step 1: Download templates
  spinner.start('Downloading templates...');

  try {
    // Download backend (if not frontend-only)
    if (config.projectType !== 'frontend') {
      const backendFolder = `backend-${config.backend}`;
      await downloadTemplate(REPO, backendFolder, path.join(absolutePath, backendFolder));
      spinner.message(`Downloaded ${backendFolder}`);
    }

    // Download frontend (if not backend-only)
    if (config.projectType !== 'backend') {
      const frontendFolder = `frontend-${config.ui}`;
      await downloadTemplate(REPO, frontendFolder, path.join(absolutePath, frontendFolder));
      spinner.message(`Downloaded ${frontendFolder}`);
    }

    // Download common files (docker, scripts, etc.)
    await copyRootFiles(REPO, absolutePath, config);
    spinner.message('Downloaded configuration files');

    spinner.stop('Templates downloaded');
  } catch (error) {
    spinner.stop('Download failed');
    throw error;
  }

  // Step 2: Rename project
  if (config.projectName !== 'App.Template') {
    spinner.start('Renaming project...');

    try {
      await renameProject(absolutePath, config);
      spinner.stop('Project renamed');
    } catch (error) {
      spinner.stop('Rename failed');
      throw error;
    }
  }

  // Step 3: Install dependencies (if requested)
  if (config.installDeps) {
    spinner.start('Installing dependencies...');

    try {
      await installDependencies(absolutePath, config);
      spinner.stop('Dependencies installed');
    } catch (error) {
      spinner.stop('Installation failed');
      // Don't throw - just warn
      console.log(pc.yellow('  Warning: Some dependencies may not have been installed'));
    }
  }

  // Step 4: Create .env file from example
  const envExamplePath = path.join(absolutePath, '.env.example');
  const envPath = path.join(absolutePath, '.env');
  if (fs.existsSync(envExamplePath) && !fs.existsSync(envPath)) {
    fs.copyFileSync(envExamplePath, envPath);
  }
}

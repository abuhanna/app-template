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
      const sourceFolder = `backend-${config.backend}`;
      // For fullstack: use 'backend', for backend-only: use subfolder or root
      let destFolder: string;
      if (config.projectType === 'fullstack') {
        destFolder = 'backend';
      } else {
        destFolder = config.placeInRoot ? '' : 'backend';
      }
      const destPath = destFolder ? path.join(absolutePath, destFolder) : absolutePath;
      await downloadTemplate(REPO, sourceFolder, destPath);
      spinner.message(`Downloaded ${sourceFolder}`);
    }

    // Download frontend (if not backend-only)
    if (config.projectType !== 'backend') {
      const sourceFolder = `frontend-${config.ui}`;
      // For fullstack: use 'frontend', for frontend-only: use subfolder or root
      let destFolder: string;
      if (config.projectType === 'fullstack') {
        destFolder = 'frontend';
      } else {
        destFolder = config.placeInRoot ? '' : 'frontend';
      }
      const destPath = destFolder ? path.join(absolutePath, destFolder) : absolutePath;
      await downloadTemplate(REPO, sourceFolder, destPath);
      spinner.message(`Downloaded ${sourceFolder}`);
    }

    // Download common files (docker, scripts, etc.)
    await copyRootFiles(REPO, absolutePath, config);
    spinner.message('Downloaded configuration files');

    spinner.stop('Templates downloaded');
  } catch (error) {
    spinner.stop('Download failed');
    throw error;
  }

  // Step 2: Update folder references in common files
  spinner.start('Updating configuration files...');
  try {
    await updateFolderReferences(absolutePath, config);
    spinner.stop('Configuration updated');
  } catch (error) {
    spinner.stop('Configuration update failed');
    throw error;
  }

  // Step 3: Rename project namespaces (only for dotnet/spring)
  if (config.projectName && config.projectName !== 'App.Template') {
    spinner.start('Renaming project namespaces...');

    try {
      await renameProject(absolutePath, config);
      spinner.stop('Project namespaces updated');
    } catch (error) {
      spinner.stop('Namespace rename failed');
      throw error;
    }
  }

  // Step 4: Install dependencies (if requested)
  if (config.installDeps) {
    spinner.start('Installing dependencies (this may take a while)...');

    try {
      await installDependencies(absolutePath, config);
      spinner.stop('Dependencies installed');
    } catch (error) {
      spinner.stop('Installation failed');
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(pc.yellow(`  Warning: Dependency installation failed: ${errorMessage}`));
      console.log(pc.gray('  You can install manually by running npm install in the project directory'));
    }
  }

  // Step 5: Create .env file from example
  const envExamplePath = path.join(absolutePath, '.env.example');
  const envPath = path.join(absolutePath, '.env');
  if (fs.existsSync(envExamplePath) && !fs.existsSync(envPath)) {
    fs.copyFileSync(envExamplePath, envPath);
  }

  // Step 6: Create appsettings.Development.json from example (for .NET projects)
  if (config.projectType !== 'frontend' && config.backend === 'dotnet') {
    await createAppSettingsFromExample(absolutePath, config);
  }
}

/**
 * Create appsettings.Development.json from appsettings.example.json for .NET projects
 */
async function createAppSettingsFromExample(projectPath: string, config: ProjectConfig): Promise<void> {
  // Determine backend directory
  let backendDir: string;
  if (config.projectType === 'fullstack') {
    backendDir = path.join(projectPath, 'backend');
  } else if (config.placeInRoot) {
    backendDir = projectPath;
  } else {
    backendDir = path.join(projectPath, 'backend');
  }

  // Find WebAPI project directory (it contains appsettings.example.json)
  const presentationDir = path.join(backendDir, 'src', 'Presentation');
  if (!fs.existsSync(presentationDir)) return;

  const entries = fs.readdirSync(presentationDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.endsWith('.WebAPI')) {
      const webApiDir = path.join(presentationDir, entry.name);
      const examplePath = path.join(webApiDir, 'appsettings.example.json');
      const devPath = path.join(webApiDir, 'appsettings.Development.json');

      if (fs.existsSync(examplePath) && !fs.existsSync(devPath)) {
        fs.copyFileSync(examplePath, devPath);
      }
    }
  }
}

/**
 * Update folder references in common files
 * Replaces backend-dotnet/backend-spring/backend-nestjs with backend
 * Replaces frontend-vuetify/frontend-primevue with frontend
 */
async function updateFolderReferences(projectPath: string, config: ProjectConfig): Promise<void> {
  const filesToUpdate = [
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.staging.yml',
    'docker-compose.production.yml',
    'docker-compose.backend.yml',
    'docker-compose.frontend.yml',
    'Makefile',
    'CLAUDE.md',
    'README.md',
  ];

  // Determine the new folder names based on project type
  const backendReplace = config.placeInRoot && config.projectType === 'backend' ? '.' : 'backend';
  const frontendReplace = config.placeInRoot && config.projectType === 'frontend' ? '.' : 'frontend';

  for (const file of filesToUpdate) {
    const filePath = path.join(projectPath, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');

      // Replace backend folder references
      if (config.projectType !== 'frontend') {
        content = content
          .replace(/backend-dotnet/g, backendReplace)
          .replace(/backend-spring/g, backendReplace)
          .replace(/backend-nestjs/g, backendReplace);
      }

      // Replace frontend folder references
      if (config.projectType !== 'backend') {
        content = content
          .replace(/frontend-vuetify/g, frontendReplace)
          .replace(/frontend-primevue/g, frontendReplace);
      }

      fs.writeFileSync(filePath, content);
    }
  }

  // Also update docker folder files
  const dockerFolder = path.join(projectPath, 'docker');
  if (fs.existsSync(dockerFolder)) {
    updateDockerFolderFiles(dockerFolder, config, backendReplace, frontendReplace);
  }
}

/**
 * Recursively update files in the docker folder
 */
function updateDockerFolderFiles(
  dir: string,
  config: ProjectConfig,
  backendReplace: string,
  frontendReplace: string
): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      updateDockerFolderFiles(fullPath, config, backendReplace, frontendReplace);
    } else if (entry.isFile()) {
      let content = fs.readFileSync(fullPath, 'utf-8');

      if (config.projectType !== 'frontend') {
        content = content
          .replace(/backend-dotnet/g, backendReplace)
          .replace(/backend-spring/g, backendReplace)
          .replace(/backend-nestjs/g, backendReplace);
      }

      if (config.projectType !== 'backend') {
        content = content
          .replace(/frontend-vuetify/g, frontendReplace)
          .replace(/frontend-primevue/g, frontendReplace);
      }

      fs.writeFileSync(fullPath, content);
    }
  }
}

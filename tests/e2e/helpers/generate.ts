import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ProjectConfig } from '@cli/types.js';
import { renameProject } from '@cli/utils/rename.js';
import { updateFolderReferences } from '@cli/generator.js';
import type { MatrixEntry } from '../config/matrix.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

// Directories and files to exclude when copying templates
const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'target',
  'obj',
  'bin',
  '.gradle',
  '.mvn',
]);

function cpFilter(src: string): boolean {
  const basename = path.basename(src);
  return !EXCLUDE_DIRS.has(basename);
}

export interface GenerateOptions {
  destDir: string;
  config: ProjectConfig;
  skipRename?: boolean;
}

/**
 * Generate a project locally by copying templates from the monorepo.
 * Replicates the CLI's generateProject() flow without network (degit).
 */
export async function generateLocalProject(opts: GenerateOptions): Promise<void> {
  const { destDir, config, skipRename = false } = opts;

  fs.mkdirSync(destDir, { recursive: true });

  // Step 1a: Copy backend template
  if (config.projectType !== 'frontend') {
    const srcPath = path.join(
      REPO_ROOT,
      'backend',
      config.backend,
      `${config.architecture}-architecture`,
      config.variant,
    );

    let backendDest: string;
    if (config.projectType === 'fullstack') {
      backendDest = path.join(destDir, 'backend');
    } else {
      backendDest = config.placeInRoot ? destDir : path.join(destDir, 'backend');
    }

    fs.cpSync(srcPath, backendDest, { recursive: true, filter: cpFilter });
  }

  // Step 1b: Copy frontend template
  if (config.projectType !== 'backend') {
    const srcPath = path.join(
      REPO_ROOT,
      'frontend',
      config.frontendFramework,
      config.ui,
      config.variant,
    );

    let frontendDest: string;
    if (config.projectType === 'fullstack') {
      frontendDest = path.join(destDir, 'frontend');
    } else {
      frontendDest = config.placeInRoot ? destDir : path.join(destDir, 'frontend');
    }

    fs.cpSync(srcPath, frontendDest, { recursive: true, filter: cpFilter });
  }

  // Step 1c: Copy shared/root files (replicates copyRootFiles from download.ts)
  await copySharedFiles(destDir, config);

  // Step 2: Update folder references
  await updateFolderReferences(destDir, config);

  // Step 3: Rename project namespaces
  if (!skipRename) {
    const needsBackendRename =
      config.projectName &&
      config.projectName !== 'App.Template' &&
      config.projectType !== 'frontend';
    const needsFrontendRename = config.projectType !== 'backend';

    if (needsBackendRename || needsFrontendRename) {
      await renameProject(destDir, config);
    }
  }

  // Step 4: Setup environment files
  await setupEnvironmentFiles(destDir, config);

  // Step 5: Cleanup fullstack Docker files from sub-folders
  if (config.projectType === 'fullstack') {
    cleanupFullstackDockerFiles(destDir);
  }

  // Step 6: Create appsettings.Development.json for .NET
  if (config.projectType !== 'frontend' && config.backend === 'dotnet') {
    await createAppSettingsFromExample(destDir, config);
  }
}

/**
 * Copy shared files from the local monorepo.
 * Mirrors the logic in create-apptemplate/src/utils/download.ts copyRootFiles().
 */
async function copySharedFiles(destDir: string, config: ProjectConfig): Promise<void> {
  const sharedCommon = path.join(REPO_ROOT, 'shared', 'common');

  // Common files (all project types)
  fs.cpSync(sharedCommon, destDir, { recursive: true });

  if (config.projectType === 'fullstack') {
    // Docker infrastructure
    const nginxSrc = path.join(REPO_ROOT, 'shared', 'docker', 'nginx');
    const supervisorSrc = path.join(REPO_ROOT, 'shared', 'docker', 'supervisor');
    const nginxDest = path.join(destDir, 'docker', 'nginx');
    const supervisorDest = path.join(destDir, 'docker', 'supervisor');

    fs.mkdirSync(nginxDest, { recursive: true });
    fs.mkdirSync(supervisorDest, { recursive: true });
    fs.cpSync(nginxSrc, nginxDest, { recursive: true });
    fs.cpSync(supervisorSrc, supervisorDest, { recursive: true });

    // Backend-specific templates
    const templateSrc = path.join(REPO_ROOT, 'shared', 'templates', config.backend);

    copyFileIfExists(templateSrc, 'Dockerfile', destDir, 'Dockerfile');
    copyFileIfExists(templateSrc, 'docker-compose.yml', destDir, 'docker-compose.yml');
    copyFileIfExists(templateSrc, 'docker-compose.staging.yml', destDir, 'docker-compose.staging.yml');
    copyFileIfExists(templateSrc, 'docker-compose.production.yml', destDir, 'docker-compose.production.yml');
    copyFileIfExists(templateSrc, 'supervisord.conf', supervisorDest, 'supervisord.conf');
    copyFileIfExists(templateSrc, 'README.fullstack.md', destDir, 'README.md');
  } else if (!config.placeInRoot) {
    // Non-root backend-only or frontend-only: add multirepo README
    const backend = config.projectType === 'backend' ? config.backend : 'dotnet';
    const templateSrc = path.join(REPO_ROOT, 'shared', 'templates', backend);
    copyFileIfExists(templateSrc, 'README.multirepo.md', destDir, 'README.md');
  }
}

function copyFileIfExists(
  srcDir: string,
  srcName: string,
  destDir: string,
  destName: string,
): void {
  const srcPath = path.join(srcDir, srcName);
  if (fs.existsSync(srcPath)) {
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(srcPath, path.join(destDir, destName));
  }
}

/**
 * Setup environment files.
 * Mirrors setupEnvironmentFiles() from generator.ts.
 */
async function setupEnvironmentFiles(destDir: string, config: ProjectConfig): Promise<void> {
  // Frontend .env
  if (config.projectType !== 'backend') {
    let frontendDir: string;
    if (config.projectType === 'fullstack') {
      frontendDir = path.join(destDir, 'frontend');
    } else {
      frontendDir = config.placeInRoot ? destDir : path.join(destDir, 'frontend');
    }

    const envExample = path.join(frontendDir, '.env.example');
    const envDest = path.join(frontendDir, '.env');

    if (fs.existsSync(envExample) && !fs.existsSync(envDest)) {
      fs.copyFileSync(envExample, envDest);

      if (config.projectType === 'fullstack') {
        let content = fs.readFileSync(envDest, 'utf-8');
        let backendType = 'dotnet';
        if (config.backend === 'nestjs') backendType = 'nest';
        if (config.backend === 'spring') backendType = 'spring';
        content = content.replace(/^VITE_BACKEND_TYPE=.*$/m, `VITE_BACKEND_TYPE=${backendType}`);
        fs.writeFileSync(envDest, content);
      }
    }
  }

  // Backend .env
  if (config.projectType !== 'frontend') {
    let backendDir: string;
    if (config.projectType === 'fullstack') {
      backendDir = path.join(destDir, 'backend');
    } else {
      backendDir = config.placeInRoot ? destDir : path.join(destDir, 'backend');
    }

    if (config.backend === 'nestjs') {
      const envExample = path.join(backendDir, '.env.example');
      const envDest = path.join(backendDir, '.env');
      if (fs.existsSync(envExample) && !fs.existsSync(envDest)) {
        fs.copyFileSync(envExample, envDest);
      }
    }

    if (config.backend === 'spring') {
      const ymlExample = path.join(backendDir, 'api', 'src', 'main', 'resources', 'application.example.yml');
      const ymlDest = path.join(backendDir, 'api', 'src', 'main', 'resources', 'application.yml');
      if (fs.existsSync(ymlExample) && !fs.existsSync(ymlDest)) {
        fs.copyFileSync(ymlExample, ymlDest);
      }
    }
  }
}

function cleanupFullstackDockerFiles(destDir: string): void {
  const filesToDelete = [
    'backend/Dockerfile',
    'backend/docker-compose.yml',
    'frontend/Dockerfile',
    'frontend/docker-compose.yml',
  ];

  for (const file of filesToDelete) {
    const filePath = path.join(destDir, file);
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath);
    }
  }
}

async function createAppSettingsFromExample(destDir: string, config: ProjectConfig): Promise<void> {
  let backendDir: string;
  if (config.projectType === 'fullstack') {
    backendDir = path.join(destDir, 'backend');
  } else if (config.placeInRoot) {
    backendDir = destDir;
  } else {
    backendDir = path.join(destDir, 'backend');
  }

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
 * Convert a MatrixEntry to a ProjectConfig suitable for generation.
 */
export function entryToConfig(entry: MatrixEntry, destDir: string): ProjectConfig {
  return {
    projectPath: destDir,
    projectType: entry.projectType,
    backend: entry.backend ?? 'dotnet',
    architecture: entry.architecture ?? 'clean',
    frontendFramework: entry.frontendFramework ?? 'vue',
    ui: entry.ui ?? 'vuetify',
    projectName: entry.backend === 'spring' || entry.backend === 'dotnet'
      ? 'Test.App'
      : undefined,
    installDeps: false,
    placeInRoot: false,
    variant: entry.variant,
  };
}

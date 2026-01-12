import spawn from 'cross-spawn';
import path from 'path';
import fs from 'fs';
import type { ProjectConfig } from '../types.js';

type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

/**
 * Detect which package manager is being used
 */
export function detectPackageManager(): PackageManager {
  // Check for lockfiles in current directory
  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, 'bun.lockb'))) return 'bun';
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(cwd, 'package-lock.json'))) return 'npm';

  // Check npm_config_user_agent environment variable
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent) {
    if (userAgent.includes('bun')) return 'bun';
    if (userAgent.includes('pnpm')) return 'pnpm';
    if (userAgent.includes('yarn')) return 'yarn';
  }

  // Default to npm
  return 'npm';
}

/**
 * Install dependencies for the project
 */
export async function installDependencies(projectPath: string, config: ProjectConfig): Promise<void> {
  const pm = detectPackageManager();

  // Determine frontend directory
  let frontendDir: string;
  if (config.projectType === 'fullstack') {
    frontendDir = path.join(projectPath, 'frontend');
  } else if (config.placeInRoot) {
    frontendDir = projectPath;
  } else {
    frontendDir = path.join(projectPath, 'frontend');
  }

  // Determine backend directory
  let backendDir: string;
  if (config.projectType === 'fullstack') {
    backendDir = path.join(projectPath, 'backend');
  } else if (config.placeInRoot) {
    backendDir = projectPath;
  } else {
    backendDir = path.join(projectPath, 'backend');
  }

  // Install frontend dependencies
  if (config.projectType !== 'backend') {
    const frontendPackageJson = path.join(frontendDir, 'package.json');
    if (fs.existsSync(frontendPackageJson)) {
      await runInstallCommand(frontendDir, pm);
    }
  }

  // Install/restore backend dependencies
  if (config.projectType !== 'frontend') {
    switch (config.backend) {
      case 'dotnet': {
        const slnFiles = fs.readdirSync(backendDir).filter(f => f.endsWith('.sln'));
        if (slnFiles.length > 0) {
          await runCommand('dotnet', ['restore'], backendDir);
        }
        break;
      }
      case 'spring': {
        const pomPath = path.join(backendDir, 'pom.xml');
        if (fs.existsSync(pomPath)) {
          const mvnwPath = path.join(backendDir, process.platform === 'win32' ? 'mvnw.cmd' : 'mvnw');
          if (fs.existsSync(mvnwPath)) {
            await runCommand(mvnwPath, ['install', '-DskipTests'], backendDir);
          } else {
            await runCommand('mvn', ['install', '-DskipTests'], backendDir);
          }
        }
        break;
      }
      case 'nestjs': {
        const backendPackageJson = path.join(backendDir, 'package.json');
        if (fs.existsSync(backendPackageJson)) {
          await runInstallCommand(backendDir, pm);
        }
        break;
      }
    }
  }
}

/**
 * Run package manager install command
 */
async function runInstallCommand(cwd: string, pm: PackageManager): Promise<void> {
  const installCommands: Record<PackageManager, string[]> = {
    npm: ['install'],
    yarn: ['install'],
    pnpm: ['install'],
    bun: ['install'],
  };

  await runCommand(pm, installCommands[pm], cwd);
}

/**
 * Run a command in a directory
 */
function runCommand(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: process.platform === 'win32',
    });

    let stderr = '';

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Check if a command exists
 */
export function commandExists(command: string): boolean {
  try {
    const result = spawn.sync(command, ['--version'], {
      stdio: 'pipe',
      shell: process.platform === 'win32',
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

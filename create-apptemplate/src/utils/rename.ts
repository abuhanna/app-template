import path from 'path';
import fs from 'fs';
import type { ProjectConfig } from '../types.js';

/**
 * Rename project files and update namespaces
 * Only called when config.projectName is set (for dotnet/spring backends)
 */
export async function renameProject(projectPath: string, config: ProjectConfig): Promise<void> {
  if (!config.projectName) return;

  const newDotName = config.projectName;
  const newNamespace = config.projectName.replace(/\./g, '');

  // Rename backend project files (for .NET)
  if (config.projectType !== 'frontend' && config.backend === 'dotnet') {
    await renameDotNetProject(projectPath, config, newDotName, newNamespace);
  }

  // Rename backend project files (for Spring)
  if (config.projectType !== 'frontend' && config.backend === 'spring') {
    await renameSpringProject(projectPath, config, newDotName);
  }

  // Update common files
  await updateCommonFiles(projectPath, config, newDotName, newNamespace);
}

/**
 * Rename .NET project structure
 */
async function renameDotNetProject(
  projectPath: string,
  config: ProjectConfig,
  newDotName: string,
  newNamespace: string
): Promise<void> {
  // Determine backend directory based on project type and placeInRoot option
  let backendDir: string;
  if (config.projectType === 'fullstack') {
    backendDir = path.join(projectPath, 'backend');
  } else if (config.placeInRoot) {
    backendDir = projectPath;
  } else {
    backendDir = path.join(projectPath, 'backend');
  }

  if (!fs.existsSync(backendDir)) return;

  // Define folder mappings
  const folderMappings = [
    ['src/Core/App.Template.Domain', `src/Core/${newDotName}.Domain`],
    ['src/Core/App.Template.Application', `src/Core/${newDotName}.Application`],
    ['src/Infrastructure/App.Template.Infrastructure', `src/Infrastructure/${newDotName}.Infrastructure`],
    ['src/Presentation/App.Template.WebAPI', `src/Presentation/${newDotName}.WebAPI`],
    ['tests/App.Template.Domain.Tests', `tests/${newDotName}.Domain.Tests`],
    ['tests/App.Template.Application.Tests', `tests/${newDotName}.Application.Tests`],
  ];

  // Rename folders
  for (const [oldFolder, newFolder] of folderMappings) {
    const oldPath = path.join(backendDir, oldFolder);
    const newPath = path.join(backendDir, newFolder);

    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }
  }

  // Rename .csproj files
  await renameFilesWithPattern(backendDir, /App\.Template\.(.*)\.csproj$/, (match) => {
    return `${newDotName}.${match[1]}.csproj`;
  });

  // Rename solution file
  const oldSlnPath = path.join(backendDir, 'App.Template.sln');
  const newSlnPath = path.join(backendDir, `${newDotName}.sln`);
  if (fs.existsSync(oldSlnPath)) {
    fs.renameSync(oldSlnPath, newSlnPath);
  }

  // Update file contents in all relevant files
  const extensions = ['.cs', '.csproj', '.sln', '.json'];
  await updateFileContents(backendDir, extensions, (content) => {
    return content
      .replace(/App\.Template/g, newDotName)
      .replace(/AppTemplate/g, newNamespace);
  });
}

/**
 * Rename Spring Boot project structure
 */
async function renameSpringProject(
  projectPath: string,
  config: ProjectConfig,
  newDotName: string
): Promise<void> {
  // Determine backend directory based on project type and placeInRoot option
  let backendDir: string;
  if (config.projectType === 'fullstack') {
    backendDir = path.join(projectPath, 'backend');
  } else if (config.placeInRoot) {
    backendDir = projectPath;
  } else {
    backendDir = path.join(projectPath, 'backend');
  }

  if (!fs.existsSync(backendDir)) return;

  // Convert project name to Java package format
  const packageName = newDotName.toLowerCase().replace(/\./g, '.');
  const artifactId = newDotName.toLowerCase().replace(/\./g, '-');

  // Update pom.xml
  const pomPath = path.join(backendDir, 'pom.xml');
  if (fs.existsSync(pomPath)) {
    let content = fs.readFileSync(pomPath, 'utf-8');
    content = content
      .replace(/<groupId>com\.apptemplate<\/groupId>/g, `<groupId>${packageName}<\/groupId>`)
      .replace(/<artifactId>apptemplate<\/artifactId>/g, `<artifactId>${artifactId}<\/artifactId>`)
      .replace(/com\.apptemplate/g, packageName);
    fs.writeFileSync(pomPath, content);
  }

  // Update Java files
  await updateFileContents(backendDir, ['.java'], (content) => {
    return content.replace(/com\.apptemplate/g, packageName);
  });
}

/**
 * Update common files (Dockerfile, docker-compose, etc.)
 */
async function updateCommonFiles(
  projectPath: string,
  _config: ProjectConfig,
  newDotName: string,
  newNamespace: string
): Promise<void> {
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

  for (const file of filesToUpdate) {
    const filePath = path.join(projectPath, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      content = content
        .replace(/App\.Template/g, newDotName)
        .replace(/AppTemplate/g, newNamespace)
        .replace(/apptemplate/gi, newNamespace.toLowerCase());
      fs.writeFileSync(filePath, content);
    }
  }
}

/**
 * Rename files matching a pattern in a directory
 */
async function renameFilesWithPattern(
  dir: string,
  pattern: RegExp,
  replacer: (match: RegExpMatchArray) => string
): Promise<void> {
  const files = getAllFiles(dir);

  for (const file of files) {
    const fileName = path.basename(file);
    const match = fileName.match(pattern);

    if (match) {
      const newFileName = replacer(match);
      const newPath = path.join(path.dirname(file), newFileName);
      fs.renameSync(file, newPath);
    }
  }
}

/**
 * Update file contents in a directory
 */
async function updateFileContents(
  dir: string,
  extensions: string[],
  updater: (content: string) => string
): Promise<void> {
  const files = getAllFiles(dir);

  for (const file of files) {
    const ext = path.extname(file);
    if (extensions.includes(ext)) {
      let content = fs.readFileSync(file, 'utf-8');
      const updatedContent = updater(content);
      if (content !== updatedContent) {
        fs.writeFileSync(file, updatedContent);
      }
    }
  }
}

/**
 * Get all files in a directory recursively
 */
function getAllFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and other common directories
      if (!['node_modules', '.git', 'bin', 'obj', 'dist', 'build'].includes(entry.name)) {
        files.push(...getAllFiles(fullPath));
      }
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

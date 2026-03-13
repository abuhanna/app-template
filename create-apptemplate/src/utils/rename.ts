import path from 'path';
import fs from 'fs';
import type { ProjectConfig } from '../types.js';

/**
 * Convert a kebab/snake-case string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

/**
 * Rename project files and update namespaces
 * Called when config.projectName is set (for dotnet/spring/nestjs backends)
 * or when a frontend is present (to rename UI branding)
 */
export async function renameProject(projectPath: string, config: ProjectConfig): Promise<void> {
  const newDotName = config.projectName || '';
  const newNamespace = newDotName.replace(/\./g, '');

  // Rename backend project files (requires projectName)
  if (newDotName && config.projectType !== 'frontend') {
    if (config.backend === 'dotnet') {
      await renameDotNetProject(projectPath, config, newDotName, newNamespace);
    }
    if (config.backend === 'spring') {
      await renameSpringProject(projectPath, config, newDotName);
    }
    if (config.backend === 'nestjs') {
      await renameNestJsProject(projectPath, config, newDotName, newNamespace);
    }
  }

  // Rename frontend project files (uses projectName or derives from directory)
  if (config.projectType !== 'backend') {
    const dirName = path.basename(projectPath);
    const displayName = newNamespace || toPascalCase(dirName);
    const pkgName = newNamespace ? newNamespace.toLowerCase() : dirName;
    await renameFrontendProject(projectPath, config, displayName, pkgName);
  }

  // Update common files (requires projectName)
  if (newDotName) {
    await updateCommonFiles(projectPath, config, newDotName, newNamespace);
  }
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
    // Clean architecture (multi-project layout)
    ['src/Core/App.Template.Domain', `src/Core/${newDotName}.Domain`],
    ['src/Core/App.Template.Application', `src/Core/${newDotName}.Application`],
    ['src/Infrastructure/App.Template.Infrastructure', `src/Infrastructure/${newDotName}.Infrastructure`],
    ['src/Presentation/App.Template.WebAPI', `src/Presentation/${newDotName}.WebAPI`],
    ['tests/App.Template.Domain.Tests', `tests/${newDotName}.Domain.Tests`],
    ['tests/App.Template.Application.Tests', `tests/${newDotName}.Application.Tests`],
    ['tests/App.Template.WebAPI.Tests', `tests/${newDotName}.WebAPI.Tests`],
    // Feature and NLayer architectures (single-project layout)
    ['src/App.Template.Api', `src/${newDotName}.Api`],
    ['tests/App.Template.Api.Tests', `tests/${newDotName}.Api.Tests`],
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
 * Rename a Java package root directory and clean up empty parent directories.
 *
 * Edge cases handled:
 * - oldDir does not exist: no-op
 * - oldDir === newDir (same resolved path): no-op
 * - newDir already exists: merge contents entry-by-entry then remove oldDir
 * - Intermediate parent directories for newDir are created automatically
 * - Empty ancestor directories of oldDir (up to but not including java/) are removed
 */
function renameJavaPackageDir(oldDir: string, newDir: string): void {
  if (!fs.existsSync(oldDir)) return;

  const resolvedOld = path.resolve(oldDir);
  const resolvedNew = path.resolve(newDir);
  if (resolvedOld === resolvedNew) return;

  if (fs.existsSync(resolvedNew)) {
    // Merge: move every entry from oldDir into existing newDir
    for (const entry of fs.readdirSync(resolvedOld, { withFileTypes: true })) {
      fs.renameSync(
        path.join(resolvedOld, entry.name),
        path.join(resolvedNew, entry.name)
      );
    }
    fs.rmdirSync(resolvedOld);
  } else {
    // Simple rename: ensure parent directory exists first
    fs.mkdirSync(path.dirname(resolvedNew), { recursive: true });
    fs.renameSync(resolvedOld, resolvedNew);
  }

  // Remove now-empty ancestor directories up to but not including the java/ root
  // (e.g., leftover com/ after moving com/apptemplate/ to mycompany/myapp/)
  let current = path.dirname(resolvedOld);
  while (path.basename(current) !== 'java') {
    if (!fs.existsSync(current)) break;
    try {
      const remaining = fs.readdirSync(current);
      if (remaining.length === 0) {
        fs.rmdirSync(current);
        current = path.dirname(current);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
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

  // Derive naming variants from user input (e.g. "MyCompany.MyApp")
  const packageName = newDotName.toLowerCase().replace(/\./g, '.'); // mycompany.myapp
  const artifactId  = newDotName.toLowerCase().replace(/\./g, '-'); // mycompany-myapp
  const pkgPath     = newDotName.toLowerCase().replace(/\./g, '/'); // mycompany/myapp
  const compactName = newDotName.replace(/\./g, '').toLowerCase();  // mycompanymyapp
  const displayName = newDotName.replace(/\./g, '');                // MyCompanyMyApp

  const isClean = config.architecture === 'clean';

  // Step 1: Update ALL XML files (root pom.xml + all module pom.xml files)
  // Clean arch has 5 pom.xml files (root + api, application, domain, infrastructure)
  await updateFileContents(backendDir, ['.xml'], (content) => {
    return content
      .replace(/<artifactId>app-template<\/artifactId>/g, `<artifactId>${artifactId}</artifactId>`)
      .replace(/com\.apptemplate/g, packageName)
      .replace(/AppTemplate/g, displayName);
  });

  // Step 2: Update YAML and properties config files (application.example.yml etc.)
  await updateFileContents(backendDir, ['.yml', '.yaml', '.properties'], (content) => {
    if (isClean) {
      // Clean arch uses bare "apptemplate" (no com. prefix) in logging keys and config
      // Order matters: specific patterns first, then word-boundary catch-all
      return content
        .replace(/AppTemplate/g, displayName)
        .replace(/apptemplate\.local/g, `${compactName}.local`)
        .replace(/apptemplate_(\w+)/g, `${compactName}_$1`)
        .replace(/\bapptemplate\b/g, packageName);
    } else {
      return content
        .replace(/AppTemplate/g, displayName)
        .replace(/com\.apptemplate/g, packageName);
    }
  });

  // Step 3: Update Java source file contents
  await updateFileContents(backendDir, ['.java'], (content) => {
    if (isClean) {
      // Clean arch packages: apptemplate.api, apptemplate.domain, etc. (no com. prefix)
      return content
        .replace(/AppTemplate/g, displayName)
        .replace(/apptemplate\.local/g, `${compactName}.local`)
        .replace(/\bapptemplate\b/g, packageName);
    } else {
      // Feature/NLayer packages: com.apptemplate.api.*
      return content
        .replace(/AppTemplate/g, displayName)
        .replace(/com\.apptemplate/g, packageName);
    }
  });

  // Step 5: Rename AppTemplateApplication.java files (clean arch only)
  if (isClean) {
    await renameFilesWithPattern(backendDir, /^AppTemplate(.*)\.java$/, (match) => {
      return `${displayName}${match[1]}.java`;
    });
  }

  // Step 4: Rename Java source directories to match the new package structure
  // (Must run after content updates so getAllFiles() can walk original paths)
  if (isClean) {
    // Clean arch: each module has its own java/apptemplate/ root
    const modules = ['api', 'application', 'domain', 'infrastructure'];
    for (const module of modules) {
      for (const sourceRoot of ['src/main/java', 'src/test/java']) {
        const oldDir = path.join(backendDir, module, sourceRoot, 'apptemplate');
        const newDir = path.join(backendDir, module, sourceRoot, pkgPath);
        renameJavaPackageDir(oldDir, newDir);
      }
    }
  } else {
    // Feature/NLayer: single project with src/main/java/com/apptemplate/
    for (const sourceRoot of ['src/main/java', 'src/test/java']) {
      const oldDir = path.join(backendDir, sourceRoot, 'com', 'apptemplate');
      const newDir = path.join(backendDir, sourceRoot, ...packageName.split('.'));
      renameJavaPackageDir(oldDir, newDir);
    }
  }
}

/**
 * Rename NestJS project structure
 */
async function renameNestJsProject(
  projectPath: string,
  config: ProjectConfig,
  newDotName: string,
  newNamespace: string
): Promise<void> {
  let backendDir: string;
  if (config.projectType === 'fullstack') {
    backendDir = path.join(projectPath, 'backend');
  } else if (config.placeInRoot) {
    backendDir = projectPath;
  } else {
    backendDir = path.join(projectPath, 'backend');
  }

  if (!fs.existsSync(backendDir)) return;

  const compactName = newNamespace.toLowerCase(); // acmesalesportal
  const artifactId = newDotName.toLowerCase().replace(/\./g, '-'); // acme-salesportal

  // Update package.json
  const pkgPath = path.join(backendDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    let content = fs.readFileSync(pkgPath, 'utf-8');
    content = content
      .replace(/apptemplate-backend/g, `${artifactId}-backend`)
      .replace(/AppTemplate/g, newNamespace);
    fs.writeFileSync(pkgPath, content);
  }

  // Update TypeScript source files
  await updateFileContents(backendDir, ['.ts'], (content) => {
    return content
      .replace(/AppTemplate/g, newNamespace)
      .replace(/App Template/g, newNamespace)
      .replace(/apptemplate_(\w+)/g, `${compactName}_$1`)
      .replace(/apptemplate\.local/g, `${compactName}.local`)
      .replace(/apptemplate\.com/g, `${compactName}.com`)
      .replace(/'apptemplate'/g, `'${compactName}'`);
  });
}

/**
 * Rename frontend project branding
 */
async function renameFrontendProject(
  projectPath: string,
  config: ProjectConfig,
  displayName: string,
  pkgName: string
): Promise<void> {
  let frontendDir: string;
  if (config.projectType === 'fullstack') {
    frontendDir = path.join(projectPath, 'frontend');
  } else if (config.placeInRoot) {
    frontendDir = projectPath;
  } else {
    frontendDir = path.join(projectPath, 'frontend');
  }

  if (!fs.existsSync(frontendDir)) return;

  // Update package.json name
  const pkgJsonPath = path.join(frontendDir, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    let content = fs.readFileSync(pkgJsonPath, 'utf-8');
    // For fullstack: "acmesalesportal-frontend"; for frontend-only: use dir name as-is
    const newPkgName = config.projectType === 'fullstack' ? `${pkgName}-frontend` : pkgName;
    content = content.replace(/apptemplate-frontend/g, newPkgName);
    fs.writeFileSync(pkgJsonPath, content);
  }

  // Update UI branding in source files
  const frontendExts = ['.vue', '.js', '.ts', '.tsx', '.jsx'];
  await updateFileContents(frontendDir, frontendExts, (content) => {
    return content
      .replace(/AppTemplate/g, displayName)
      .replace(/App Template/g, displayName);
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
      if (!['node_modules', '.git', 'bin', 'obj', 'dist', 'build', 'target'].includes(entry.name)) {
        files.push(...getAllFiles(fullPath));
      }
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

import * as p from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import fs from 'fs';
import type { CLIArgs, ProjectConfig, ProjectType, BackendFramework, UILibrary } from './types.js';

export async function runInteractivePrompts(cliArgs: CLIArgs): Promise<ProjectConfig | symbol> {
  // Project path
  let projectPath = cliArgs.projectPath;
  if (!projectPath) {
    const result = await p.text({
      message: 'Where should we create your project?',
      placeholder: './my-app',
      defaultValue: './my-app',
      validate: (value) => {
        if (!value) return 'Please enter a directory path';
        const resolvedPath = path.resolve(value);
        if (fs.existsSync(resolvedPath) && fs.readdirSync(resolvedPath).length > 0) {
          return 'Directory exists and is not empty';
        }
        return undefined;
      },
    });
    if (p.isCancel(result)) return result;
    projectPath = result;
  }

  // Project type
  let projectType = cliArgs.type;
  if (!projectType) {
    const result = await p.select({
      message: 'What type of project would you like to create?',
      options: [
        {
          value: 'fullstack' as ProjectType,
          label: 'Fullstack',
          hint: 'Backend + Frontend + Docker',
        },
        {
          value: 'backend' as ProjectType,
          label: 'Backend only',
          hint: 'API service or microservice',
        },
        {
          value: 'frontend' as ProjectType,
          label: 'Frontend only',
          hint: 'SPA with external API',
        },
      ],
    });
    if (p.isCancel(result)) return result;
    projectType = result;
  }

  // Backend framework (skip for frontend-only)
  let backend: BackendFramework = cliArgs.backend || 'dotnet';
  if (projectType !== 'frontend' && !cliArgs.backend) {
    const result = await p.select({
      message: 'Which backend framework would you like to use?',
      options: [
        {
          value: 'dotnet' as BackendFramework,
          label: '.NET 8',
          hint: 'Clean Architecture, CQRS, Entity Framework',
        },
        {
          value: 'spring' as BackendFramework,
          label: 'Spring Boot 3',
          hint: 'Clean Architecture, Java 21',
        },
        {
          value: 'nestjs' as BackendFramework,
          label: 'NestJS',
          hint: 'Clean Architecture, TypeScript',
        },
      ],
    });
    if (p.isCancel(result)) return result;
    backend = result;
  }

  // UI library (skip for backend-only)
  let ui: UILibrary = cliArgs.ui || 'vuetify';
  if (projectType !== 'backend' && !cliArgs.ui) {
    const result = await p.select({
      message: 'Which UI library would you like to use?',
      options: [
        {
          value: 'vuetify' as UILibrary,
          label: 'Vuetify',
          hint: 'Material Design 3, 80+ components',
        },
        {
          value: 'primevue' as UILibrary,
          label: 'PrimeVue',
          hint: 'Aura theme, 90+ components',
        },
      ],
    });
    if (p.isCancel(result)) return result;
    ui = result;
  }

  // Project name (for namespaces) - only for dotnet/spring backends
  let projectName: string | undefined = cliArgs.projectName;
  const needsNamespace = projectType !== 'frontend' && (backend === 'dotnet' || backend === 'spring');

  if (needsNamespace && !projectName) {
    // Generate default name from project path
    const dirName = path.basename(path.resolve(projectPath));
    const defaultName = `MyCompany.${toPascalCase(dirName)}`;

    const result = await p.text({
      message: 'Project namespace (for .NET/Java packages)',
      placeholder: defaultName,
      defaultValue: defaultName,
      validate: (value) => {
        if (!value) return 'Please enter a project namespace';
        const pattern = /^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$/;
        if (!pattern.test(value)) {
          return 'Namespace must be in "Company.Project" format (e.g., MyCompany.MyApp)';
        }
        return undefined;
      },
    });
    if (p.isCancel(result)) return result;
    projectName = result;
  }

  // Place in root option (for backend-only or frontend-only)
  let placeInRoot = cliArgs.root ?? false;
  if (projectType !== 'fullstack' && cliArgs.root === undefined) {
    const result = await p.confirm({
      message: 'Place files directly in project root? (No for subfolder)',
      initialValue: false,
    });
    if (p.isCancel(result)) return result;
    placeInRoot = result;
  }

  // Install dependencies
  let installDeps = cliArgs.install ?? false;
  if (cliArgs.install === undefined) {
    const result = await p.confirm({
      message: 'Install dependencies after creation?',
      initialValue: true,
    });
    if (p.isCancel(result)) return result;
    installDeps = result;
  }

  // Show summary
  console.log();
  const summaryLines = [
    `${pc.cyan('Project path:')}     ${projectPath}`,
    `${pc.cyan('Project type:')}     ${projectType}`,
  ];

  if (projectType !== 'frontend') {
    summaryLines.push(`${pc.cyan('Backend:')}          ${getBackendLabel(backend)}`);
  }
  if (projectType !== 'backend') {
    summaryLines.push(`${pc.cyan('UI Library:')}       ${getUILabel(ui)}`);
  }
  if (needsNamespace && projectName) {
    summaryLines.push(`${pc.cyan('Namespace:')}        ${projectName}`);
  }
  if (projectType !== 'fullstack') {
    summaryLines.push(`${pc.cyan('Place in root:')}    ${placeInRoot ? 'Yes' : 'No (subfolder)'}`);
  }
  summaryLines.push(`${pc.cyan('Install deps:')}     ${installDeps ? 'Yes' : 'No'}`);

  p.note(summaryLines.join('\n'), 'Configuration');

  const shouldContinue = await p.confirm({
    message: 'Create project with these settings?',
    initialValue: true,
  });
  if (p.isCancel(shouldContinue) || !shouldContinue) {
    return p.isCancel(shouldContinue) ? shouldContinue : Symbol('cancelled');
  }

  return {
    projectPath,
    projectType,
    backend,
    ui,
    projectName,
    installDeps,
    placeInRoot,
  };
}

function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());
}

function getBackendLabel(backend: BackendFramework): string {
  const labels: Record<BackendFramework, string> = {
    dotnet: '.NET 8',
    spring: 'Spring Boot 3',
    nestjs: 'NestJS',
  };
  return labels[backend];
}

function getUILabel(ui: UILibrary): string {
  const labels: Record<UILibrary, string> = {
    vuetify: 'Vuetify (Material Design)',
    primevue: 'PrimeVue (Aura Theme)',
  };
  return labels[ui];
}

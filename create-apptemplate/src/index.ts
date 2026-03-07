import { intro, outro, isCancel, log, note } from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import { createRequire } from 'node:module';
import { parseArgs, validateFrameworkUiPairing } from './cli.js';
import { runInteractivePrompts, getBackendLabel, getArchitectureLabel, getFrontendLabel, getUILabel } from './prompts.js';
import { generateProject } from './generator.js';
import { formatUserError } from './utils/errors.js';
import type { ProjectConfig, FrontendFramework } from './types.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

async function main(): Promise<void> {
  console.log();
  intro(pc.bgCyan(pc.black(' Create AppTemplate ')));

  try {
    // Parse CLI arguments
    const cliArgs = parseArgs();

    // Show help if requested
    if (cliArgs.help) {
      showHelp();
      process.exit(0);
    }

    // Show version if requested
    if (cliArgs.version) {
      console.log(`create-apptemplate v${version}`);
      process.exit(0);
    }

    // Get project configuration (interactive or from CLI args)
    let config: ProjectConfig;

    // Non-interactive mode - check if we have enough options
    const projectType = cliArgs.type || 'fullstack';
    const backend = cliArgs.backend || 'dotnet';
    const needsNamespace = projectType !== 'frontend' && (backend === 'dotnet' || backend === 'spring');

    if (cliArgs.projectPath && cliArgs.backend && (!needsNamespace || cliArgs.projectName)) {
      // Non-interactive mode - all required options provided
      const frontendFramework = cliArgs.framework || 'vue';
      const architecture = cliArgs.architecture || 'clean';
      const ui = cliArgs.ui || (frontendFramework === 'vue' ? 'vuetify' : 'mui');

      // Validate framework + UI pairing for projects with frontend
      if (projectType !== 'backend') {
        const uiError = validateFrameworkUiPairing(frontendFramework as FrontendFramework, ui);
        if (uiError) {
          throw new Error(uiError);
        }
      }

      config = {
        projectPath: cliArgs.projectPath,
        projectType,
        backend,
        architecture,
        frontendFramework,
        ui,
        projectName: cliArgs.projectName,
        installDeps: cliArgs.install || false,
        placeInRoot: cliArgs.root || false,
        variant: cliArgs.variant || 'full',
      };
    } else {
      // Interactive mode
      const result = await runInteractivePrompts(cliArgs);
      if (isCancel(result)) {
        outro(pc.yellow('Operation cancelled'));
        process.exit(0);
      }
      config = result;
    }

    // Generate the project
    const genStart = Date.now();
    await generateProject(config);
    const totalTime = ((Date.now() - genStart) / 1000).toFixed(1);

    // Success message + summary
    console.log();
    outro(pc.green(`Done! Project created in ${totalTime}s`));

    // Show rich summary and next steps
    showProjectSummary(config, totalTime);
    showNextSteps(config);
  } catch (error) {
    log.error(pc.red(formatUserError(error)));
    process.exit(1);
  }
}

function showHelp(): void {
  console.log(`
${pc.bold('Usage:')}
  ${pc.cyan('npm create apptemplate@latest')} ${pc.gray('[project-directory]')} ${pc.gray('[options]')}

${pc.bold('Options:')}
  ${pc.yellow('-t, --type')}         Project type: fullstack, backend, frontend ${pc.gray('(default: fullstack)')}
  ${pc.yellow('-b, --backend')}      Backend framework: dotnet, spring, nestjs
  ${pc.yellow('-a, --architecture')} Architecture: clean, nlayer, feature ${pc.gray('(default: clean)')}
  ${pc.yellow('-f, --framework')}    Frontend framework: vue, react ${pc.gray('(default: vue)')}
  ${pc.yellow('-u, --ui')}           UI library: vuetify, primevue (Vue) | mui, primereact (React)
  ${pc.yellow('-n, --name')}         Project namespace (Company.Project format, .NET/Spring only)
  ${pc.yellow('-r, --root')}         Place files in project root ${pc.gray('(backend/frontend-only)')}
  ${pc.yellow('-V, --variant')}      Template variant: full, minimal ${pc.gray('(default: full)')}
                       full: All features (user management, departments, dashboard)
                       minimal: Auth, files, audit logs, notifications only
  ${pc.yellow('-i, --install')}      Install dependencies after creation
  ${pc.yellow('-h, --help')}         Show this help message
  ${pc.yellow('-v, --version')}      Show version number

${pc.bold('Examples:')}
  ${pc.gray('# Interactive mode')}
  npm create apptemplate@latest

  ${pc.gray('# Create fullstack project with .NET backend')}
  npm create apptemplate@latest my-app -b dotnet -n "MyCompany.MyApp" -i

  ${pc.gray('# Create minimal backend-only project (no user management)')}
  npm create apptemplate@latest my-api -t backend -b spring -n "MyCompany.MyApi" -V minimal

  ${pc.gray('# Create frontend-only project with PrimeVue')}
  npm create apptemplate@latest my-spa -t frontend -u primevue

  ${pc.gray('# Create fullstack project with React + MUI')}
  npm create apptemplate@latest my-app -b dotnet -f react -u mui -n "MyCompany.MyApp"

  ${pc.gray('# Create backend in project root (no subfolder)')}
  npm create apptemplate@latest my-api -t backend -b nestjs --root
`);
}

function showProjectSummary(config: ProjectConfig, totalTime: string): void {
  const lines: string[] = [];

  lines.push(`${pc.cyan('Path')}           ${path.resolve(config.projectPath)}`);
  lines.push(`${pc.cyan('Type')}           ${config.projectType}`);

  if (config.projectType !== 'frontend') {
    lines.push(`${pc.cyan('Backend')}        ${getBackendLabel(config.backend)} (${getArchitectureLabel(config.architecture)})`);
  }
  if (config.projectType !== 'backend') {
    lines.push(`${pc.cyan('Frontend')}       ${getFrontendLabel(config.frontendFramework)} + ${getUILabel(config.ui)}`);
  }

  lines.push(`${pc.cyan('Variant')}        ${config.variant}`);
  lines.push(`${pc.cyan('Dependencies')}   ${config.installDeps ? 'installed' : 'skipped'}`);
  if (config.projectName) {
    lines.push(`${pc.cyan('Namespace')}      ${config.projectName}`);
  }
  lines.push(`${pc.cyan('Generated in')}   ${totalTime}s`);

  note(lines.join('\n'), 'Project Created');
}

function showNextSteps(config: ProjectConfig): void {
  // Determine folder names based on project type and placeInRoot option
  let backendFolder: string;
  let frontendFolder: string;

  if (config.projectType === 'fullstack') {
    backendFolder = 'backend';
    frontendFolder = 'frontend';
  } else if (config.placeInRoot) {
    backendFolder = '.';
    frontendFolder = '.';
  } else {
    backendFolder = 'backend';
    frontendFolder = 'frontend';
  }

  // Quick start commands
  const commands: string[] = [];
  commands.push(`cd ${config.projectPath}`);

  // Install commands if deps weren't installed
  if (!config.installDeps) {
    if (config.projectType !== 'frontend') {
      const cdBackend = backendFolder === '.' ? '' : `cd ${backendFolder} && `;
      if (config.backend === 'dotnet') {
        commands.push(`${cdBackend}dotnet restore`);
      } else if (config.backend === 'nestjs') {
        commands.push(`${cdBackend}npm install`);
      } else if (config.backend === 'spring') {
        commands.push(`${cdBackend}./mvnw install -DskipTests`);
      }
    }
    if (config.projectType !== 'backend') {
      const cdFrontend = frontendFolder === '.' ? '' : `cd ${frontendFolder} && `;
      commands.push(`${cdFrontend}npm install`);
    }
  }

  // Run commands
  if (config.projectType !== 'frontend') {
    const cdBackend = backendFolder === '.' ? '' : `cd ${backendFolder} && `;
    if (config.backend === 'dotnet') {
      if (backendFolder === '.') {
        commands.push('cd src/Presentation/*.WebAPI && dotnet run');
      } else {
        commands.push(`cd ${backendFolder}/src/Presentation/*.WebAPI && dotnet run`);
      }
    } else if (config.backend === 'nestjs') {
      commands.push(`${cdBackend}npm run start:dev`);
    } else if (config.backend === 'spring') {
      commands.push(`${cdBackend}./mvnw spring-boot:run`);
    }
  }

  if (config.projectType !== 'backend') {
    const cdFrontend = frontendFolder === '.' ? '' : `cd ${frontendFolder} && `;
    commands.push(`${cdFrontend}npm run dev`);
  }

  log.step(pc.cyan('Quick start'));
  for (const cmd of commands) {
    log.message(`  ${pc.gray('$')} ${cmd}`);
  }

  // Docker option (for fullstack)
  if (config.projectType === 'fullstack') {
    console.log();
    log.step(pc.cyan('Docker'));
    log.message(`  ${pc.gray('$')} cp .env.example .env`);
    log.message(`  ${pc.gray('$')} docker compose up -d --build`);
  }

  // Access points + credentials in a single box
  const accessLines: string[] = [];

  if (config.projectType !== 'backend') {
    accessLines.push(`Frontend   ${pc.cyan('http://localhost:3000')}`);
  }
  if (config.projectType !== 'frontend') {
    accessLines.push(`Swagger    ${pc.cyan('http://localhost:5100/swagger')}`);
    accessLines.push('');
    accessLines.push(`Login      ${pc.cyan('admin')} / ${pc.cyan('Admin@123')}`);
  }

  if (accessLines.length > 0) {
    note(accessLines.join('\n'), 'Access');
  }

  console.log();
}

main();

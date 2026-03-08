import { intro, outro, isCancel, log, note } from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import { createRequire } from 'node:module';
import { parseArgs, validateFrameworkUiPairing, validateFlagCombinations } from './cli.js';
import { runInteractivePrompts, getBackendLabel, getArchitectureLabel, getFrontendLabel, getUILabel } from './prompts.js';
import { generateProject } from './generator.js';
import { formatUserError } from './utils/errors.js';
import type { ProjectConfig, FrontendFramework } from './types.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

async function main(): Promise<void> {
  // Parse CLI arguments early (before intro banner)
  const cliArgs = parseArgs();

  // Show help if requested (no banner needed)
  if (cliArgs.help) {
    showHelp();
    process.exit(0);
  }

  // Show version if requested (no banner needed)
  if (cliArgs.version) {
    console.log(`create-apptemplate v${version}`);
    process.exit(0);
  }

  const quiet = cliArgs.quiet || false;

  // Suppress @clack output in quiet mode
  const originalLog = console.log;
  const originalWarn = console.warn;
  if (quiet) {
    console.log = () => {};
    console.warn = () => {};
  }

  if (!quiet) {
    console.log();
    intro(pc.bgCyan(pc.black(' Create AppTemplate ')));
  }

  try {
    // Validate flag combinations
    const flagErrors = validateFlagCombinations(cliArgs);
    if (flagErrors.length > 0) {
      for (const err of flagErrors) {
        if (quiet) {
          originalLog(pc.red(`Error: ${err}`));
        } else {
          log.error(pc.red(err));
        }
      }
      process.exit(1);
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
      // Quiet mode requires non-interactive (all flags provided)
      if (quiet) {
        originalLog(pc.red('Error: --quiet requires all flags for non-interactive mode'));
        originalLog(pc.gray('Required: <project-path> --backend <framework> [--name <namespace> for dotnet/spring]'));
        process.exit(1);
      }
      // Interactive mode
      const result = await runInteractivePrompts(cliArgs);
      if (isCancel(result)) {
        outro(pc.yellow('Operation cancelled'));
        process.exit(0);
      }
      config = result;
    }

    // Dry-run mode: show what would be generated, then exit
    if (cliArgs.dryRun) {
      // Restore console for dry-run output (even in quiet mode)
      console.log = originalLog;
      console.warn = originalWarn;
      showDryRun(config);
      process.exit(0);
    }

    // Generate the project
    const genStart = Date.now();
    await generateProject(config);
    const totalTime = ((Date.now() - genStart) / 1000).toFixed(1);

    if (quiet) {
      // Restore console for final message
      console.log = originalLog;
      console.log(pc.green(`Done! Project created at ${path.resolve(config.projectPath)}`));
    } else {
      // Success message + summary
      console.log();
      outro(pc.green(`Done! Project created in ${totalTime}s`));

      // Show rich summary and next steps
      showProjectSummary(config, totalTime);
      showNextSteps(config);
    }
  } catch (error) {
    // Restore console for error output
    console.log = originalLog;
    console.warn = originalWarn;
    log.error(pc.red(formatUserError(error)));
    process.exit(1);
  }
}

function showHelp(): void {
  console.log(`
${pc.bold('Usage:')}
  ${pc.cyan('npm create apptemplate@latest')} ${pc.gray('[project-directory]')} ${pc.gray('[options]')}

${pc.bold('Options:')}
  ${pc.yellow('-t, --type')} ${pc.gray('<value>')}         Project type ${pc.gray('(default: fullstack)')}
                            Values: ${pc.cyan('fullstack')}, ${pc.cyan('backend')}, ${pc.cyan('frontend')}
  ${pc.yellow('-b, --backend')} ${pc.gray('<value>')}      Backend framework ${pc.gray('(required for non-interactive)')}
                            Values: ${pc.cyan('dotnet')}, ${pc.cyan('spring')}, ${pc.cyan('nestjs')}
  ${pc.yellow('-a, --architecture')} ${pc.gray('<value>')} Architecture pattern ${pc.gray('(default: clean)')}
                            Values: ${pc.cyan('clean')}, ${pc.cyan('nlayer')}, ${pc.cyan('feature')}
  ${pc.yellow('-f, --framework')} ${pc.gray('<value>')}    Frontend framework ${pc.gray('(default: vue)')}
                            Values: ${pc.cyan('vue')}, ${pc.cyan('react')}
  ${pc.yellow('-u, --ui')} ${pc.gray('<value>')}           UI library ${pc.gray('(default: vuetify for vue, mui for react)')}
                            Vue: ${pc.cyan('vuetify')}, ${pc.cyan('primevue')}
                            React: ${pc.cyan('mui')}, ${pc.cyan('primereact')}
  ${pc.yellow('-n, --name')} ${pc.gray('<value>')}         Project namespace in Company.Project format
                            Required for ${pc.cyan('dotnet')} and ${pc.cyan('spring')} backends
  ${pc.yellow('-V, --variant')} ${pc.gray('<value>')}      Template variant ${pc.gray('(default: full)')}
                            ${pc.cyan('full')}: Internal auth, user/dept management, all features
                            ${pc.cyan('minimal')}: External auth (SSO), no user/dept management
                            ${pc.cyan('zero')}: No authentication, all endpoints public
  ${pc.yellow('-r, --root')}                Place files in project root ${pc.gray('(backend/frontend-only)')}
  ${pc.yellow('-i, --install')}              Install dependencies after creation
  ${pc.yellow('-q, --quiet')}                Suppress output except errors ${pc.gray('(non-interactive only)')}
  ${pc.yellow('    --dry-run')}              Show what would be generated without creating files
  ${pc.yellow('-h, --help')}                 Show this help message
  ${pc.yellow('-v, --version')}              Show version number

${pc.bold('Examples:')}
  ${pc.gray('# Interactive mode (prompts for all options)')}
  npm create apptemplate@latest

  ${pc.gray('# Fullstack: .NET + Vue/Vuetify (defaults)')}
  npm create apptemplate@latest my-app -b dotnet -n "MyCompany.MyApp" -i

  ${pc.gray('# Fullstack: Spring Boot + React/MUI')}
  npm create apptemplate@latest my-app -b spring -f react -u mui -n "MyCompany.MyApp"

  ${pc.gray('# Backend-only: NestJS with feature architecture, placed in project root')}
  npm create apptemplate@latest my-api -t backend -b nestjs -a feature --root

  ${pc.gray('# Frontend-only: Vue + PrimeVue, minimal variant')}
  npm create apptemplate@latest my-spa -t frontend -f vue -u primevue -V minimal

  ${pc.gray('# Dry run: preview what would be generated')}
  npm create apptemplate@latest my-app -b dotnet -n "My.App" --dry-run

  ${pc.gray('# CI/CD: quiet mode with install')}
  npm create apptemplate@latest my-app -b nestjs -q -i

${pc.bold('Validation rules:')}
  ${pc.gray('•')} --type frontend cannot be combined with --backend, --architecture, or --name
  ${pc.gray('•')} --type backend cannot be combined with --framework or --ui
  ${pc.gray('•')} --root cannot be used with --type fullstack
  ${pc.gray('•')} --ui must be compatible with --framework (e.g., vue → vuetify/primevue)

${pc.bold('Docs:')} ${pc.cyan('https://github.com/abuhanna/app-template#readme')}
`);
}

function showDryRun(config: ProjectConfig): void {
  const absolutePath = path.resolve(config.projectPath);

  console.log();
  console.log(pc.bold(pc.cyan('  Dry Run — no files will be created')));
  console.log();

  // Resolved configuration
  console.log(pc.bold('  Configuration:'));
  console.log(`    ${pc.cyan('Path')}           ${absolutePath}`);
  console.log(`    ${pc.cyan('Type')}           ${config.projectType}`);

  if (config.projectType !== 'frontend') {
    console.log(`    ${pc.cyan('Backend')}        ${getBackendLabel(config.backend)} (${getArchitectureLabel(config.architecture)})`);
  }
  if (config.projectType !== 'backend') {
    console.log(`    ${pc.cyan('Frontend')}       ${getFrontendLabel(config.frontendFramework)} + ${getUILabel(config.ui)}`);
  }

  console.log(`    ${pc.cyan('Variant')}        ${config.variant}`);
  if (config.projectName) {
    console.log(`    ${pc.cyan('Namespace')}      ${config.projectName}`);
  }
  console.log(`    ${pc.cyan('Install deps')}   ${config.installDeps ? 'yes' : 'no'}`);
  console.log(`    ${pc.cyan('Place in root')}  ${config.placeInRoot ? 'yes' : 'no'}`);

  // Template source paths
  console.log();
  console.log(pc.bold('  Template sources (degit):'));
  const repo = 'abuhanna/app-template';

  if (config.projectType !== 'frontend') {
    const backendSrc = `${repo}/backend/${config.backend}/${config.architecture}-architecture/${config.variant}`;
    const backendDest = config.projectType === 'fullstack'
      ? path.join(absolutePath, 'backend')
      : config.placeInRoot ? absolutePath : path.join(absolutePath, 'backend');
    console.log(`    ${pc.green('↓')} ${pc.gray(backendSrc)}`);
    console.log(`      ${pc.cyan('→')} ${backendDest}`);
  }

  if (config.projectType !== 'backend') {
    const frontendSrc = `${repo}/frontend/${config.frontendFramework}/${config.ui}/${config.variant}`;
    const frontendDest = config.projectType === 'fullstack'
      ? path.join(absolutePath, 'frontend')
      : config.placeInRoot ? absolutePath : path.join(absolutePath, 'frontend');
    console.log(`    ${pc.green('↓')} ${pc.gray(frontendSrc)}`);
    console.log(`      ${pc.cyan('→')} ${frontendDest}`);
  }

  // Namespace transformations
  if (config.projectName && config.projectName !== 'App.Template') {
    console.log();
    console.log(pc.bold('  Namespace transformations:'));
    console.log(`    ${pc.gray('App.Template')}      ${pc.cyan('→')} ${config.projectName}`);
    const kebab = config.projectName.toLowerCase().replace(/\./g, '-');
    console.log(`    ${pc.gray('app-template')}      ${pc.cyan('→')} ${kebab}`);
    const pascal = config.projectName.replace(/\./g, '');
    console.log(`    ${pc.gray('AppTemplate')}       ${pc.cyan('→')} ${pascal}`);
  }

  console.log();
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
    if (config.variant !== 'zero') {
      accessLines.push('');
      accessLines.push(`Login      ${pc.cyan('admin')} / ${pc.cyan('Admin@123')}`);
    }
  }

  if (accessLines.length > 0) {
    note(accessLines.join('\n'), 'Access');
  }

  // Warning for zero-auth variant
  if (config.variant === 'zero') {
    console.log();
    log.warn(pc.yellow('This template has no authentication — add auth before deploying to production'));
  }

  console.log();
}

main();

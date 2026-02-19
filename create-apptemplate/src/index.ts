import { intro, outro, isCancel } from '@clack/prompts';
import pc from 'picocolors';
import { parseArgs } from './cli.js';
import { runInteractivePrompts } from './prompts.js';
import { generateProject } from './generator.js';
import type { ProjectConfig } from './types.js';
import { ALL_FEATURES } from './types.js';

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
      console.log('create-apptemplate v1.0.0');
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
      config = {
        projectPath: cliArgs.projectPath,
        projectType,
        backend,
        architecture,
        frontendFramework,
        ui: cliArgs.ui || (frontendFramework === 'vue' ? 'vuetify' : 'mui'),
        projectName: cliArgs.projectName,
        installDeps: cliArgs.install || false,
        placeInRoot: cliArgs.root || false,
        features: cliArgs.features || [...ALL_FEATURES],
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
    await generateProject(config);

    // Success message
    console.log();
    outro(pc.green('✓ Done! Your project is ready.'));

    // Show dynamic next steps based on project type
    showNextSteps(config);
  } catch (error) {
    if (error instanceof Error) {
      console.error(pc.red(`Error: ${error.message}`));
    } else {
      console.error(pc.red('An unexpected error occurred'));
    }
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
  ${pc.yellow('--features')}         Features to include (comma-separated or "all")
                       Options: auth,userManagement,departments,fileUpload,auditLogs,notifications,dataExport,dashboard
  ${pc.yellow('-i, --install')}      Install dependencies after creation
  ${pc.yellow('-h, --help')}         Show this help message
  ${pc.yellow('-v, --version')}      Show version number

${pc.bold('Examples:')}
  ${pc.gray('# Interactive mode')}
  npm create apptemplate@latest

  ${pc.gray('# Create fullstack project with .NET backend')}
  npm create apptemplate@latest my-app -b dotnet -n "MyCompany.MyApp" -i

  ${pc.gray('# Create backend-only project with Spring Boot')}
  npm create apptemplate@latest my-api -t backend -b spring -n "MyCompany.MyApi"

  ${pc.gray('# Create frontend-only project with PrimeVue')}
  npm create apptemplate@latest my-spa -t frontend -u primevue

  ${pc.gray('# Create fullstack project with React + MUI')}
  npm create apptemplate@latest my-app -b dotnet -f react -u mui -n "MyCompany.MyApp"

  ${pc.gray('# Create backend in project root (no subfolder)')}
  npm create apptemplate@latest my-api -t backend -b nestjs --root
`);
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

  console.log();
  console.log(pc.cyan('Next steps:'));
  console.log(`  ${pc.gray('$')} cd ${config.projectPath}`);

  // Show install commands if deps weren't installed
  if (!config.installDeps) {
    if (config.projectType !== 'frontend') {
      const cdBackend = backendFolder === '.' ? '' : `cd ${backendFolder} && `;
      if (config.backend === 'dotnet') {
        console.log(`  ${pc.gray('$')} ${cdBackend}dotnet restore`);
      } else if (config.backend === 'nestjs') {
        console.log(`  ${pc.gray('$')} ${cdBackend}npm install`);
      } else if (config.backend === 'spring') {
        console.log(`  ${pc.gray('$')} ${cdBackend}./mvnw install -DskipTests`);
      }
    }
    if (config.projectType !== 'backend') {
      const cdFrontend = frontendFolder === '.' ? '' : `cd ${frontendFolder} && `;
      console.log(`  ${pc.gray('$')} ${cdFrontend}npm install`);
    }
  }

  // Docker compose option (for fullstack)
  if (config.projectType === 'fullstack') {
    console.log();
    console.log(pc.gray('Run with Docker:'));
    console.log(`  ${pc.gray('$')} cp .env.example .env`);
    console.log(`  ${pc.gray('$')} docker compose up -d --build`);
  }

  // Manual run instructions
  console.log();
  console.log(pc.gray('Run manually:'));

  if (config.projectType !== 'frontend') {
    const cdBackend = backendFolder === '.' ? '' : `cd ${backendFolder} && `;
    if (config.backend === 'dotnet') {
      console.log(`  ${pc.gray('# Backend (.NET)')}`);
      if (backendFolder === '.') {
        console.log(`  ${pc.gray('$')} cd src/Presentation/*.WebAPI && dotnet run`);
      } else {
        console.log(`  ${pc.gray('$')} cd ${backendFolder}/src/Presentation/*.WebAPI && dotnet run`);
      }
    } else if (config.backend === 'nestjs') {
      console.log(`  ${pc.gray('# Backend (NestJS)')}`);
      console.log(`  ${pc.gray('$')} ${cdBackend}npm run start:dev`);
    } else if (config.backend === 'spring') {
      console.log(`  ${pc.gray('# Backend (Spring Boot)')}`);
      console.log(`  ${pc.gray('$')} ${cdBackend}./mvnw spring-boot:run`);
    }
  }

  if (config.projectType !== 'backend') {
    const cdFrontend = frontendFolder === '.' ? '' : `cd ${frontendFolder} && `;
    console.log(`  ${pc.gray('# Frontend')}`);
    console.log(`  ${pc.gray('$')} ${cdFrontend}npm run dev`);
  }

  // Access points
  console.log();
  console.log(pc.gray('Access points:'));

  if (config.projectType !== 'backend') {
    if (config.projectType === 'fullstack') {
      console.log(`  Frontend: ${pc.cyan('http://localhost:3000')} ${pc.gray('(dev)')}`);
    } else {
      console.log(`  Frontend: ${pc.cyan('http://localhost:3000')}`);
    }
  }

  if (config.projectType !== 'frontend') {
    console.log(`  Backend:  ${pc.cyan('http://localhost:5100')}`);
    console.log(`  Swagger:  ${pc.cyan('http://localhost:5100/swagger')}`);
  }

  // Default login (only for projects with backend)
  if (config.projectType !== 'frontend') {
    console.log();
    console.log(pc.gray('Default login:'));
    console.log(`  Username: ${pc.cyan('admin')}`);
    console.log(`  Password: ${pc.cyan('Admin@123')}`);
  }

  console.log();
}

main();

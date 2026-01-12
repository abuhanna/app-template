import { intro, outro, isCancel } from '@clack/prompts';
import pc from 'picocolors';
import { parseArgs } from './cli.js';
import { runInteractivePrompts } from './prompts.js';
import { generateProject } from './generator.js';
import type { ProjectConfig } from './types.js';

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

    if (cliArgs.projectPath && cliArgs.backend && cliArgs.projectName) {
      // Non-interactive mode - all required options provided
      config = {
        projectPath: cliArgs.projectPath,
        projectType: cliArgs.type || 'fullstack',
        backend: cliArgs.backend,
        ui: cliArgs.ui || 'vuetify',
        projectName: cliArgs.projectName,
        installDeps: cliArgs.install || false,
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

    console.log();
    console.log(pc.cyan('Next steps:'));
    console.log(`  ${pc.gray('$')} cd ${config.projectPath}`);
    console.log(`  ${pc.gray('$')} cp .env.example .env`);
    if (!config.installDeps) {
      if (config.projectType !== 'frontend') {
        console.log(`  ${pc.gray('$')} cd backend-${config.backend} && dotnet restore`);
      }
      if (config.projectType !== 'backend') {
        console.log(`  ${pc.gray('$')} cd frontend-${config.ui} && npm install`);
      }
    }
    console.log(`  ${pc.gray('$')} docker compose up -d --build`);
    console.log();
    console.log(pc.gray('Access points:'));
    console.log(`  Frontend: ${pc.cyan('http://localhost')}`);
    console.log(`  Backend:  ${pc.cyan('http://localhost:5100')}`);
    console.log(`  Swagger:  ${pc.cyan('http://localhost:5100/swagger')}`);
    console.log();
    console.log(pc.gray('Default login:'));
    console.log(`  Username: ${pc.cyan('admin')}`);
    console.log(`  Password: ${pc.cyan('Admin@123')}`);
    console.log();
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
  ${pc.yellow('-t, --type')}       Project type: fullstack, backend, frontend ${pc.gray('(default: fullstack)')}
  ${pc.yellow('-b, --backend')}    Backend framework: dotnet, spring, nestjs
  ${pc.yellow('-u, --ui')}         UI library: vuetify, primevue ${pc.gray('(default: vuetify)')}
  ${pc.yellow('-n, --name')}       Project name (Company.Project format)
  ${pc.yellow('-i, --install')}    Install dependencies after creation
  ${pc.yellow('-h, --help')}       Show this help message
  ${pc.yellow('-v, --version')}    Show version number

${pc.bold('Examples:')}
  ${pc.gray('# Interactive mode')}
  npm create apptemplate@latest

  ${pc.gray('# Create fullstack project with .NET backend')}
  npm create apptemplate@latest my-app -b dotnet -n "MyCompany.MyApp" -i

  ${pc.gray('# Create backend-only project with Spring Boot')}
  npm create apptemplate@latest my-api -t backend -b spring -n "MyCompany.MyApi"

  ${pc.gray('# Create frontend-only project with PrimeVue')}
  npm create apptemplate@latest my-spa -t frontend -u primevue
`);
}

main();

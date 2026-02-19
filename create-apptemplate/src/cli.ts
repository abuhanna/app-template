import type { CLIArgs, ProjectType, BackendFramework, BackendArchitecture, FrontendFramework, UILibrary, TemplateVariant } from './types.js';

const validProjectTypes: ProjectType[] = ['fullstack', 'backend', 'frontend'];
const validBackends: BackendFramework[] = ['dotnet', 'spring', 'nestjs'];
const validArchitectures: BackendArchitecture[] = ['clean', 'nlayer', 'feature'];
const validFrontendFrameworks: FrontendFramework[] = ['vue', 'react'];
const validUILibraries: UILibrary[] = ['vuetify', 'primevue', 'primereact', 'mui'];
const validVariants: TemplateVariant[] = ['minimal', 'full'];

export function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const result: CLIArgs = {};

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    // Handle flags
    if (arg === '-h' || arg === '--help') {
      result.help = true;
      i++;
      continue;
    }

    if (arg === '-v' || arg === '--version') {
      result.version = true;
      i++;
      continue;
    }

    if (arg === '-i' || arg === '--install') {
      result.install = true;
      i++;
      continue;
    }

    if (arg === '-r' || arg === '--root') {
      result.root = true;
      i++;
      continue;
    }

    // Handle options with values
    if (arg === '-t' || arg === '--type') {
      const value = args[++i];
      if (isValidProjectType(value)) {
        result.type = value;
      } else {
        console.warn(`Warning: Invalid project type "${value}". Valid options: ${validProjectTypes.join(', ')}`);
      }
      i++;
      continue;
    }

    if (arg === '-b' || arg === '--backend') {
      const value = args[++i];
      if (isValidBackend(value)) {
        result.backend = value;
      } else {
        console.warn(`Warning: Invalid backend "${value}". Valid options: ${validBackends.join(', ')}`);
      }
      i++;
      continue;
    }

    if (arg === '-a' || arg === '--architecture') {
      const value = args[++i];
      if (isValidArchitecture(value)) {
        result.architecture = value;
      } else {
        console.warn(`Warning: Invalid architecture "${value}". Valid options: ${validArchitectures.join(', ')}`);
      }
      i++;
      continue;
    }

    if (arg === '-f' || arg === '--framework') {
      const value = args[++i];
      if (isValidFrontendFramework(value)) {
        result.framework = value;
      } else {
        console.warn(`Warning: Invalid frontend framework "${value}". Valid options: ${validFrontendFrameworks.join(', ')}`);
      }
      i++;
      continue;
    }

    if (arg === '-u' || arg === '--ui') {
      const value = args[++i];
      if (isValidUI(value)) {
        result.ui = value;
      } else {
        console.warn(`Warning: Invalid UI library "${value}". Valid options: ${validUILibraries.join(', ')}`);
      }
      i++;
      continue;
    }

    if (arg === '-n' || arg === '--name') {
      const value = args[++i];
      if (isValidProjectName(value)) {
        result.projectName = value;
      } else {
        console.warn(`Warning: Project name should be in "Company.Project" format`);
      }
      i++;
      continue;
    }

    if (arg === '-V' || arg === '--variant') {
      const value = args[++i];
      if (isValidVariant(value)) {
        result.variant = value;
      } else {
        console.warn(`Warning: Invalid variant "${value}". Valid options: ${validVariants.join(', ')}`);
      }
      i++;
      continue;
    }

    // If not a flag, treat as project path (first positional argument)
    if (!arg.startsWith('-') && !result.projectPath) {
      result.projectPath = arg;
    }

    i++;
  }

  return result;
}

function isValidProjectType(value: string | undefined): value is ProjectType {
  return value !== undefined && validProjectTypes.includes(value as ProjectType);
}

function isValidBackend(value: string | undefined): value is BackendFramework {
  return value !== undefined && validBackends.includes(value as BackendFramework);
}

function isValidArchitecture(value: string | undefined): value is BackendArchitecture {
  return value !== undefined && validArchitectures.includes(value as BackendArchitecture);
}

function isValidFrontendFramework(value: string | undefined): value is FrontendFramework {
  return value !== undefined && validFrontendFrameworks.includes(value as FrontendFramework);
}

function isValidUI(value: string | undefined): value is UILibrary {
  return value !== undefined && validUILibraries.includes(value as UILibrary);
}

function isValidVariant(value: string | undefined): value is TemplateVariant {
  return value !== undefined && validVariants.includes(value as TemplateVariant);
}

function isValidProjectName(value: string | undefined): boolean {
  if (!value) return false;
  // Validate Company.Project format
  const pattern = /^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$/;
  return pattern.test(value);
}

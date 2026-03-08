import type { CLIArgs, ProjectType, BackendFramework, BackendArchitecture, FrontendFramework, UILibrary, TemplateVariant } from './types.js';

const validProjectTypes: ProjectType[] = ['fullstack', 'backend', 'frontend'];
const validBackends: BackendFramework[] = ['dotnet', 'spring', 'nestjs'];
const validArchitectures: BackendArchitecture[] = ['clean', 'nlayer', 'feature'];
const validFrontendFrameworks: FrontendFramework[] = ['vue', 'react'];
const validUILibraries: UILibrary[] = ['vuetify', 'primevue', 'primereact', 'mui'];
const validVariants: TemplateVariant[] = ['full', 'minimal', 'zero'];

const uiCompatibility: Record<FrontendFramework, UILibrary[]> = {
  vue: ['vuetify', 'primevue'],
  react: ['mui', 'primereact'],
};

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

    if (arg === '-q' || arg === '--quiet') {
      result.quiet = true;
      i++;
      continue;
    }

    if (arg === '--dry-run') {
      result.dryRun = true;
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

export function validateFrameworkUiPairing(
  framework: FrontendFramework | undefined,
  ui: UILibrary | undefined
): string | null {
  if (!framework || !ui) return null;
  const allowed = uiCompatibility[framework];
  if (!allowed.includes(ui)) {
    return `UI library "${ui}" is not compatible with framework "${framework}". Valid options for ${framework}: ${allowed.join(', ')}`;
  }
  return null;
}

/**
 * Validate flag combinations that are logically incompatible.
 * Returns an array of error messages (empty if valid).
 */
export function validateFlagCombinations(args: CLIArgs): string[] {
  const errors: string[] = [];
  const type = args.type;

  // --type frontend: backend-related flags must NOT be provided
  if (type === 'frontend') {
    if (args.backend) {
      errors.push(`--backend cannot be used with --type frontend`);
    }
    if (args.architecture) {
      errors.push(`--architecture cannot be used with --type frontend`);
    }
    if (args.projectName) {
      errors.push(`--name cannot be used with --type frontend`);
    }
  }

  // --type backend: frontend-related flags must NOT be provided
  if (type === 'backend') {
    if (args.framework) {
      errors.push(`--framework cannot be used with --type backend`);
    }
    if (args.ui) {
      errors.push(`--ui cannot be used with --type backend`);
    }
  }

  // --root is only valid for backend-only or frontend-only
  if (args.root && type === 'fullstack') {
    errors.push(`--root cannot be used with --type fullstack (backend and frontend are always in subfolders)`);
  }

  // Framework + UI pairing
  if (args.framework && args.ui) {
    const pairingError = validateFrameworkUiPairing(args.framework, args.ui);
    if (pairingError) {
      errors.push(`--framework ${args.framework} cannot be used with --ui ${args.ui}. Valid: ${uiCompatibility[args.framework].join(', ')}`);
    }
  }

  // --quiet is only valid in non-interactive mode (projectPath + backend required)
  if (args.quiet && !args.projectPath) {
    errors.push(`--quiet requires a project path and enough flags for non-interactive mode`);
  }

  return errors;
}

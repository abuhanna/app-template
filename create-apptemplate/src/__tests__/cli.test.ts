import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseArgs, validateFrameworkUiPairing, validateFlagCombinations } from '../cli.js';
import type { CLIArgs } from '../types.js';

describe('parseArgs', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.argv = originalArgv;
    vi.restoreAllMocks();
  });

  function setArgs(...args: string[]) {
    process.argv = ['node', 'create-apptemplate', ...args];
  }

  it('returns empty CLIArgs when no arguments provided', () => {
    setArgs();
    const result = parseArgs();
    expect(result).toEqual({});
  });

  it('parses -h flag', () => {
    setArgs('-h');
    expect(parseArgs().help).toBe(true);
  });

  it('parses --help flag', () => {
    setArgs('--help');
    expect(parseArgs().help).toBe(true);
  });

  it('parses -v flag', () => {
    setArgs('-v');
    expect(parseArgs().version).toBe(true);
  });

  it('parses --version flag', () => {
    setArgs('--version');
    expect(parseArgs().version).toBe(true);
  });

  it('parses -i flag', () => {
    setArgs('-i');
    expect(parseArgs().install).toBe(true);
  });

  it('parses --install flag', () => {
    setArgs('--install');
    expect(parseArgs().install).toBe(true);
  });

  it('parses -r flag', () => {
    setArgs('-r');
    expect(parseArgs().root).toBe(true);
  });

  it('parses --root flag', () => {
    setArgs('--root');
    expect(parseArgs().root).toBe(true);
  });

  it('parses -t with valid project type', () => {
    setArgs('-t', 'fullstack');
    expect(parseArgs().type).toBe('fullstack');
  });

  it('parses --type with valid project type', () => {
    setArgs('--type', 'backend');
    expect(parseArgs().type).toBe('backend');
  });

  it('warns and ignores invalid --type value', () => {
    setArgs('--type', 'invalid');
    const result = parseArgs();
    expect(result.type).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid project type'));
  });

  it('parses -b with valid backend', () => {
    setArgs('-b', 'dotnet');
    expect(parseArgs().backend).toBe('dotnet');
  });

  it('parses --backend with valid backend', () => {
    setArgs('--backend', 'spring');
    expect(parseArgs().backend).toBe('spring');
  });

  it('warns and ignores invalid --backend value', () => {
    setArgs('--backend', 'go');
    const result = parseArgs();
    expect(result.backend).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid backend'));
  });

  it('parses -a with valid architecture', () => {
    setArgs('-a', 'clean');
    expect(parseArgs().architecture).toBe('clean');
  });

  it('warns and ignores invalid --architecture value', () => {
    setArgs('--architecture', 'microservice');
    const result = parseArgs();
    expect(result.architecture).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid architecture'));
  });

  it('parses -f with valid frontend framework', () => {
    setArgs('-f', 'vue');
    expect(parseArgs().framework).toBe('vue');
  });

  it('parses -f with react', () => {
    setArgs('-f', 'react');
    expect(parseArgs().framework).toBe('react');
  });

  it('warns and ignores invalid --framework value', () => {
    setArgs('--framework', 'angular');
    const result = parseArgs();
    expect(result.framework).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid frontend framework'));
  });

  it('parses -u with valid UI library', () => {
    setArgs('-u', 'vuetify');
    expect(parseArgs().ui).toBe('vuetify');
  });

  it('warns and ignores invalid --ui value', () => {
    setArgs('--ui', 'bootstrap');
    const result = parseArgs();
    expect(result.ui).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid UI library'));
  });

  it('parses -n with valid Company.Project name', () => {
    setArgs('-n', 'My.App');
    expect(parseArgs().projectName).toBe('My.App');
  });

  it('parses multi-segment name like Company.Department.App', () => {
    setArgs('-n', 'Company.Department.App');
    expect(parseArgs().projectName).toBe('Company.Department.App');
  });

  it('warns when --name is not in Company.Project format', () => {
    setArgs('--name', 'justoneword');
    const result = parseArgs();
    expect(result.projectName).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Company.Project'));
  });

  it('parses -V with valid variant', () => {
    setArgs('-V', 'full');
    expect(parseArgs().variant).toBe('full');
  });

  it('parses --variant with minimal', () => {
    setArgs('--variant', 'minimal');
    expect(parseArgs().variant).toBe('minimal');
  });

  it('parses --variant with zero', () => {
    setArgs('--variant', 'zero');
    expect(parseArgs().variant).toBe('zero');
  });

  it('warns and ignores invalid --variant value', () => {
    setArgs('--variant', 'standard');
    const result = parseArgs();
    expect(result.variant).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid variant'));
  });

  it('treats first positional arg as projectPath', () => {
    setArgs('my-project');
    expect(parseArgs().projectPath).toBe('my-project');
  });

  it('parses all options combined', () => {
    setArgs(
      'my-project',
      '-t', 'fullstack',
      '-b', 'dotnet',
      '-a', 'clean',
      '-f', 'vue',
      '-u', 'vuetify',
      '-n', 'My.App',
      '-V', 'full',
      '-i',
      '-r'
    );
    const result = parseArgs();
    expect(result.projectPath).toBe('my-project');
    expect(result.type).toBe('fullstack');
    expect(result.backend).toBe('dotnet');
    expect(result.architecture).toBe('clean');
    expect(result.framework).toBe('vue');
    expect(result.ui).toBe('vuetify');
    expect(result.projectName).toBe('My.App');
    expect(result.variant).toBe('full');
    expect(result.install).toBe(true);
    expect(result.root).toBe(true);
  });

  it('parses both framework and ui even when pairing is invalid (validation happens later)', () => {
    setArgs('-f', 'vue', '-u', 'mui');
    const result = parseArgs();
    expect(result.framework).toBe('vue');
    expect(result.ui).toBe('mui');
  });

  it('keeps valid framework+ui pairing', () => {
    setArgs('-f', 'react', '-u', 'mui');
    const result = parseArgs();
    expect(result.framework).toBe('react');
    expect(result.ui).toBe('mui');
  });

  // New flag parsing tests
  it('parses -q flag', () => {
    setArgs('-q');
    expect(parseArgs().quiet).toBe(true);
  });

  it('parses --quiet flag', () => {
    setArgs('--quiet');
    expect(parseArgs().quiet).toBe(true);
  });

  it('parses --dry-run flag', () => {
    setArgs('--dry-run');
    expect(parseArgs().dryRun).toBe(true);
  });

  it('parses all new flags combined with existing ones', () => {
    setArgs('my-project', '-b', 'dotnet', '-q', '--dry-run');
    const result = parseArgs();
    expect(result.projectPath).toBe('my-project');
    expect(result.backend).toBe('dotnet');
    expect(result.quiet).toBe(true);
    expect(result.dryRun).toBe(true);
  });
});

describe('validateFrameworkUiPairing', () => {
  it('returns null when no framework provided', () => {
    expect(validateFrameworkUiPairing(undefined, 'vuetify')).toBeNull();
  });

  it('returns null when no ui provided', () => {
    expect(validateFrameworkUiPairing('vue', undefined)).toBeNull();
  });

  it('returns null for vue + vuetify', () => {
    expect(validateFrameworkUiPairing('vue', 'vuetify')).toBeNull();
  });

  it('returns null for vue + primevue', () => {
    expect(validateFrameworkUiPairing('vue', 'primevue')).toBeNull();
  });

  it('returns null for react + mui', () => {
    expect(validateFrameworkUiPairing('react', 'mui')).toBeNull();
  });

  it('returns null for react + primereact', () => {
    expect(validateFrameworkUiPairing('react', 'primereact')).toBeNull();
  });

  it('returns error for vue + mui', () => {
    const result = validateFrameworkUiPairing('vue', 'mui');
    expect(result).toContain('not compatible');
    expect(result).toContain('vue');
  });

  it('returns error for vue + primereact', () => {
    const result = validateFrameworkUiPairing('vue', 'primereact');
    expect(result).toContain('not compatible');
  });

  it('returns error for react + vuetify', () => {
    const result = validateFrameworkUiPairing('react', 'vuetify');
    expect(result).toContain('not compatible');
    expect(result).toContain('react');
  });

  it('returns error for react + primevue', () => {
    const result = validateFrameworkUiPairing('react', 'primevue');
    expect(result).toContain('not compatible');
  });
});

describe('validateFlagCombinations', () => {
  // --type frontend conflicts
  it('errors when --type frontend used with --backend', () => {
    const args: CLIArgs = { type: 'frontend', backend: 'dotnet' };
    const errors = validateFlagCombinations(args);
    expect(errors).toContain('--backend cannot be used with --type frontend');
  });

  it('errors when --type frontend used with --architecture', () => {
    const args: CLIArgs = { type: 'frontend', architecture: 'clean' };
    const errors = validateFlagCombinations(args);
    expect(errors).toContain('--architecture cannot be used with --type frontend');
  });

  it('errors when --type frontend used with --name', () => {
    const args: CLIArgs = { type: 'frontend', projectName: 'My.App' };
    const errors = validateFlagCombinations(args);
    expect(errors).toContain('--name cannot be used with --type frontend');
  });

  it('collects multiple frontend conflict errors at once', () => {
    const args: CLIArgs = { type: 'frontend', backend: 'dotnet', architecture: 'clean', projectName: 'My.App' };
    const errors = validateFlagCombinations(args);
    expect(errors).toHaveLength(3);
  });

  // --type backend conflicts
  it('errors when --type backend used with --framework', () => {
    const args: CLIArgs = { type: 'backend', framework: 'vue' };
    const errors = validateFlagCombinations(args);
    expect(errors).toContain('--framework cannot be used with --type backend');
  });

  it('errors when --type backend used with --ui', () => {
    const args: CLIArgs = { type: 'backend', ui: 'vuetify' };
    const errors = validateFlagCombinations(args);
    expect(errors).toContain('--ui cannot be used with --type backend');
  });

  it('collects multiple backend conflict errors at once', () => {
    const args: CLIArgs = { type: 'backend', framework: 'vue', ui: 'vuetify' };
    const errors = validateFlagCombinations(args);
    expect(errors).toHaveLength(2);
  });

  // --root + fullstack conflict
  it('errors when --root used with --type fullstack', () => {
    const args: CLIArgs = { type: 'fullstack', root: true };
    const errors = validateFlagCombinations(args);
    expect(errors).toContain('--root cannot be used with --type fullstack (backend and frontend are always in subfolders)');
  });

  it('allows --root with --type backend', () => {
    const args: CLIArgs = { type: 'backend', root: true, projectPath: 'test' };
    const errors = validateFlagCombinations(args);
    expect(errors).toHaveLength(0);
  });

  it('allows --root with --type frontend', () => {
    const args: CLIArgs = { type: 'frontend', root: true, projectPath: 'test' };
    const errors = validateFlagCombinations(args);
    expect(errors).toHaveLength(0);
  });

  // --quiet validation
  it('errors when --quiet used without project path', () => {
    const args: CLIArgs = { quiet: true };
    const errors = validateFlagCombinations(args);
    expect(errors).toContain('--quiet requires a project path and enough flags for non-interactive mode');
  });

  it('allows --quiet with project path', () => {
    const args: CLIArgs = { quiet: true, projectPath: 'my-app', backend: 'dotnet' };
    const errors = validateFlagCombinations(args);
    expect(errors).toHaveLength(0);
  });

  // Framework + UI pairing
  it('errors when --framework vue used with --ui mui', () => {
    const args: CLIArgs = { framework: 'vue', ui: 'mui' };
    const errors = validateFlagCombinations(args);
    expect(errors.some(e => e.includes('--framework vue') && e.includes('--ui mui'))).toBe(true);
  });

  it('errors when --framework vue used with --ui primereact', () => {
    const args: CLIArgs = { framework: 'vue', ui: 'primereact' };
    const errors = validateFlagCombinations(args);
    expect(errors.some(e => e.includes('--framework vue') && e.includes('--ui primereact'))).toBe(true);
  });

  it('errors when --framework react used with --ui vuetify', () => {
    const args: CLIArgs = { framework: 'react', ui: 'vuetify' };
    const errors = validateFlagCombinations(args);
    expect(errors.some(e => e.includes('--framework react') && e.includes('--ui vuetify'))).toBe(true);
  });

  it('no error for valid vue + vuetify pairing', () => {
    const args: CLIArgs = { framework: 'vue', ui: 'vuetify' };
    const errors = validateFlagCombinations(args);
    expect(errors).toHaveLength(0);
  });

  it('no error for valid react + mui pairing', () => {
    const args: CLIArgs = { framework: 'react', ui: 'mui' };
    const errors = validateFlagCombinations(args);
    expect(errors).toHaveLength(0);
  });

  // Valid combinations return no errors
  it('returns no errors for valid fullstack config', () => {
    const args: CLIArgs = {
      projectPath: 'my-app',
      type: 'fullstack',
      backend: 'dotnet',
      architecture: 'clean',
      framework: 'vue',
      ui: 'vuetify',
      projectName: 'My.App',
    };
    const errors = validateFlagCombinations(args);
    expect(errors).toHaveLength(0);
  });

  it('returns no errors for valid backend-only config', () => {
    const args: CLIArgs = {
      projectPath: 'my-api',
      type: 'backend',
      backend: 'nestjs',
      architecture: 'feature',
      root: true,
    };
    const errors = validateFlagCombinations(args);
    expect(errors).toHaveLength(0);
  });

  it('returns no errors for valid frontend-only config', () => {
    const args: CLIArgs = {
      projectPath: 'my-spa',
      type: 'frontend',
      framework: 'react',
      ui: 'mui',
    };
    const errors = validateFlagCombinations(args);
    expect(errors).toHaveLength(0);
  });

  it('returns no errors when no type specified (defaults to fullstack)', () => {
    const args: CLIArgs = {
      projectPath: 'my-app',
      backend: 'dotnet',
    };
    const errors = validateFlagCombinations(args);
    expect(errors).toHaveLength(0);
  });

  it('returns no errors for empty args', () => {
    const errors = validateFlagCombinations({});
    expect(errors).toHaveLength(0);
  });
});

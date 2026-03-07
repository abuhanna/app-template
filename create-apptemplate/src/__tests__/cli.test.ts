import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseArgs, validateFrameworkUiPairing } from '../cli.js';

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

  it('cross-validates --framework and --ui and clears ui if invalid pairing', () => {
    setArgs('-f', 'vue', '-u', 'mui');
    const result = parseArgs();
    expect(result.framework).toBe('vue');
    expect(result.ui).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('not compatible'));
  });

  it('keeps valid framework+ui pairing', () => {
    setArgs('-f', 'react', '-u', 'mui');
    const result = parseArgs();
    expect(result.framework).toBe('react');
    expect(result.ui).toBe('mui');
    expect(console.warn).not.toHaveBeenCalled();
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

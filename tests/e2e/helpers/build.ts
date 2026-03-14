import { spawn } from 'child_process';
import path from 'path';

const IS_WIN = process.platform === 'win32';

export interface BuildResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}

export interface BuildCommand {
  command: string;
  args: string[];
  cwd: string;
}

/**
 * Run a build command and capture the result.
 */
export function runCommand(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs = 120_000,
): Promise<BuildResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';

    // Resolve platform-specific command names
    const resolvedCommand = resolveCommand(command);

    const proc = spawn(resolvedCommand, args, {
      cwd,
      shell: true,
      env: { ...process.env, CI: 'true' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({
        success: false,
        exitCode: -1,
        stdout,
        stderr: stderr + '\n[TIMEOUT]',
        duration: Date.now() - startTime,
      });
    }, timeoutMs);

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        success: code === 0,
        exitCode: code ?? -1,
        stdout,
        stderr,
        duration: Date.now() - startTime,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        success: false,
        exitCode: -1,
        stdout,
        stderr: stderr + '\n' + err.message,
        duration: Date.now() - startTime,
      });
    });
  });
}

function resolveCommand(command: string): string {
  if (!IS_WIN) return command;

  // On Windows, resolve npm/npx/mvnw to .cmd variants
  if (command === 'npm') return 'npm.cmd';
  if (command === 'npx') return 'npx.cmd';
  if (command === './mvnw' || command === 'mvnw') return '.\\mvnw.cmd';
  return command;
}

/**
 * Get the build commands for a backend stack.
 */
export function getBackendBuildCommands(
  stack: string,
  backendDir: string,
): BuildCommand[] {
  switch (stack) {
    case 'dotnet':
      return [
        { command: 'dotnet', args: ['restore'], cwd: backendDir },
        { command: 'dotnet', args: ['build', '--no-restore'], cwd: backendDir },
      ];

    case 'spring':
      return [
        {
          command: './mvnw',
          args: ['clean', 'compile', '-q'],
          cwd: backendDir,
        },
      ];

    case 'nestjs':
      return [
        { command: 'npm', args: ['install'], cwd: backendDir },
        { command: 'npm', args: ['run', 'build'], cwd: backendDir },
      ];

    default:
      throw new Error(`Unknown backend stack: ${stack}`);
  }
}

/**
 * Get the test commands for a backend stack.
 * Assumes the project has already been built.
 */
export function getBackendTestCommands(
  stack: string,
  backendDir: string,
): BuildCommand[] {
  switch (stack) {
    case 'dotnet':
      return [
        { command: 'dotnet', args: ['test', '--no-build'], cwd: backendDir },
      ];

    case 'spring':
      return [
        {
          command: './mvnw',
          args: ['test', '-q'],
          cwd: backendDir,
        },
      ];

    case 'nestjs':
      return [
        { command: 'npm', args: ['run', 'test'], cwd: backendDir },
      ];

    default:
      throw new Error(`Unknown backend stack: ${stack}`);
  }
}

/**
 * Get the type-check commands for a frontend (React/TypeScript only).
 */
export function getFrontendTypeCheckCommands(frontendDir: string): BuildCommand[] {
  return [
    { command: 'npx', args: ['tsc', '--noEmit'], cwd: frontendDir },
  ];
}

/**
 * Get the build commands for a frontend.
 */
export function getFrontendBuildCommands(frontendDir: string): BuildCommand[] {
  return [
    { command: 'npm', args: ['install'], cwd: frontendDir },
    { command: 'npm', args: ['run', 'build'], cwd: frontendDir },
  ];
}

/**
 * Run a sequence of build commands, stopping on first failure.
 */
export async function runBuildSequence(
  commands: BuildCommand[],
  timeoutPerStep = 120_000,
): Promise<BuildResult> {
  let totalDuration = 0;
  let allStdout = '';
  let allStderr = '';

  for (const cmd of commands) {
    const result = await runCommand(cmd.command, cmd.args, cmd.cwd, timeoutPerStep);
    totalDuration += result.duration;
    allStdout += result.stdout;
    allStderr += result.stderr;

    if (!result.success) {
      return {
        success: false,
        exitCode: result.exitCode,
        stdout: allStdout,
        stderr: allStderr,
        duration: totalDuration,
      };
    }
  }

  return {
    success: true,
    exitCode: 0,
    stdout: allStdout,
    stderr: allStderr,
    duration: totalDuration,
  };
}

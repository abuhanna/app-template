import pc from 'picocolors';

interface DegitError extends Error {
  code?: string;
  original?: Error & { code?: string };
  templatePath?: string;
}

export function formatUserError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unexpected error occurred.';
  }

  const err = error as DegitError;
  const msg = err.message || '';
  const code = err.code || '';
  const originalCode = err.original?.code || '';

  // Network errors (degit or fetch)
  const networkCodes = ['ENOTFOUND', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'EAI_AGAIN'];
  if (networkCodes.includes(code) || networkCodes.includes(originalCode)) {
    return 'Could not reach GitHub. Check your internet connection and try again.';
  }

  // Degit: template not found
  if (code === 'COULD_NOT_DOWNLOAD' || code === 'COULD_NOT_FETCH' || code === 'MISSING_REF') {
    if (err.templatePath) {
      return `Template not found: ${pc.cyan(err.templatePath)}. This combination may not be available yet.`;
    }
    return `Template not found. The requested combination may not be available yet.\n  ${pc.gray(msg)}`;
  }

  // Disk space
  if (msg.includes('ENOSPC') || msg.toLowerCase().includes('no space left')) {
    return 'Not enough disk space to generate the project. Free up space and try again.';
  }

  // Permissions
  if (msg.includes('EACCES') || msg.includes('EPERM') || msg.toLowerCase().includes('permission denied')) {
    return `Cannot write to the target directory. Check directory permissions.\n  ${pc.gray(msg)}`;
  }

  // Fallback: return the original message
  return msg;
}

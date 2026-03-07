import { describe, it, expect } from 'vitest';
import { formatUserError } from '../errors.js';

describe('formatUserError', () => {
  it('returns generic message for non-Error input', () => {
    expect(formatUserError('string error')).toBe('An unexpected error occurred.');
    expect(formatUserError(null)).toBe('An unexpected error occurred.');
    expect(formatUserError(42)).toBe('An unexpected error occurred.');
  });

  it('returns raw message for plain Error', () => {
    expect(formatUserError(new Error('something went wrong'))).toBe('something went wrong');
  });

  it('maps network errors to friendly message', () => {
    for (const code of ['ENOTFOUND', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'EAI_AGAIN']) {
      const err = new Error('fetch failed') as any;
      err.code = code;
      expect(formatUserError(err)).toContain('Could not reach GitHub');
    }
  });

  it('maps degit network errors (via original.code) to friendly message', () => {
    const err = new Error('could not download') as any;
    err.code = 'COULD_NOT_DOWNLOAD';
    err.original = new Error('getaddrinfo failed');
    err.original.code = 'ENOTFOUND';
    expect(formatUserError(err)).toContain('Could not reach GitHub');
  });

  it('maps degit COULD_NOT_DOWNLOAD without network cause to template-not-found', () => {
    const err = new Error('could not download') as any;
    err.code = 'COULD_NOT_DOWNLOAD';
    expect(formatUserError(err)).toContain('Template not found');
  });

  it('includes templatePath in message when available', () => {
    const err = new Error('could not download') as any;
    err.code = 'COULD_NOT_DOWNLOAD';
    err.templatePath = 'backend/go/clean-architecture/full';
    expect(formatUserError(err)).toContain('backend/go/clean-architecture/full');
  });

  it('maps MISSING_REF to template-not-found', () => {
    const err = new Error('missing ref') as any;
    err.code = 'MISSING_REF';
    expect(formatUserError(err)).toContain('Template not found');
  });

  it('maps ENOSPC to disk space message', () => {
    expect(formatUserError(new Error('ENOSPC: no space left on device'))).toContain('disk space');
  });

  it('maps EACCES to permissions message', () => {
    expect(formatUserError(new Error('EACCES: permission denied'))).toContain('permissions');
  });

  it('maps EPERM to permissions message', () => {
    expect(formatUserError(new Error('EPERM: operation not permitted'))).toContain('permissions');
  });
});

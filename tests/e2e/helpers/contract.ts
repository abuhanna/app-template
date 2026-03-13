/**
 * API contract validation helpers.
 * Extracted from scripts/integration-test.ts for reuse in E2E tests.
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate that a response body follows the standard API envelope:
 * { success: boolean, message?: string, data?: any }
 */
export function validateApiResponse(
  body: unknown,
  expectData = true,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof body !== 'object' || body === null) {
    errors.push({ field: 'body', message: 'Response body must be an object' });
    return errors;
  }

  const obj = body as Record<string, unknown>;

  if (typeof obj.success !== 'boolean') {
    errors.push({ field: 'success', message: 'Missing or non-boolean "success" field' });
  }

  if (expectData && obj.data === undefined) {
    errors.push({ field: 'data', message: 'Missing "data" field' });
  }

  return errors;
}

/**
 * Validate paginated response structure:
 * { items: [], totalCount: number, page: number, pageSize: number, totalPages: number }
 */
export function validatePaginatedResponse(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof body !== 'object' || body === null) {
    errors.push({ field: 'body', message: 'Response body must be an object' });
    return errors;
  }

  const obj = body as Record<string, unknown>;
  const data = obj.data as Record<string, unknown> | undefined;

  if (!data || typeof data !== 'object') {
    errors.push({ field: 'data', message: 'Missing "data" object' });
    return errors;
  }

  if (!Array.isArray(data.items)) {
    errors.push({ field: 'data.items', message: 'Missing or non-array "items"' });
  }
  if (typeof data.totalCount !== 'number') {
    errors.push({ field: 'data.totalCount', message: 'Missing or non-number "totalCount"' });
  }
  if (typeof data.page !== 'number') {
    errors.push({ field: 'data.page', message: 'Missing or non-number "page"' });
  }
  if (typeof data.pageSize !== 'number') {
    errors.push({ field: 'data.pageSize', message: 'Missing or non-number "pageSize"' });
  }
  if (typeof data.totalPages !== 'number') {
    errors.push({ field: 'data.totalPages', message: 'Missing or non-number "totalPages"' });
  }

  return errors;
}

/**
 * Validate that all keys in an object follow camelCase convention.
 */
export function validateCamelCase(
  obj: unknown,
  objPath = '',
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof obj !== 'object' || obj === null) return errors;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      errors.push(...validateCamelCase(obj[i], `${objPath}[${i}]`));
    }
    return errors;
  }

  const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = objPath ? `${objPath}.${key}` : key;

    if (!camelCaseRegex.test(key)) {
      errors.push({
        field: currentPath,
        message: `Key "${key}" is not camelCase`,
      });
    }

    if (typeof value === 'object' && value !== null) {
      errors.push(...validateCamelCase(value, currentPath));
    }
  }

  return errors;
}

/**
 * Validate that a value is an ISO 8601 date string.
 */
export function validateIsoDate(value: unknown, fieldName: string): ValidationError[] {
  if (typeof value !== 'string') {
    return [{ field: fieldName, message: `Expected ISO date string, got ${typeof value}` }];
  }

  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  if (!isoRegex.test(value)) {
    return [{ field: fieldName, message: `"${value}" is not an ISO 8601 date` }];
  }

  return [];
}

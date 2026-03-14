/**
 * API contract validation helpers.
 * Aligned with docs/api-contract.md and scripts/integration-test.ts.
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate that a response body follows the standard API envelope:
 * { success: boolean, message: string, data?: any }
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
    errors.push({ field: 'success', message: `"success" should be boolean, got ${typeof obj.success}` });
  }

  if (typeof obj.message !== 'string') {
    errors.push({ field: 'message', message: `"message" should be string, got ${typeof obj.message}` });
  }

  if (expectData && obj.success === true && obj.data === undefined) {
    errors.push({ field: 'data', message: '"data" field is missing from successful response' });
  }

  return errors;
}

/**
 * Validate paginated response structure per API contract:
 * { success: true, message: "...", data: [...], pagination: { page, pageSize, totalItems, totalPages, hasNext, hasPrevious } }
 */
export function validatePaginatedResponse(body: unknown): ValidationError[] {
  const errors = validateApiResponse(body, true);

  const obj = body as Record<string, unknown>;

  if (!Array.isArray(obj?.data)) {
    errors.push({ field: 'data', message: `"data" should be an array, got ${typeof obj?.data}` });
  }

  const p = obj?.pagination as Record<string, unknown> | undefined;
  if (!p || typeof p !== 'object') {
    errors.push({ field: 'pagination', message: '"pagination" object is missing' });
    return errors;
  }

  const numFields = ['page', 'pageSize', 'totalItems', 'totalPages'];
  for (const f of numFields) {
    if (typeof p[f] !== 'number') {
      errors.push({
        field: `pagination.${f}`,
        message: `pagination.${f} should be number, got ${typeof p[f]} (${JSON.stringify(p[f])})`,
      });
    }
  }

  const boolFields = ['hasNext', 'hasPrevious'];
  for (const f of boolFields) {
    if (typeof p[f] !== 'boolean') {
      errors.push({
        field: `pagination.${f}`,
        message: `pagination.${f} should be boolean, got ${typeof p[f]} (${JSON.stringify(p[f])})`,
      });
    }
  }

  return errors;
}

/**
 * Validate error response structure:
 * { success: false, message: string, errors?: string[] }
 */
export function validateErrorResponse(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof body !== 'object' || body === null) {
    errors.push({ field: 'body', message: 'Response body must be an object' });
    return errors;
  }

  const obj = body as Record<string, unknown>;

  if (obj.success !== false) {
    errors.push({ field: 'success', message: 'Error response should have success=false' });
  }

  if (typeof obj.message !== 'string') {
    errors.push({ field: 'message', message: `"message" should be string, got ${typeof obj.message}` });
  }

  return errors;
}

// Known non-camelCase keys from .NET JSON serialization quirks
const KNOWN_NON_CAMEL = new Set(['$id', '$values']);
const CAMEL_CASE_RE = /^[a-z][a-zA-Z0-9]*$|^\$[a-zA-Z]*$/;

/**
 * Validate that all keys in an object follow camelCase convention.
 * Includes depth limit and .NET JSON quirk handling.
 */
export function validateCamelCase(
  obj: unknown,
  objPath = '',
  depth = 0,
): ValidationError[] {
  if (depth > 5 || typeof obj !== 'object' || obj === null) return [];

  const errors: ValidationError[] = [];
  const keys = Array.isArray(obj) ? [] : Object.keys(obj as Record<string, unknown>);

  for (const key of keys) {
    if (KNOWN_NON_CAMEL.has(key)) continue;

    const currentPath = objPath ? `${objPath}.${key}` : key;

    if (!CAMEL_CASE_RE.test(key)) {
      errors.push({
        field: currentPath,
        message: `Key "${key}" is not camelCase`,
      });
    }

    const value = (obj as Record<string, unknown>)[key];
    if (typeof value === 'object' && value !== null) {
      errors.push(...validateCamelCase(value, currentPath, depth + 1));
    }
  }

  // For arrays, validate the first item only
  if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') {
    errors.push(...validateCamelCase(obj[0], `${objPath}[0]`, depth + 1));
  }

  return errors;
}

const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

/**
 * Validate that a value is an ISO 8601 date string.
 */
export function validateIsoDate(value: unknown, fieldName: string): ValidationError[] {
  if (value === null || value === undefined) return [];
  if (typeof value !== 'string') {
    return [{ field: fieldName, message: `Expected ISO date string, got ${typeof value}` }];
  }

  if (!ISO_DATE_RE.test(value)) {
    return [{ field: fieldName, message: `"${value}" is not an ISO 8601 date` }];
  }

  if (isNaN(new Date(value).getTime())) {
    return [{ field: fieldName, message: `"${value}" is an invalid date` }];
  }

  return [];
}

/**
 * Validate that a value is a positive integer (auto-increment ID).
 */
export function validateNumericId(value: unknown, fieldName: string): ValidationError[] {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return [{
      field: fieldName,
      message: `${fieldName} should be positive integer, got ${typeof value}: ${JSON.stringify(value)}`,
    }];
  }
  return [];
}

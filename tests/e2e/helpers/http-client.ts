/**
 * HTTP client helpers for Layer 3 contract tests.
 * Extracted from scripts/integration-test.ts for reuse in vitest.
 */

export interface HttpResult {
  status: number;
  body: any;
  ok: boolean;
  headers: Headers;
}

async function parseResponse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

function makeErrorResult(e: any): HttpResult {
  return {
    status: 0,
    body: { error: e.message },
    ok: false,
    headers: new Headers(),
  };
}

export async function httpGet(
  url: string,
  headers?: Record<string, string>,
): Promise<HttpResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, {
      method: 'GET',
      headers: { ...headers },
      signal: controller.signal,
    });
    clearTimeout(timer);
    const body = await parseResponse(res);
    return { status: res.status, body, ok: res.ok, headers: res.headers };
  } catch (e: any) {
    return makeErrorResult(e);
  }
}

export async function httpPost(
  url: string,
  body?: any,
  headers?: Record<string, string>,
): Promise<HttpResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);
    const resBody = await parseResponse(res);
    return { status: res.status, body: resBody, ok: res.ok, headers: res.headers };
  } catch (e: any) {
    return makeErrorResult(e);
  }
}

export async function httpPut(
  url: string,
  body?: any,
  headers?: Record<string, string>,
): Promise<HttpResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const reqHeaders: Record<string, string> = { ...headers };
    if (body) reqHeaders['Content-Type'] = 'application/json';
    const res = await fetch(url, {
      method: 'PUT',
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);
    const resBody = await parseResponse(res);
    return { status: res.status, body: resBody, ok: res.ok, headers: res.headers };
  } catch (e: any) {
    return makeErrorResult(e);
  }
}

export async function httpDelete(
  url: string,
  headers?: Record<string, string>,
): Promise<HttpResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { ...headers },
      signal: controller.signal,
    });
    clearTimeout(timer);
    const resBody = await parseResponse(res);
    return { status: res.status, body: resBody, ok: res.ok, headers: res.headers };
  } catch (e: any) {
    return makeErrorResult(e);
  }
}

export async function httpPostMultipart(
  url: string,
  formData: FormData,
  headers?: Record<string, string>,
): Promise<HttpResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(url, {
      method: 'POST',
      headers: { ...headers },
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timer);
    const resBody = await parseResponse(res);
    return { status: res.status, body: resBody, ok: res.ok, headers: res.headers };
  } catch (e: any) {
    return makeErrorResult(e);
  }
}

export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

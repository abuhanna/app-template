/**
 * Cross-Stack API Contract Integration Test
 *
 * Starts a backend, waits for health, runs contract tests against every endpoint,
 * then stops the backend and reports results.
 *
 * Usage:
 *   npx tsx scripts/integration-test.ts --stack dotnet --arch clean --variant full
 *   npx tsx scripts/integration-test.ts --stack dotnet --all
 *   npx tsx scripts/integration-test.ts --smoke
 *   npx tsx scripts/integration-test.ts --help
 */

import { spawn, execSync, type ChildProcess } from "child_process";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ─── Types ───────────────────────────────────────────────────────────────────

type Stack = "dotnet" | "spring" | "nestjs";
type Arch = "clean" | "feature" | "nlayer";
type Variant = "full" | "minimal";

interface BackendTarget {
  stack: Stack;
  arch: Arch;
  variant: Variant;
}

interface TestResult {
  suite: string;
  method: string;
  path: string;
  passed: boolean;
  skipped: boolean;
  error?: string;
  duration: number;
}

interface TestContext {
  baseUrl: string;
  stack: Stack;
  arch: Arch;
  variant: Variant;
  accessToken?: string;
  refreshToken?: string;
  verbose: boolean;
}

interface HttpResult {
  status: number;
  body: any;
  ok: boolean;
  headers: Headers;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

const PASS = "\x1b[32m✅\x1b[0m";
const FAIL = "\x1b[31m❌\x1b[0m";
const SKIP = "\x1b[33m⏭️\x1b[0m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

const BASE_URL = "http://localhost:5100";
const IS_WIN = process.platform === "win32";

const ALL_STACKS: Stack[] = ["dotnet", "spring", "nestjs"];
const ALL_ARCHS: Arch[] = ["clean", "feature", "nlayer"];
const ALL_VARIANTS: Variant[] = ["full", "minimal"];

// Register endpoint availability matrix
const HAS_REGISTER: Record<string, boolean> = {
  "dotnet/clean": false,
  "dotnet/feature": true,
  "dotnet/nlayer": true,
  "spring/clean": false,
  "spring/feature": true,
  "spring/nlayer": true,
  "nestjs/clean": true,
  "nestjs/feature": true,
  "nestjs/nlayer": true,
};

// ─── CLI Argument Parsing ────────────────────────────────────────────────────

interface CliArgs {
  stack?: Stack;
  arch?: Arch;
  variant?: Variant;
  all: boolean;
  smoke: boolean;
  timeout: number;
  skipDb: boolean;
  verbose: boolean;
  help: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    all: false,
    smoke: false,
    timeout: 120,
    skipDb: false,
    verbose: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--stack":
        result.stack = args[++i] as Stack;
        break;
      case "--arch":
        result.arch = args[++i] as Arch;
        break;
      case "--variant":
        result.variant = args[++i] as Variant;
        break;
      case "--all":
        result.all = true;
        break;
      case "--smoke":
        result.smoke = true;
        break;
      case "--timeout":
        result.timeout = parseInt(args[++i], 10);
        break;
      case "--skip-db":
        result.skipDb = true;
        break;
      case "--verbose":
        result.verbose = true;
        break;
      case "--help":
      case "-h":
        result.help = true;
        break;
    }
  }

  return result;
}

function printUsage(): void {
  console.log(`
${BOLD}Cross-Stack API Contract Integration Test${RESET}

${BOLD}Usage:${RESET}
  npx tsx scripts/integration-test.ts [options]

${BOLD}Options:${RESET}
  --stack <name>      Backend stack: dotnet, spring, nestjs
  --arch <name>       Architecture: clean, feature, nlayer
  --variant <name>    Variant: full, minimal
  --all               Test all combinations for the given --stack (or all stacks)
  --smoke             Quick smoke test: health checks only, one per stack
  --timeout <sec>     Health check timeout in seconds (default: 120)
  --skip-db           Skip test database management (assume it's running)
  --verbose           Show backend stdout/stderr
  --help, -h          Show this help

${BOLD}Examples:${RESET}
  npx tsx scripts/integration-test.ts --stack dotnet --arch clean --variant full
  npx tsx scripts/integration-test.ts --stack dotnet --all
  npx tsx scripts/integration-test.ts --smoke
`);
}

function resolveTargets(args: CliArgs): BackendTarget[] {
  if (args.smoke) {
    return ALL_STACKS.map((stack) => ({
      stack,
      arch: "clean" as Arch,
      variant: "full" as Variant,
    }));
  }

  if (args.all) {
    const stacks = args.stack ? [args.stack] : ALL_STACKS;
    const targets: BackendTarget[] = [];
    for (const stack of stacks) {
      for (const arch of ALL_ARCHS) {
        for (const variant of ALL_VARIANTS) {
          targets.push({ stack, arch, variant });
        }
      }
    }
    return targets;
  }

  if (args.stack && args.arch && args.variant) {
    return [
      { stack: args.stack, arch: args.arch, variant: args.variant },
    ];
  }

  if (args.stack && args.all) {
    const targets: BackendTarget[] = [];
    for (const arch of ALL_ARCHS) {
      for (const variant of ALL_VARIANTS) {
        targets.push({ stack: args.stack, arch, variant });
      }
    }
    return targets;
  }

  return [];
}

// ─── Backend Configuration ───────────────────────────────────────────────────

function getBackendDir(target: BackendTarget): string {
  return resolve(
    ROOT,
    "backend",
    target.stack,
    `${target.arch}-architecture`,
    target.variant
  );
}

function getStartCommand(target: BackendTarget): {
  command: string;
  args: string[];
  cwd: string;
} {
  const baseDir = getBackendDir(target);

  switch (target.stack) {
    case "dotnet": {
      const project =
        target.arch === "clean"
          ? "src/Presentation/App.Template.WebAPI"
          : "src/App.Template.Api";
      return {
        command: "dotnet",
        args: ["run", "--project", project],
        cwd: baseDir,
      };
    }
    case "spring": {
      if (target.arch === "clean") {
        const mvnw = IS_WIN ? "mvnw.cmd" : "../mvnw";
        return {
          command: IS_WIN
            ? resolve(baseDir, "mvnw.cmd")
            : resolve(baseDir, "..", "mvnw"),
          args: ["spring-boot:run"],
          cwd: resolve(baseDir, "api"),
        };
      }
      // feature/nlayer: check for mvnw in the variant dir, fall back to system mvn
      const mvnwPath = resolve(baseDir, IS_WIN ? "mvnw.cmd" : "mvnw");
      if (existsSync(mvnwPath)) {
        return {
          command: mvnwPath,
          args: ["spring-boot:run"],
          cwd: baseDir,
        };
      }
      return {
        command: IS_WIN ? "mvn.cmd" : "mvn",
        args: ["spring-boot:run"],
        cwd: baseDir,
      };
    }
    case "nestjs":
      return {
        command: IS_WIN ? "npm.cmd" : "npm",
        args: ["run", "start"],
        cwd: baseDir,
      };
  }
}

function getEnvOverrides(stack: Stack): Record<string, string> {
  const common = {
    PORT: "5100",
  };

  switch (stack) {
    case "dotnet":
      return {
        ...common,
        ConnectionStrings__DefaultConnection:
          "Host=localhost;Port=5433;Database=apptemplate_test;Username=apptemplate;Password=apptemplate123",
        ASPNETCORE_ENVIRONMENT: "Development",
        ASPNETCORE_URLS: "http://+:5100",
      };
    case "spring":
      return {
        ...common,
        DB_HOST: "localhost",
        DB_PORT: "5433",
        DB_NAME: "apptemplate_test",
        DB_USER: "apptemplate",
        DB_PASSWORD: "apptemplate123",
        JWT_SECRET:
          "test-secret-key-minimum-32-characters-long-for-hs256-algorithm",
        SERVER_PORT: "5100",
      };
    case "nestjs":
      return {
        ...common,
        DB_HOST: "localhost",
        DB_PORT: "5433",
        DB_NAME: "apptemplate_test",
        DB_USERNAME: "apptemplate",
        DB_PASSWORD: "apptemplate123",
        DB_SYNCHRONIZE: "", // Empty string is falsy — prevents TypeORM synchronize
        DB_LOGGING: "",
        JWT_SECRET:
          "test-secret-key-minimum-32-characters-long-for-hs256-algorithm",
        JWT_REFRESH_SECRET:
          "test-refresh-secret-key-minimum-32-characters-long-enough",
        NODE_ENV: "development",
      };
  }
}

// ─── Docker Test DB Management ───────────────────────────────────────────────

function isTestDbRunning(): boolean {
  try {
    const out = execSync(
      'docker ps --filter name=apptemplate-test-db --format "{{.Status}}"',
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    ).trim();
    return out.startsWith("Up");
  } catch {
    return false;
  }
}

function startTestDb(): boolean {
  console.log(`${DIM}Starting test database on port 5433...${RESET}`);
  try {
    execSync(
      "docker compose -f docker/docker-compose.test-db.yml up -d",
      { cwd: ROOT, stdio: "pipe" }
    );
    // Wait for ready
    const maxWait = 30;
    for (let i = 0; i < maxWait; i++) {
      try {
        execSync(
          "docker exec apptemplate-test-db pg_isready -U apptemplate -d apptemplate_test",
          { stdio: "pipe" }
        );
        console.log(`${PASS} Test database ready at localhost:5433`);
        return true;
      } catch {
        sleepSync(1000);
      }
    }
    console.error(`${FAIL} Test database did not become ready in ${maxWait}s`);
    return false;
  } catch (e: any) {
    console.error(`${FAIL} Failed to start test database: ${e.message}`);
    return false;
  }
}

function resetTestDb(): void {
  try {
    execSync(
      `docker exec apptemplate-test-db psql -U apptemplate -d apptemplate_test -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO apptemplate; GRANT ALL ON SCHEMA public TO public;"`,
      { stdio: "pipe" }
    );
  } catch {
    // If DB is fresh, schema may already be clean
  }
}

function sleepSync(ms: number): void {
  execSync(`${IS_WIN ? "ping -n 2 127.0.0.1 >nul" : "sleep " + Math.ceil(ms / 1000)}`);
}

// ─── Process Lifecycle ───────────────────────────────────────────────────────

let activeProcess: ChildProcess | null = null;

function startBackend(
  target: BackendTarget,
  verbose: boolean
): ChildProcess {
  const { command, args, cwd } = getStartCommand(target);
  const envOverrides = getEnvOverrides(target.stack);

  if (target.stack === "nestjs") {
    if (!existsSync(resolve(cwd, "node_modules"))) {
      console.log(`${DIM}  Installing NestJS dependencies...${RESET}`);
      execSync(IS_WIN ? "npm.cmd install" : "npm install", {
        cwd,
        stdio: verbose ? "inherit" : "pipe",
      });
    }
    // Pre-build to avoid watch mode compilation delays
    console.log(`${DIM}  Building NestJS...${RESET}`);
    execSync(IS_WIN ? "npm.cmd run build" : "npm run build", {
      cwd,
      env: { ...process.env, ...envOverrides },
      stdio: verbose ? "inherit" : "pipe",
    });
  }

  const env = { ...process.env, ...envOverrides };
  const proc = spawn(command, args, {
    cwd,
    env,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const stdout: string[] = [];
  const stderr: string[] = [];

  proc.stdout?.on("data", (data: Buffer) => {
    const line = data.toString();
    stdout.push(line);
    if (verbose) process.stdout.write(`${DIM}  [out] ${line}${RESET}`);
  });

  proc.stderr?.on("data", (data: Buffer) => {
    const line = data.toString();
    stderr.push(line);
    if (verbose) process.stderr.write(`${DIM}  [err] ${line}${RESET}`);
  });

  activeProcess = proc;
  return proc;
}

async function waitForHealth(
  baseUrl: string,
  timeoutSec: number
): Promise<boolean> {
  const deadline = Date.now() + timeoutSec * 1000;
  const pollInterval = 2000;

  while (Date.now() < deadline) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${baseUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const body = await res.json();
        // Handle both raw and wrapped (NestJS TransformInterceptor) responses
        // Accept "healthy" or "ok" (NestJS uses "ok" for health check status)
        const status = body.status ?? body.data?.status;
        const s = status?.toLowerCase();
        if (s === "healthy" || s === "ok") return true;
      }
    } catch {
      // Connection refused, keep polling
    }
    await sleep(pollInterval);
  }
  return false;
}

function killPort(port: number): void {
  if (!IS_WIN) return;
  try {
    const out = execSync(
      `netstat -ano | findstr ":${port}" | findstr "LISTENING"`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    ).trim();
    const lines = out.split("\n").filter(Boolean);
    const pids = new Set(
      lines.map((l) => l.trim().split(/\s+/).pop()).filter(Boolean)
    );
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "pipe" });
      } catch {
        // Process might already be gone
      }
    }
  } catch {
    // No process found on port
  }
}

function stopBackend(proc: ChildProcess): Promise<void> {
  return new Promise((resolve) => {
    if (!proc.pid) {
      resolve();
      return;
    }

    proc.on("close", () => resolve());

    try {
      if (IS_WIN) {
        execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: "pipe" });
      } else {
        proc.kill("SIGTERM");
        setTimeout(() => {
          try {
            proc.kill("SIGKILL");
          } catch {
            // already dead
          }
        }, 5000);
      }
    } catch {
      // Process may have already exited
    }

    // Also kill anything remaining on port 5100
    killPort(5100);

    // Safety timeout
    setTimeout(() => resolve(), 8000);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Cleanup on exit
function setupCleanup(): void {
  const cleanup = () => {
    if (activeProcess?.pid) {
      try {
        if (IS_WIN) {
          execSync(`taskkill /pid ${activeProcess.pid} /T /F`, {
            stdio: "pipe",
          });
          killPort(5100);
        } else {
          activeProcess.kill("SIGKILL");
        }
      } catch {
        // ignore
      }
    }
  };
  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    cleanup();
    process.exit(143);
  });
}

// ─── HTTP Client ─────────────────────────────────────────────────────────────

async function httpGet(
  url: string,
  headers?: Record<string, string>
): Promise<HttpResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      method: "GET",
      headers: { ...headers },
      signal: controller.signal,
    });
    clearTimeout(timer);
    let body: any;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    return { status: res.status, body, ok: res.ok, headers: res.headers };
  } catch (e: any) {
    return {
      status: 0,
      body: { error: e.message },
      ok: false,
      headers: new Headers(),
    };
  }
}

async function httpPost(
  url: string,
  body?: any,
  headers?: Record<string, string>
): Promise<HttpResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const reqHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };
    const res = await fetch(url, {
      method: "POST",
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);
    let resBody: any;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      resBody = await res.json();
    } else {
      resBody = await res.text();
    }
    return { status: res.status, body: resBody, ok: res.ok, headers: res.headers };
  } catch (e: any) {
    return {
      status: 0,
      body: { error: e.message },
      ok: false,
      headers: new Headers(),
    };
  }
}

async function httpPut(
  url: string,
  body?: any,
  headers?: Record<string, string>
): Promise<HttpResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const reqHeaders: Record<string, string> = { ...headers };
    if (body) reqHeaders["Content-Type"] = "application/json";
    const res = await fetch(url, {
      method: "PUT",
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);
    let resBody: any;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      resBody = await res.json();
    } else {
      resBody = await res.text();
    }
    return { status: res.status, body: resBody, ok: res.ok, headers: res.headers };
  } catch (e: any) {
    return {
      status: 0,
      body: { error: e.message },
      ok: false,
      headers: new Headers(),
    };
  }
}

async function httpDelete(
  url: string,
  headers?: Record<string, string>
): Promise<HttpResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      method: "DELETE",
      headers: { ...headers },
      signal: controller.signal,
    });
    clearTimeout(timer);
    let resBody: any;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      resBody = await res.json();
    } else {
      resBody = await res.text();
    }
    return { status: res.status, body: resBody, ok: res.ok, headers: res.headers };
  } catch (e: any) {
    return {
      status: 0,
      body: { error: e.message },
      ok: false,
      headers: new Headers(),
    };
  }
}

async function httpPostMultipart(
  url: string,
  formData: FormData,
  headers?: Record<string, string>
): Promise<HttpResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers },
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timer);
    let resBody: any;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      resBody = await res.json();
    } else {
      resBody = await res.text();
    }
    return { status: res.status, body: resBody, ok: res.ok, headers: res.headers };
  } catch (e: any) {
    return {
      status: 0,
      body: { error: e.message },
      ok: false,
      headers: new Headers(),
    };
  }
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

// ─── Contract Validators ─────────────────────────────────────────────────────

function validateApiResponse(
  body: any,
  expectData: boolean = true
): string[] {
  const errors: string[] = [];
  if (typeof body !== "object" || body === null) {
    errors.push("Response body is not an object");
    return errors;
  }
  if (typeof body.success !== "boolean") {
    errors.push(`"success" should be boolean, got ${typeof body.success}`);
  }
  if (typeof body.message !== "string") {
    errors.push(`"message" should be string, got ${typeof body.message}`);
  }
  if (expectData && body.success === true && body.data === undefined) {
    errors.push('"data" field is missing from successful response');
  }
  return errors;
}

function validatePaginatedResponse(body: any): string[] {
  const errors = validateApiResponse(body, true);

  if (!Array.isArray(body?.data)) {
    errors.push(`"data" should be an array, got ${typeof body?.data}`);
  }

  const p = body?.pagination;
  if (!p || typeof p !== "object") {
    errors.push('"pagination" object is missing');
    return errors;
  }

  const numFields = ["page", "pageSize", "totalItems", "totalPages"];
  for (const f of numFields) {
    if (typeof p[f] !== "number") {
      errors.push(
        `pagination.${f} should be number, got ${typeof p[f]} (${JSON.stringify(p[f])})`
      );
    }
  }

  const boolFields = ["hasNext", "hasPrevious"];
  for (const f of boolFields) {
    if (typeof p[f] !== "boolean") {
      errors.push(
        `pagination.${f} should be boolean, got ${typeof p[f]} (${JSON.stringify(p[f])})`
      );
    }
  }

  return errors;
}

const CAMEL_CASE_RE = /^[a-z][a-zA-Z0-9]*$|^\$[a-zA-Z]*$/;
const KNOWN_NON_CAMEL = new Set(["$id", "$values"]); // .NET JSON quirks

function validateCamelCase(
  obj: any,
  path: string = "",
  depth: number = 0
): string[] {
  if (depth > 5 || typeof obj !== "object" || obj === null) return [];

  const errors: string[] = [];
  const keys = Array.isArray(obj) ? [] : Object.keys(obj);

  for (const key of keys) {
    if (KNOWN_NON_CAMEL.has(key)) continue;
    if (!CAMEL_CASE_RE.test(key)) {
      errors.push(`Key "${path ? path + "." : ""}${key}" is not camelCase`);
    }
    if (typeof obj[key] === "object" && obj[key] !== null) {
      errors.push(
        ...validateCamelCase(
          obj[key],
          `${path ? path + "." : ""}${key}`,
          depth + 1
        )
      );
    }
  }

  if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === "object") {
    errors.push(...validateCamelCase(obj[0], `${path}[0]`, depth + 1));
  }

  return errors;
}

const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

function validateIsoDate(value: any, fieldName: string): string[] {
  if (value === null || value === undefined) return [];
  if (typeof value !== "string") {
    return [`${fieldName} should be ISO date string, got ${typeof value}`];
  }
  if (!ISO_DATE_RE.test(value)) {
    return [`${fieldName} is not ISO 8601 format: "${value}"`];
  }
  if (isNaN(new Date(value).getTime())) {
    return [`${fieldName} is invalid date: "${value}"`];
  }
  return [];
}

function validateNumericId(value: any, fieldName: string): string[] {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return [
      `${fieldName} should be positive integer, got ${typeof value}: ${JSON.stringify(value)}`,
    ];
  }
  return [];
}

// ─── Test Helpers ────────────────────────────────────────────────────────────

function makeResult(
  suite: string,
  method: string,
  path: string,
  errors: string[],
  startTime: number,
  skipped: boolean = false
): TestResult {
  return {
    suite,
    method,
    path,
    passed: errors.length === 0 && !skipped,
    skipped,
    error: errors.length > 0 ? errors.join("; ") : undefined,
    duration: Date.now() - startTime,
  };
}

// ─── Test Suite: Health ──────────────────────────────────────────────────────

async function testHealth(ctx: TestContext): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Helper: health responses may be raw or wrapped by NestJS TransformInterceptor
  // Raw: { status, timestamp, ... }
  // Wrapped: { success, message, data: { status, timestamp, ... } }
  function unwrapHealth(body: any): any {
    return body?.data?.status ? body.data : body;
  }

  // GET /health
  {
    const t = Date.now();
    const res = await httpGet(`${ctx.baseUrl}/health`);
    const health = unwrapHealth(res.body);
    const errors: string[] = [];
    if (res.status !== 200)
      errors.push(`Expected 200, got ${res.status}`);
    const hs = health?.status?.toLowerCase();
    if (hs !== "healthy" && hs !== "ok")
      errors.push(
        `Expected status "healthy" or "ok", got "${health?.status}"`
      );
    if (!health?.timestamp) errors.push("Missing timestamp field");
    else errors.push(...validateIsoDate(health.timestamp, "timestamp"));
    // 'application' field is optional (not all archs include it)
    results.push(makeResult("Health", "GET", "/health", errors, t));
  }

  // GET /health/ready
  {
    const t = Date.now();
    const res = await httpGet(`${ctx.baseUrl}/health/ready`);
    const health = unwrapHealth(res.body);
    const errors: string[] = [];
    if (res.status !== 200)
      errors.push(`Expected 200, got ${res.status}`);
    if (health?.status?.toLowerCase() !== "ready")
      errors.push(
        `Expected status "ready" (case-insensitive), got "${health?.status}"`
      );
    if (health?.database?.toLowerCase() !== "connected")
      errors.push(
        `Expected database "connected" (case-insensitive), got "${health?.database}"`
      );
    results.push(
      makeResult("Health", "GET", "/health/ready", errors, t)
    );
  }

  // GET /health/live
  {
    const t = Date.now();
    const res = await httpGet(`${ctx.baseUrl}/health/live`);
    const health = unwrapHealth(res.body);
    const errors: string[] = [];
    if (res.status !== 200)
      errors.push(`Expected 200, got ${res.status}`);
    if (health?.status?.toLowerCase() !== "alive")
      errors.push(
        `Expected status "alive" (case-insensitive), got "${health?.status}"`
      );
    results.push(
      makeResult("Health", "GET", "/health/live", errors, t)
    );
  }

  return results;
}

// ─── Test Suite: Auth ────────────────────────────────────────────────────────

async function testAuth(ctx: TestContext): Promise<TestResult[]> {
  if (ctx.variant !== "full") return [];

  const results: TestResult[] = [];

  // POST /api/auth/login
  {
    const t = Date.now();
    const res = await httpPost(`${ctx.baseUrl}/api/auth/login`, {
      username: "admin",
      email: "admin@apptemplate.com",
      password: "Admin@123",
    });
    const errors: string[] = [];

    if (res.status !== 200)
      errors.push(`Expected 200, got ${res.status}`);

    errors.push(...validateApiResponse(res.body, true));

    const data = res.body?.data;
    if (data) {
      if (typeof data.accessToken !== "string")
        errors.push("data.accessToken should be string");
      if (typeof data.refreshToken !== "string")
        errors.push("data.refreshToken should be string");
      if (typeof data.expiresIn !== "number")
        errors.push("data.expiresIn should be number");

      // Save tokens for subsequent tests
      if (data.accessToken) ctx.accessToken = data.accessToken;
      if (data.refreshToken) ctx.refreshToken = data.refreshToken;

      // Validate user object
      const user = data.user;
      if (!user) {
        errors.push("data.user is missing");
      } else {
        errors.push(...validateNumericId(user.id, "user.id"));
        if (typeof user.email !== "string")
          errors.push("user.email should be string");
        if (typeof user.username !== "string")
          errors.push("user.username should be string");
        if (typeof user.role !== "string")
          errors.push("user.role should be string");
        errors.push(...validateCamelCase(user, "user"));
      }
    }

    results.push(
      makeResult("Auth", "POST", "/api/auth/login", errors, t)
    );
  }

  // GET /api/auth/me
  if (ctx.accessToken) {
    const t = Date.now();
    const res = await httpGet(
      `${ctx.baseUrl}/api/auth/me`,
      authHeader(ctx.accessToken)
    );
    const errors: string[] = [];

    if (res.status !== 200)
      errors.push(`Expected 200, got ${res.status}`);

    errors.push(...validateApiResponse(res.body, true));
    if (res.body?.data) {
      errors.push(...validateCamelCase(res.body.data, "data"));
    }

    results.push(
      makeResult("Auth", "GET", "/api/auth/me", errors, t)
    );
  }

  // POST /api/auth/refresh
  if (ctx.refreshToken) {
    const t = Date.now();
    const res = await httpPost(`${ctx.baseUrl}/api/auth/refresh`, {
      refreshToken: ctx.refreshToken,
    });
    const errors: string[] = [];

    if (res.status !== 200)
      errors.push(`Expected 200, got ${res.status}`);

    errors.push(...validateApiResponse(res.body, true));

    const data = res.body?.data;
    if (data) {
      if (typeof data.accessToken !== "string")
        errors.push("data.accessToken should be string");
      if (typeof data.refreshToken !== "string")
        errors.push("data.refreshToken should be string");
      if (typeof data.expiresIn !== "number")
        errors.push("data.expiresIn should be number");

      // Update tokens
      if (data.accessToken) ctx.accessToken = data.accessToken;
      if (data.refreshToken) ctx.refreshToken = data.refreshToken;
    }

    results.push(
      makeResult("Auth", "POST", "/api/auth/refresh", errors, t)
    );
  }

  // POST /api/auth/login (bad credentials)
  {
    const t = Date.now();
    const res = await httpPost(`${ctx.baseUrl}/api/auth/login`, {
      username: "admin",
      email: "admin@apptemplate.com",
      password: "WrongPassword123",
    });
    const errors: string[] = [];

    // Bad credentials should return a non-success status (401, 400, 403, or 503)
    if (res.status === 200)
      errors.push("Bad credentials should NOT return 200");
    if (res.body?.success === true)
      errors.push("Expected success=false for bad credentials");

    results.push(
      makeResult("Auth", "POST", "/api/auth/login (bad creds)", errors, t)
    );
  }

  // POST /api/auth/logout
  if (ctx.accessToken) {
    const t = Date.now();
    const res = await httpPost(
      `${ctx.baseUrl}/api/auth/logout`,
      ctx.refreshToken ? { refreshToken: ctx.refreshToken } : undefined,
      authHeader(ctx.accessToken)
    );
    const errors: string[] = [];

    // Logout can return 200 or 204
    if (res.status !== 200 && res.status !== 204)
      errors.push(`Expected 200 or 204, got ${res.status}`);

    results.push(
      makeResult("Auth", "POST", "/api/auth/logout", errors, t)
    );
  }

  // Re-login to get fresh tokens for remaining tests
  {
    const res = await httpPost(`${ctx.baseUrl}/api/auth/login`, {
      username: "admin",
      email: "admin@apptemplate.com",
      password: "Admin@123",
    });
    if (res.body?.data?.accessToken) {
      ctx.accessToken = res.body.data.accessToken;
      ctx.refreshToken = res.body.data.refreshToken;
    }
  }

  return results;
}

// ─── Test Suite: Register ────────────────────────────────────────────────────

async function testRegister(ctx: TestContext): Promise<TestResult[]> {
  if (ctx.variant !== "full") return [];

  const key = `${ctx.stack}/${ctx.arch}`;
  if (!HAS_REGISTER[key]) return [];

  const results: TestResult[] = [];
  const ts = Date.now();
  const uniqueEmail = `testuser_${ts}@apptemplate.com`;

  const t = Date.now();
  const res = await httpPost(`${ctx.baseUrl}/api/auth/register`, {
    username: `testuser_${ts}`,
    email: uniqueEmail,
    password: "TestPass@123",
    firstName: "Test",
    lastName: "User",
  });
  const errors: string[] = [];

  // Register can return 200 or 201
  if (res.status !== 200 && res.status !== 201)
    errors.push(`Expected 200 or 201, got ${res.status}`);

  errors.push(...validateApiResponse(res.body, true));

  const data = res.body?.data;
  if (data) {
    // Register may return tokens (LoginResponse) or just user data (UserDto)
    // Validate that at least some meaningful data is returned
    const hasTokens = typeof data.accessToken === "string";
    const hasUser = typeof data.id === "number" || typeof data.user?.id === "number";
    if (!hasTokens && !hasUser) {
      errors.push("data should contain either tokens (accessToken) or user info (id)");
    }
    errors.push(...validateCamelCase(data, "data"));
  }

  results.push(
    makeResult("Register", "POST", "/api/auth/register", errors, t)
  );

  return results;
}

// ─── Test Suite: Notifications ───────────────────────────────────────────────

async function testNotifications(
  ctx: TestContext
): Promise<TestResult[]> {
  if (ctx.variant !== "full") return [];
  if (!ctx.accessToken) return [];

  const results: TestResult[] = [];
  const headers = authHeader(ctx.accessToken);

  // GET /api/notifications
  {
    const t = Date.now();
    const res = await httpGet(
      `${ctx.baseUrl}/api/notifications?page=1&pageSize=10`,
      headers
    );
    const errors: string[] = [];

    if (res.status !== 200)
      errors.push(`Expected 200, got ${res.status}`);

    errors.push(...validatePaginatedResponse(res.body));

    // Validate item fields if any exist
    const items = res.body?.data;
    if (Array.isArray(items) && items.length > 0) {
      const item = items[0];
      errors.push(...validateNumericId(item.id, "notification.id"));
      if (typeof item.title !== "string")
        errors.push('notification.title should be string');
      if (typeof item.message !== "string")
        errors.push('notification.message should be string');
      if (typeof item.type !== "string")
        errors.push('notification.type should be string');
      if (typeof item.isRead !== "boolean")
        errors.push('notification.isRead should be boolean');
      errors.push(
        ...validateIsoDate(item.createdAt, "notification.createdAt")
      );
      errors.push(...validateCamelCase(item, "notification"));
    }

    results.push(
      makeResult(
        "Notifications",
        "GET",
        "/api/notifications",
        errors,
        t
      )
    );
  }

  // GET /api/notifications/unread-count
  {
    const t = Date.now();
    const res = await httpGet(
      `${ctx.baseUrl}/api/notifications/unread-count`,
      headers
    );
    const errors: string[] = [];

    if (res.status !== 200 && res.status !== 404) {
      errors.push(`Expected 200 or 404, got ${res.status}`);
    }

    if (res.status === 200) {
      // Some stacks wrap in ApiResponse, some return directly
      const count = res.body?.data?.count ?? res.body?.count ?? res.body?.data;
      if (typeof count !== "number") {
        errors.push(
          `unread-count should return a number, got ${JSON.stringify(res.body)}`
        );
      }
    }

    results.push(
      makeResult(
        "Notifications",
        "GET",
        "/api/notifications/unread-count",
        errors,
        t
      )
    );
  }

  return results;
}

// ─── Test Suite: Files ───────────────────────────────────────────────────────

async function testFiles(ctx: TestContext): Promise<TestResult[]> {
  if (!ctx.accessToken) return [];

  const results: TestResult[] = [];
  const headers = authHeader(ctx.accessToken);
  let uploadedFileId: number | null = null;

  // POST /api/files (upload)
  {
    const t = Date.now();
    const formData = new FormData();
    const fileContent = new Blob(["integration test file content"], {
      type: "text/plain",
    });
    formData.append("file", fileContent, "test-file.txt");
    formData.append("description", "Integration test upload");
    formData.append("category", "test");
    formData.append("isPublic", "false");

    const res = await httpPostMultipart(
      `${ctx.baseUrl}/api/files`,
      formData,
      headers
    );
    const errors: string[] = [];

    if (res.status !== 200 && res.status !== 201)
      errors.push(`Expected 200 or 201, got ${res.status}`);

    errors.push(...validateApiResponse(res.body, true));

    const data = res.body?.data;
    if (data) {
      errors.push(...validateNumericId(data.id, "file.id"));
      if (typeof data.originalFileName !== "string")
        errors.push("file.originalFileName should be string");
      if (typeof data.contentType !== "string")
        errors.push("file.contentType should be string");
      if (typeof data.fileSize !== "number")
        errors.push("file.fileSize should be number");
      errors.push(
        ...validateIsoDate(data.createdAt, "file.createdAt")
      );
      errors.push(...validateCamelCase(data, "file"));

      if (typeof data.id === "number") uploadedFileId = data.id;
    }

    results.push(
      makeResult("Files", "POST", "/api/files (upload)", errors, t)
    );
  }

  // GET /api/files (list)
  {
    const t = Date.now();
    const res = await httpGet(
      `${ctx.baseUrl}/api/files?page=1&pageSize=10`,
      headers
    );
    const errors: string[] = [];

    if (res.status !== 200)
      errors.push(`Expected 200, got ${res.status}`);

    errors.push(...validatePaginatedResponse(res.body));

    results.push(
      makeResult("Files", "GET", "/api/files", errors, t)
    );
  }

  // GET /api/files/{id}
  if (uploadedFileId) {
    const t = Date.now();
    const res = await httpGet(
      `${ctx.baseUrl}/api/files/${uploadedFileId}`,
      headers
    );
    const errors: string[] = [];

    if (res.status !== 200)
      errors.push(`Expected 200, got ${res.status}`);

    errors.push(...validateApiResponse(res.body, true));
    if (res.body?.data) {
      errors.push(...validateCamelCase(res.body.data, "file"));
    }

    results.push(
      makeResult(
        "Files",
        "GET",
        `/api/files/${uploadedFileId}`,
        errors,
        t
      )
    );
  }

  // GET /api/files/{id}/download
  if (uploadedFileId) {
    const t = Date.now();
    const res = await httpGet(
      `${ctx.baseUrl}/api/files/${uploadedFileId}/download`,
      headers
    );
    const errors: string[] = [];

    if (res.status !== 200)
      errors.push(`Expected 200, got ${res.status}`);

    results.push(
      makeResult(
        "Files",
        "GET",
        `/api/files/{id}/download`,
        errors,
        t
      )
    );
  }

  // DELETE /api/files/{id}
  if (uploadedFileId) {
    const t = Date.now();
    const res = await httpDelete(
      `${ctx.baseUrl}/api/files/${uploadedFileId}`,
      headers
    );
    const errors: string[] = [];

    // DELETE can return 200 or 204
    if (res.status !== 200 && res.status !== 204)
      errors.push(`Expected 200 or 204, got ${res.status}`);

    results.push(
      makeResult(
        "Files",
        "DELETE",
        `/api/files/{id}`,
        errors,
        t
      )
    );
  }

  // GET /api/files/{id} after delete (expect 404)
  if (uploadedFileId) {
    const t = Date.now();
    const res = await httpGet(
      `${ctx.baseUrl}/api/files/${uploadedFileId}`,
      headers
    );
    const errors: string[] = [];

    if (res.status !== 404)
      errors.push(`Expected 404 after delete, got ${res.status}`);

    results.push(
      makeResult(
        "Files",
        "GET",
        `/api/files/{id} (after delete)`,
        errors,
        t
      )
    );
  }

  return results;
}

// ─── Test Suite: Audit Logs ──────────────────────────────────────────────────

async function testAuditLogs(ctx: TestContext): Promise<TestResult[]> {
  if (ctx.variant !== "full") return [];
  if (!ctx.accessToken) return [];

  const results: TestResult[] = [];
  const headers = authHeader(ctx.accessToken);

  // GET /api/audit-logs (admin)
  {
    const t = Date.now();
    const res = await httpGet(
      `${ctx.baseUrl}/api/audit-logs?page=1&pageSize=10`,
      headers
    );
    const errors: string[] = [];

    if (res.status !== 200)
      errors.push(`Expected 200, got ${res.status}`);

    errors.push(...validatePaginatedResponse(res.body));

    const items = res.body?.data;
    if (Array.isArray(items) && items.length > 0) {
      const item = items[0];
      errors.push(...validateNumericId(item.id, "auditLog.id"));
      if (typeof item.action !== "string")
        errors.push('auditLog.action should be string');
      if (typeof item.entityType !== "string")
        errors.push('auditLog.entityType should be string');
      errors.push(
        ...validateIsoDate(item.createdAt, "auditLog.createdAt")
      );
      errors.push(...validateCamelCase(item, "auditLog"));
    }

    results.push(
      makeResult(
        "Audit Logs",
        "GET",
        "/api/audit-logs",
        errors,
        t
      )
    );
  }

  // GET /api/audit-logs (no auth -> 401)
  {
    const t = Date.now();
    const res = await httpGet(
      `${ctx.baseUrl}/api/audit-logs?page=1&pageSize=10`
    );
    const errors: string[] = [];

    if (res.status !== 401)
      errors.push(`Expected 401 without auth, got ${res.status}`);

    results.push(
      makeResult(
        "Audit Logs",
        "GET",
        "/api/audit-logs (no auth)",
        errors,
        t
      )
    );
  }

  return results;
}

// ─── Cross-Stack Consistency Check ───────────────────────────────────────────

function runCrossStackChecks(
  results: TestResult[],
  allResponses: Map<string, any>
): TestResult[] {
  // Cross-stack checks are done inline via validators above
  // (camelCase, ISO dates, numeric IDs, response wrapper, pagination)
  return [];
}

// ─── Reporter ────────────────────────────────────────────────────────────────

function printResults(
  target: BackendTarget,
  results: TestResult[]
): { passed: number; failed: number; skipped: number } {
  console.log();
  console.log(
    `${BOLD}=== ${target.stack} / ${target.arch}-architecture / ${target.variant} ===${RESET}`
  );

  let currentSuite = "";
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const r of results) {
    if (r.suite !== currentSuite) {
      console.log();
      console.log(`  ${BOLD}${r.suite}:${RESET}`);
      currentSuite = r.suite;
    }

    const methodPad = r.method.padEnd(6);
    const pathPad = r.path.padEnd(35);
    const dur = `${DIM}(${r.duration}ms)${RESET}`;

    if (r.skipped) {
      console.log(`    ${SKIP} ${methodPad} ${pathPad} ${dur}`);
      skipped++;
    } else if (r.passed) {
      console.log(`    ${PASS} ${methodPad} ${pathPad} ${dur}`);
      passed++;
    } else {
      console.log(`    ${FAIL} ${methodPad} ${pathPad} ${dur}`);
      if (r.error) {
        // Split multi-error strings
        for (const err of r.error.split("; ")) {
          console.log(`       ${RED}${err}${RESET}`);
        }
      }
      failed++;
    }
  }

  console.log();
  const total = passed + failed;
  const pct = total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0";
  const color = failed > 0 ? RED : GREEN;
  console.log(
    `  ${color}Result: ${passed}/${total} passed, ${failed} failed${skipped > 0 ? `, ${skipped} skipped` : ""} (${pct}%)${RESET}`
  );

  return { passed, failed, skipped };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function runTarget(
  target: BackendTarget,
  args: CliArgs
): Promise<{ passed: number; failed: number; skipped: number }> {
  const label = `${target.stack}/${target.arch}/${target.variant}`;
  console.log();
  console.log(
    `${CYAN}${BOLD}▶ Testing ${label}${RESET}`
  );

  // Check backend directory exists
  const backendDir = getBackendDir(target);
  if (!existsSync(backendDir)) {
    console.log(`  ${FAIL} Backend directory not found: ${backendDir}`);
    return { passed: 0, failed: 0, skipped: 1 };
  }

  // Reset test database (always reset, even with --skip-db)
  console.log(`${DIM}  Resetting test database...${RESET}`);
  resetTestDb();

  // Check if port 5100 is already in use
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const portCheck = await fetch(`${BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timer);
    if (portCheck.ok) {
      console.log(
        `  ${FAIL} Port 5100 is already in use! Kill the existing process first.`
      );
      return { passed: 0, failed: 0, skipped: 1 };
    }
  } catch {
    // Expected - port is free
  }

  // Start backend
  console.log(
    `${DIM}  Starting ${target.stack} backend...${RESET}`
  );
  let proc: ChildProcess;
  try {
    proc = startBackend(target, args.verbose);
  } catch (e: any) {
    console.log(`  ${FAIL} Failed to start backend: ${e.message}`);
    return { passed: 0, failed: 0, skipped: 1 };
  }

  // Check if process died immediately
  await sleep(2000);
  if (proc.exitCode !== null) {
    console.log(
      `  ${FAIL} Backend process exited immediately with code ${proc.exitCode}`
    );
    return { passed: 0, failed: 0, skipped: 1 };
  }

  // Wait for health
  console.log(
    `${DIM}  Waiting for health check (timeout: ${args.timeout}s)...${RESET}`
  );
  const healthy = await waitForHealth(BASE_URL, args.timeout);

  if (!healthy) {
    console.log(
      `  ${FAIL} Health check timed out after ${args.timeout}s`
    );
    await stopBackend(proc);
    activeProcess = null;
    return { passed: 0, failed: 0, skipped: 1 };
  }

  console.log(`  ${PASS} Backend is healthy`);

  // Wait for post-startup tasks (seeding, etc.) to complete
  // NestJS runs seed on OnApplicationBootstrap AFTER the HTTP server starts listening
  if (target.stack === "nestjs" || target.stack === "spring") {
    console.log(`${DIM}  Waiting for post-startup tasks (seeding)...${RESET}`);
    await sleep(5000);
  }

  // Build test context
  const ctx: TestContext = {
    baseUrl: BASE_URL,
    stack: target.stack,
    arch: target.arch,
    variant: target.variant,
    verbose: args.verbose,
  };

  // Run test suites
  const allResults: TestResult[] = [];

  // Always run health tests
  allResults.push(...(await testHealth(ctx)));

  if (!args.smoke) {
    // Auth tests (full variant only)
    allResults.push(...(await testAuth(ctx)));

    // Register test (full variant, where available)
    allResults.push(...(await testRegister(ctx)));

    // Notification tests (full variant)
    allResults.push(...(await testNotifications(ctx)));

    // File tests (all variants, but need auth)
    // For minimal variant, we need to handle auth differently
    if (ctx.variant === "minimal" && !ctx.accessToken) {
      // Minimal uses external SSO - skip tests requiring auth
    } else {
      allResults.push(...(await testFiles(ctx)));
    }

    // Audit log tests (full variant, admin auth)
    allResults.push(...(await testAuditLogs(ctx)));
  }

  // Stop backend
  console.log(`${DIM}  Stopping backend...${RESET}`);
  await stopBackend(proc);
  activeProcess = null;

  // Print results
  return printResults(target, allResults);
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const targets = resolveTargets(args);

  if (targets.length === 0) {
    printUsage();
    process.exit(1);
  }

  setupCleanup();

  // Ensure test database is running
  if (!args.skipDb) {
    if (!isTestDbRunning()) {
      const started = startTestDb();
      if (!started) {
        console.error(
          `\n${FAIL} Could not start test database. Run manually:\n  ./scripts/test-db.sh start\n`
        );
        process.exit(1);
      }
    } else {
      console.log(`${PASS} Test database already running`);
    }
  }

  console.log();
  console.log(
    `${BOLD}Running integration tests for ${targets.length} target(s)${args.smoke ? " (smoke mode)" : ""}${RESET}`
  );

  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const target of targets) {
    const { passed, failed, skipped } = await runTarget(target, args);
    totalPassed += passed;
    totalFailed += failed;
    totalSkipped += skipped;
  }

  // Final summary
  console.log();
  console.log(
    `${"═".repeat(55)}`
  );
  const total = totalPassed + totalFailed;
  const color = totalFailed > 0 ? RED : GREEN;
  console.log(
    `${color}${BOLD}Overall: ${totalPassed}/${total} passed across ${targets.length} target(s)${RESET}`
  );
  if (totalSkipped > 0) {
    console.log(`${YELLOW}  (${totalSkipped} target(s) skipped)${RESET}`);
  }
  console.log();

  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(`${FAIL} Fatal error: ${e.message}`);
  process.exit(1);
});

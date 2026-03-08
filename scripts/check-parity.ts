/**
 * Feature Parity Checker
 *
 * Validates that all architectures of the same stack offer the same features,
 * and that all frontend variants at the same level (full/minimal) are consistent.
 *
 * Checks:
 *   Backend (dotnet): endpoints, entities, health checks, Docker features
 *   Frontend: pages/routes, stores, services, i18n top-level keys
 *
 * Usage: npx tsx scripts/check-parity.ts
 * Exit code: 0 = all match, 1 = mismatches found
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, relative, basename, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

const PASS = "\x1b[32m✅\x1b[0m";
const FAIL = "\x1b[31m❌\x1b[0m";
const WARN = "\x1b[33m⚠️\x1b[0m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";

let totalIssues = 0;

function rel(p: string): string {
  return relative(ROOT, p).replace(/\\/g, "/");
}

function readFile(p: string): string {
  return readFileSync(p, "utf-8");
}

function findFilesRecursive(dir: string, ext?: string): string[] {
  if (!existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "node_modules") continue;
      results.push(...findFilesRecursive(fullPath, ext));
    } else if (!ext || entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

function printHeader(title: string): void {
  console.log();
  console.log(`${BOLD}=== ${title} ===${RESET}`);
}

function printSubHeader(title: string): void {
  console.log();
  console.log(`  ${BOLD}${title}:${RESET}`);
}

/**
 * Compare sets across groups, report present/missing.
 * Items in `frameworkDiffs` are shown as informational (not counted as issues).
 */
function compareFeatures(
  label: string,
  groups: Map<string, Set<string>>,
  frameworkDiffs?: Set<string>
): number {
  const allItems = new Set<string>();
  for (const items of groups.values()) {
    for (const item of items) allItems.add(item);
  }

  const groupNames = [...groups.keys()];
  let issues = 0;

  const sorted = [...allItems].sort();
  for (const item of sorted) {
    const presentIn = groupNames.filter((g) => groups.get(g)!.has(item));
    const missingFrom = groupNames.filter((g) => !groups.get(g)!.has(item));

    if (missingFrom.length === 0) {
      console.log(
        `    ${PASS} ${item} — present in all ${groupNames.length} ${label}`
      );
    } else {
      const shortMissing = missingFrom.map((m) => {
        const parts = m.split("/");
        return parts.length > 2 ? parts.slice(-2).join("/") : m;
      });

      if (frameworkDiffs?.has(item)) {
        // Known framework-level difference — informational only
        console.log(
          `    ${WARN} ${item} — framework-specific ${DIM}(not in ${shortMissing.join(", ")})${RESET}`
        );
      } else {
        console.log(
          `    ${FAIL} ${item} — missing in ${shortMissing.join(", ")}`
        );
        issues++;
      }
    }
  }

  return issues;
}

// ─── Backend Parity ──────────────────────────────────────────────────────────

interface ControllerInfo {
  name: string;
  routePrefix: string;
  endpoints: string[]; // "METHOD /path"
}

function extractControllerRoutes(filePath: string): ControllerInfo | null {
  const content = readFile(filePath);
  const name = basename(filePath, ".cs");

  // Extract class-level [Route("...")] attribute
  const routeMatch = content.match(
    /\[Route\("([^"]+)"\)\]\s*(?:\r?\n.*)*?public\s+class/
  );
  let routePrefix = routeMatch ? routeMatch[1] : "";

  // Replace [controller] token with controller name (minus "Controller" suffix)
  const controllerName = name.replace("Controller", "").toLowerCase();
  routePrefix = routePrefix.replace("[controller]", controllerName);

  // Extract all [Http*] attributes
  const endpoints: string[] = [];
  const httpRegex =
    /\[(Http(?:Get|Post|Put|Delete|Patch))(?:\("([^"]*)")?\)\]/g;
  let match;
  while ((match = httpRegex.exec(content)) !== null) {
    const method = match[1]
      .replace("Http", "")
      .toUpperCase();
    let path = match[2] || "";

    // Handle absolute paths (starting with /)
    if (path.startsWith("/")) {
      endpoints.push(`${method} ${path}`);
    } else {
      const fullPath = path
        ? `/${routePrefix}/${path}`.replace(/\/+/g, "/")
        : `/${routePrefix}`.replace(/\/+/g, "/");
      endpoints.push(`${method} ${fullPath}`);
    }
  }

  return { name, routePrefix, endpoints };
}

/** Normalize endpoint for comparison (remove type constraints, normalize separators) */
function normalizeEndpoint(ep: string): string {
  return ep
    .replace(/\{(\w+):long\}/g, "{$1}") // {id:long} → {id}
    .replace(/\{(\w+):int\}/g, "{$1}") // {id:int} → {id}
    .replace(/\/+/g, "/") // collapse slashes
    .replace(/\/$/, ""); // remove trailing slash
}

function checkBackendParity(
  stack: string,
  variant: string
): void {
  const architectures = ["clean", "feature", "nlayer"];
  const archDirs = new Map<string, string>();

  for (const arch of architectures) {
    const dir = resolve(
      ROOT,
      `backend/${stack}/${arch}-architecture/${variant}`
    );
    if (existsSync(dir)) {
      archDirs.set(`${arch}-architecture`, dir);
    }
  }

  if (archDirs.size < 2) return;

  printHeader(`Backend Feature Parity (${stack}, ${variant})`);

  // --- Controllers ---
  printSubHeader("Controllers");
  const controllerSets = new Map<string, Set<string>>();
  for (const [arch, dir] of archDirs) {
    const controllers = findFilesRecursive(dir, "Controller.cs")
      .map((f) => basename(f, ".cs"))
      .sort();
    controllerSets.set(arch, new Set(controllers));
  }
  totalIssues += compareFeatures("architectures", controllerSets);

  // --- Endpoints ---
  printSubHeader("API Endpoints");
  const endpointSets = new Map<string, Set<string>>();
  for (const [arch, dir] of archDirs) {
    const controllerFiles = findFilesRecursive(dir, "Controller.cs");
    const endpoints = new Set<string>();
    for (const file of controllerFiles) {
      const info = extractControllerRoutes(file);
      if (info) {
        for (const ep of info.endpoints) {
          endpoints.add(normalizeEndpoint(ep));
        }
      }
    }
    endpointSets.set(arch, endpoints);
  }
  totalIssues += compareFeatures("architectures", endpointSets);

  // --- Entities ---
  printSubHeader("Entity Classes");
  const entitySets = new Map<string, Set<string>>();
  for (const [arch, dir] of archDirs) {
    const entities = new Set<string>();
    const csFiles = findFilesRecursive(dir, ".cs");
    for (const file of csFiles) {
      const relPath = relative(dir, file).replace(/\\/g, "/");

      // Include files from known entity directories
      const isEntityDir =
        /Entities\//.test(relPath) ||
        /Domain\/Entities\//.test(relPath) ||
        /Models\/Entities\//.test(relPath);

      // Include entity files co-located in feature folders (feature-arch pattern)
      const content = readFile(file);
      const classMatch = content.match(
        /public\s+(?:abstract\s+)?class\s+(\w+)/
      );
      if (!classMatch) continue;

      const className = classMatch[1];

      // Skip test files
      if (/[Tt]ests?[/\\]/.test(relPath) || basename(file).includes("Test"))
        continue;

      // Skip non-entity classes (services, controllers, DTOs, etc.)
      if (
        className.endsWith("Controller") ||
        className.endsWith("Service") ||
        className.endsWith("Repository") ||
        className.endsWith("Dto") ||
        className.endsWith("Request") ||
        className.endsWith("Response") ||
        className.endsWith("Handler") ||
        className.endsWith("Command") ||
        className.endsWith("Query") ||
        className.endsWith("Hub") ||
        className.endsWith("Validator") ||
        className.endsWith("Behavior") ||
        className.endsWith("Configuration") ||
        className.endsWith("Extensions") ||
        className.endsWith("Context") ||
        className.endsWith("Seeder") ||
        className.endsWith("Middleware") ||
        className.endsWith("Filter") ||
        className.endsWith("Interceptor") ||
        className.endsWith("Exception") ||
        className.endsWith("Result") ||
        className.endsWith("Options") ||
        className.endsWith("Settings") ||
        className.endsWith("Profile") ||
        className.endsWith("Mapping") ||
        className.endsWith("Tests")
      )
        continue;

      if (isEntityDir) {
        entities.add(className);
      } else if (
        /public\s+(?:abstract\s+)?class\s+\w+\s*:\s*AuditableEntity/.test(
          content
        )
      ) {
        // Entity extending AuditableEntity in any location (feature-arch)
        entities.add(className);
      } else if (
        // Stand-alone entity classes in feature folders (has Id property, in Features/ dir)
        /Features\//.test(relPath) &&
        !basename(file).includes("Dto") &&
        /public\s+(?:long|int|Guid)\s+Id\s*\{/.test(content) &&
        !/Service|Controller|Repository|Hub/.test(className)
      ) {
        entities.add(className);
      }
    }
    entitySets.set(arch, entities);
  }
  totalIssues += compareFeatures("architectures", entitySets);

  // --- Dockerfile features ---
  printSubHeader("Dockerfile Features");
  const dockerFeatures = new Map<string, Set<string>>();
  for (const [arch, dir] of archDirs) {
    const features = new Set<string>();
    const dockerfile = resolve(dir, "Dockerfile");
    if (existsSync(dockerfile)) {
      const content = readFile(dockerfile);
      features.add("Dockerfile exists");
      if (/HEALTHCHECK/i.test(content)) features.add("HEALTHCHECK");
      if (/USER\s+(?!root)\w+/i.test(content))
        features.add("Non-root user");
      if (/FROM.*AS\s+build/i.test(content))
        features.add("Multi-stage build");
      if (/curl/i.test(content)) features.add("curl installed");
      if (/EXPOSE/i.test(content)) features.add("EXPOSE directive");
    }
    dockerFeatures.set(arch, features);
  }
  totalIssues += compareFeatures("architectures", dockerFeatures);

  // --- Health check depth ---
  printSubHeader("Health Check Endpoints");
  const healthSets = new Map<string, Set<string>>();
  for (const [arch, dir] of archDirs) {
    const healthEndpoints = new Set<string>();
    const healthFiles = findFilesRecursive(dir, ".cs").filter((f) =>
      basename(f).includes("Health")
    );
    for (const file of healthFiles) {
      const info = extractControllerRoutes(file);
      if (info) {
        for (const ep of info.endpoints) {
          healthEndpoints.add(normalizeEndpoint(ep));
        }
      }
    }
    healthSets.set(arch, healthEndpoints);
  }
  totalIssues += compareFeatures("architectures", healthSets);
}

// ─── Frontend Parity ─────────────────────────────────────────────────────────

interface FrontendVariant {
  label: string;
  dir: string;
  framework: "vue" | "react";
  uiLib: string;
}

function getFrontendVariants(level: "full" | "minimal" | "zero"): FrontendVariant[] {
  const variants: FrontendVariant[] = [];
  const configs = [
    { framework: "vue" as const, uiLib: "vuetify" },
    { framework: "vue" as const, uiLib: "primevue" },
    { framework: "react" as const, uiLib: "mui" },
    { framework: "react" as const, uiLib: "primereact" },
  ];

  for (const { framework, uiLib } of configs) {
    const dir = resolve(ROOT, `frontend/${framework}/${uiLib}/${level}`);
    if (existsSync(dir)) {
      variants.push({
        label: `${framework}/${uiLib}`,
        dir,
        framework,
        uiLib,
      });
    }
  }
  return variants;
}

/** Get page names from a frontend variant */
function getPages(variant: FrontendVariant): Set<string> {
  const pagesDir = resolve(variant.dir, "src/pages");
  const pages = new Set<string>();

  if (!existsSync(pagesDir)) return pages;

  if (variant.framework === "vue") {
    // Vue: file-based routing, .vue files
    const files = findFilesRecursive(pagesDir, ".vue");
    for (const f of files) {
      const relPath = relative(pagesDir, f).replace(/\\/g, "/");
      // Normalize: index.vue → folder name, or file.vue → file name
      const pageName = relPath
        .replace(/\/index\.vue$/, "")
        .replace(/\.vue$/, "")
        .toLowerCase();
      if (pageName) pages.add(pageName);
    }
  } else {
    // React: component files, .tsx
    const files = findFilesRecursive(pagesDir, ".tsx");
    for (const f of files) {
      const name = basename(f, ".tsx");
      // Skip test files
      if (name.endsWith(".test")) continue;
      // Normalize to lowercase kebab-case for comparison
      const normalized = name
        .replace(/Page$/, "") // FilesPage → Files
        .replace(/([a-z])([A-Z])/g, "$1-$2") // AuditLogs → Audit-Logs
        .toLowerCase();
      pages.add(normalized);
    }
  }

  return pages;
}

/** Get store file names from a frontend variant */
function getStores(variant: FrontendVariant): Set<string> {
  const storesDir = resolve(variant.dir, "src/stores");
  const stores = new Set<string>();

  if (!existsSync(storesDir)) return stores;

  const ext = variant.framework === "vue" ? ".js" : ".ts";
  const entries = readdirSync(storesDir).filter(
    (f) =>
      f.endsWith(ext) &&
      !f.endsWith(`.test${ext}`) &&
      f !== `index${ext}`
  );

  for (const entry of entries) {
    // Normalize: auth.js → auth, authStore.ts → auth
    const name = entry
      .replace(ext, "")
      .replace(/Store$/, "")
      .toLowerCase();
    stores.add(name);
  }

  return stores;
}

/** Get service file names from a frontend variant */
function getServices(variant: FrontendVariant): Set<string> {
  const servicesDir = resolve(variant.dir, "src/services");
  const services = new Set<string>();

  if (!existsSync(servicesDir)) return services;

  const ext = variant.framework === "vue" ? ".js" : ".ts";
  const entries = readdirSync(servicesDir).filter(
    (f) =>
      f.endsWith(ext) &&
      !f.endsWith(`.test${ext}`) &&
      f !== `index${ext}` &&
      f !== `api${ext}` // Exclude base axios instance
  );

  for (const entry of entries) {
    // Normalize: authApi.js → authApi, authApi.ts → authApi
    const name = entry.replace(ext, "").toLowerCase();
    services.add(name);
  }

  return services;
}

/** Get top-level i18n keys from en.json */
function getI18nKeys(variant: FrontendVariant): Set<string> {
  const enPath = resolve(variant.dir, "src/i18n/locales/en.json");
  if (!existsSync(enPath)) return new Set();

  try {
    const content = JSON.parse(readFile(enPath));
    return new Set(Object.keys(content));
  } catch {
    return new Set();
  }
}

function checkFrontendParity(level: "full" | "minimal" | "zero"): void {
  const variants = getFrontendVariants(level);
  if (variants.length < 2) return;

  printHeader(`Frontend Feature Parity (${level})`);

  // Known framework-level differences (Vue file-routing vs React explicit routing)
  const pageFrameworkDiffs = new Set(["index"]); // Vue index.vue = root redirect, React does this in router config
  const storeFrameworkDiffs = new Set(["app"]); // Vue app.js store, React handles differently

  // --- Pages ---
  printSubHeader("Pages");
  const pageSets = new Map<string, Set<string>>();
  for (const v of variants) {
    pageSets.set(v.label, getPages(v));
  }
  totalIssues += compareFeatures("variants", pageSets, pageFrameworkDiffs);

  // --- Stores ---
  printSubHeader("Stores");
  const storeSets = new Map<string, Set<string>>();
  for (const v of variants) {
    storeSets.set(v.label, getStores(v));
  }
  totalIssues += compareFeatures("variants", storeSets, storeFrameworkDiffs);

  // --- Services ---
  printSubHeader("Services");
  const serviceSets = new Map<string, Set<string>>();
  for (const v of variants) {
    serviceSets.set(v.label, getServices(v));
  }
  totalIssues += compareFeatures("variants", serviceSets);

  // --- i18n Keys ---
  printSubHeader("i18n Top-Level Keys");
  const i18nSets = new Map<string, Set<string>>();
  for (const v of variants) {
    i18nSets.set(v.label, getI18nKeys(v));
  }
  totalIssues += compareFeatures("variants", i18nSets);
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main(): void {
  console.log(
    `${BOLD}Feature Parity Checker${RESET} ${DIM}— checking cross-variant consistency${RESET}`
  );

  // Backend checks
  checkBackendParity("dotnet", "full");
  checkBackendParity("dotnet", "minimal");
  checkBackendParity("dotnet", "zero");

  // Frontend checks
  checkFrontendParity("full");
  checkFrontendParity("minimal");
  checkFrontendParity("zero");

  // Summary
  console.log();
  if (totalIssues === 0) {
    console.log(`${PASS} ${BOLD}All parity checks passed!${RESET}`);
  } else {
    console.log(
      `${FAIL} ${BOLD}${totalIssues} parity issue${totalIssues === 1 ? "" : "s"} found${RESET}`
    );
  }
  console.log();

  process.exit(totalIssues > 0 ? 1 : 0);
}

main();

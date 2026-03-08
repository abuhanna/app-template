/**
 * Version Sync Automation
 *
 * Reads manifest.json as source of truth and updates all template
 * variant files (.csproj, pom.xml, package.json, Dockerfile) to match.
 *
 * Usage:
 *   npx tsx scripts/sync-versions.ts              # Sync all
 *   npx tsx scripts/sync-versions.ts --dry-run     # Preview changes
 *   npx tsx scripts/sync-versions.ts --stack dotnet # Sync one stack
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, relative, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

function rel(p: string): string {
  return relative(ROOT, p).replace(/\\/g, "/");
}

function readFile(p: string): string {
  return readFileSync(p, "utf-8");
}

function findFiles(dirPattern: string, cwd = ROOT): string[] {
  const parts = dirPattern.split("/**/");
  const dir = parts[0];
  const fileFilter = parts.length > 1 ? parts[1] : parts[0];

  try {
    const cmd = `git ls-files --full-name -- "${dir}/"`;
    const result = execSync(cmd, { cwd, encoding: "utf-8" }).trim();
    if (!result) return [];

    const allFiles = result.split("\n");

    if (fileFilter.startsWith("*.")) {
      const ext = fileFilter.slice(1);
      return allFiles
        .filter((f) => f.endsWith(ext))
        .map((f) => resolve(cwd, f));
    } else {
      return allFiles
        .filter((f) => basename(f) === fileFilter)
        .map((f) => resolve(cwd, f));
    }
  } catch {
    return [];
  }
}

function findComposeFiles(): string[] {
  try {
    const cmd = `git ls-files --full-name -- "shared/templates/"`;
    const result = execSync(cmd, { cwd: ROOT, encoding: "utf-8" }).trim();
    if (!result) return [];
    return result
      .split("\n")
      .filter((f) => /docker-compose.*\.yml$/.test(basename(f)))
      .map((f) => resolve(ROOT, f));
  } catch {
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Manifest {
  dotnet: {
    framework: string;
    packages: Record<string, string>;
  };
  spring: {
    javaVersion: string;
    springBootVersion: string;
    packages: Record<string, string>;
    plugins: Record<string, string>;
  };
  nestjs: {
    nodeVersion: string;
    packages: Record<string, string>;
    devPackages: Record<string, string>;
  };
  vue: {
    packages: Record<string, string>;
    devPackages: Record<string, string>;
    vuetify: Record<string, string>;
    primevue: Record<string, string>;
  };
  react: {
    packages: Record<string, string>;
    devPackages: Record<string, string>;
    mui: Record<string, string>;
    primereact: Record<string, string>;
  };
  docker: Record<string, string>;
}

interface Change {
  file: string;
  package: string;
  from: string;
  to: string;
}

// ─── CLI Args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const stackIdx = args.indexOf("--stack");
const stackFilter = stackIdx !== -1 ? args[stackIdx + 1] : null;

const validStacks = ["dotnet", "spring", "nestjs", "vue", "react", "docker"];
if (stackFilter && !validStacks.includes(stackFilter)) {
  console.error(
    `Invalid stack: ${stackFilter}. Valid: ${validStacks.join(", ")}`
  );
  process.exit(1);
}

// ─── Load Manifest ───────────────────────────────────────────────────────────

const manifestPath = resolve(ROOT, "scripts/versions/manifest.json");
const manifest: Manifest = JSON.parse(readFile(manifestPath));

// ─── Tracking ─────────────────────────────────────────────────────────────────

const allChanges: Change[] = [];
const filesUpdated = new Set<string>();

function writeIfChanged(
  filePath: string,
  original: string,
  updated: string
): void {
  if (original === updated) return;
  if (!dryRun) {
    writeFileSync(filePath, updated, "utf-8");
  }
  filesUpdated.add(rel(filePath));
}

// ─── .NET Syncer ─────────────────────────────────────────────────────────────

function syncDotnet(): void {
  const variantDirs = [
    "backend/dotnet/clean-architecture/full",
    "backend/dotnet/clean-architecture/minimal",
    "backend/dotnet/feature-architecture/full",
    "backend/dotnet/feature-architecture/minimal",
    "backend/dotnet/nlayer-architecture/full",
    "backend/dotnet/nlayer-architecture/minimal",
  ];

  for (const variantDir of variantDirs) {
    const absDir = resolve(ROOT, variantDir);
    if (!existsSync(absDir)) continue;

    const csprojFiles = findFiles(`${variantDir}/**/*.csproj`, ROOT);

    for (const csproj of csprojFiles) {
      let content = readFile(csproj);
      const original = content;
      const relPath = rel(csproj);

      // Sync TargetFramework
      content = content.replace(
        /<TargetFramework>([^<]+)<\/TargetFramework>/g,
        (_match, current) => {
          if (current !== manifest.dotnet.framework) {
            allChanges.push({
              file: relPath,
              package: "TargetFramework",
              from: current,
              to: manifest.dotnet.framework,
            });
          }
          return `<TargetFramework>${manifest.dotnet.framework}</TargetFramework>`;
        }
      );

      // Sync PackageReference versions
      content = content.replace(
        /<PackageReference\s+Include="([^"]+)"\s+Version="([^"]+)"/g,
        (_match, name, version) => {
          const expected = manifest.dotnet.packages[name];
          if (expected && version !== expected) {
            allChanges.push({
              file: relPath,
              package: name,
              from: version,
              to: expected,
            });
            return `<PackageReference Include="${name}" Version="${expected}"`;
          }
          return _match;
        }
      );

      writeIfChanged(csproj, original, content);
    }
  }
}

// ─── Spring Syncer ───────────────────────────────────────────────────────────

const SPRING_ARTIFACT_MAP: Record<string, string[]> = {
  jjwt: [
    "io.jsonwebtoken:jjwt-api",
    "io.jsonwebtoken:jjwt-impl",
    "io.jsonwebtoken:jjwt-jackson",
  ],
  mapstruct: ["org.mapstruct:mapstruct", "org.mapstruct:mapstruct-processor"],
  lombok: ["org.projectlombok:lombok"],
  "lombok-mapstruct-binding": ["org.projectlombok:lombok-mapstruct-binding"],
  "springdoc-openapi": ["org.springdoc:springdoc-openapi-starter-webmvc-ui"],
  bucket4j: ["com.bucket4j:bucket4j-core"],
  "logstash-logback-encoder": [
    "net.logstash.logback:logstash-logback-encoder",
  ],
  "poi-ooxml": ["org.apache.poi:poi-ooxml"],
  opencsv: ["com.opencsv:opencsv"],
  "itext7-core": ["com.itextpdf:itext7-core"],
  "commons-csv": ["org.apache.commons:commons-csv"],
};

function buildSpringLookup(): Map<
  string,
  { key: string; version: string }
> {
  const lookup = new Map<string, { key: string; version: string }>();
  for (const [key, artifacts] of Object.entries(SPRING_ARTIFACT_MAP)) {
    const version = manifest.spring.packages[key];
    if (!version) continue;
    for (const artifact of artifacts) {
      lookup.set(artifact, { key, version });
    }
  }
  return lookup;
}

function syncSpring(): void {
  const springLookup = buildSpringLookup();

  const variantDirs = [
    "backend/spring/clean-architecture/full",
    "backend/spring/clean-architecture/minimal",
    "backend/spring/feature-architecture/full",
    "backend/spring/feature-architecture/minimal",
    "backend/spring/nlayer-architecture/full",
    "backend/spring/nlayer-architecture/minimal",
  ];

  for (const variantDir of variantDirs) {
    const absDir = resolve(ROOT, variantDir);
    if (!existsSync(absDir)) continue;

    const pomFiles = findFiles(`${variantDir}/**/pom.xml`, ROOT);

    // Collect properties from all pom.xml
    const properties: Record<string, string> = {};
    for (const pom of pomFiles) {
      const content = readFile(pom);
      const propsMatch = content.match(
        /<properties>([\s\S]*?)<\/properties>/
      );
      if (propsMatch) {
        const propRegex = /<([a-zA-Z0-9._-]+)>([^<]+)<\/\1>/g;
        let m: RegExpExecArray | null;
        while ((m = propRegex.exec(propsMatch[1])) !== null) {
          properties[m[1]] = m[2];
        }
      }
    }

    for (const pom of pomFiles) {
      let content = readFile(pom);
      const original = content;
      const relPath = rel(pom);

      // Sync spring-boot-starter-parent version
      content = content.replace(
        /(<parent>\s*<groupId>org\.springframework\.boot<\/groupId>\s*<artifactId>spring-boot-starter-parent<\/artifactId>\s*<version>)([^<]+)(<\/version>)/s,
        (_match, before, version, after) => {
          if (version !== manifest.spring.springBootVersion) {
            allChanges.push({
              file: relPath,
              package: "spring-boot-starter-parent",
              from: version,
              to: manifest.spring.springBootVersion,
            });
          }
          return `${before}${manifest.spring.springBootVersion}${after}`;
        }
      );

      // Sync java.version property
      content = content.replace(
        /(<java\.version>)([^<]+)(<\/java\.version>)/g,
        (_match, before, version, after) => {
          if (version !== manifest.spring.javaVersion) {
            allChanges.push({
              file: relPath,
              package: "java.version",
              from: version,
              to: manifest.spring.javaVersion,
            });
          }
          return `${before}${manifest.spring.javaVersion}${after}`;
        }
      );

      // Sync maven-compiler-plugin version (direct version, not property ref)
      const compilerExpected =
        manifest.spring.plugins["maven-compiler-plugin"];
      if (compilerExpected) {
        content = content.replace(
          /(<artifactId>maven-compiler-plugin<\/artifactId>\s*<version>)([^<]+)(<\/version>)/s,
          (_match, before, version, after) => {
            // Skip property references — those are resolved via property sync
            if (version.startsWith("${")) return _match;
            if (version !== compilerExpected) {
              allChanges.push({
                file: relPath,
                package: "maven-compiler-plugin",
                from: version,
                to: compilerExpected,
              });
            }
            return `${before}${compilerExpected}${after}`;
          }
        );
      }

      // Sync dependency versions
      // Match <dependency> blocks with explicit <version> tags
      content = content.replace(
        /<dependency>\s*<groupId>([^<]+)<\/groupId>\s*<artifactId>([^<]+)<\/artifactId>\s*<version>([^<]+)<\/version>/gs,
        (fullMatch, groupId, artifactId, rawVersion) => {
          // Skip property references
          if (rawVersion.startsWith("${")) return fullMatch;

          const coord = `${groupId}:${artifactId}`;
          const info = springLookup.get(coord);
          if (!info) return fullMatch;

          if (rawVersion !== info.version) {
            allChanges.push({
              file: relPath,
              package: `${info.key} (${artifactId})`,
              from: rawVersion,
              to: info.version,
            });
            return fullMatch.replace(
              `<version>${rawVersion}</version>`,
              `<version>${info.version}</version>`
            );
          }
          return fullMatch;
        }
      );

      // Sync annotationProcessorPaths (lombok, mapstruct, etc.)
      content = content.replace(
        /<path>\s*<groupId>([^<]+)<\/groupId>\s*<artifactId>([^<]+)<\/artifactId>\s*<version>([^<]+)<\/version>/gs,
        (fullMatch, groupId, artifactId, rawVersion) => {
          if (rawVersion.startsWith("${")) return fullMatch;

          const coord = `${groupId}:${artifactId}`;
          const info = springLookup.get(coord);
          if (!info) return fullMatch;

          if (rawVersion !== info.version) {
            allChanges.push({
              file: relPath,
              package: `${info.key} (${artifactId})`,
              from: rawVersion,
              to: info.version,
            });
            return fullMatch.replace(
              `<version>${rawVersion}</version>`,
              `<version>${info.version}</version>`
            );
          }
          return fullMatch;
        }
      );

      writeIfChanged(pom, original, content);
    }
  }
}

// ─── Node (NestJS / Frontend) Syncer ──────────────────────────────────────────

function syncNodePackageJson(
  pkgPath: string,
  expectedDeps: Record<string, string>,
  expectedDevDeps: Record<string, string>
): void {
  const relPath = rel(pkgPath);
  const pkg = JSON.parse(readFile(pkgPath));
  let changed = false;

  const deps = pkg.dependencies ?? {};
  const devDeps = pkg.devDependencies ?? {};

  // Sync dependencies
  for (const [name, expected] of Object.entries(expectedDeps)) {
    if (deps[name] !== undefined && deps[name] !== expected) {
      allChanges.push({
        file: relPath,
        package: name,
        from: deps[name],
        to: expected,
      });
      deps[name] = expected;
      changed = true;
    }
  }

  // Sync devDependencies
  for (const [name, expected] of Object.entries(expectedDevDeps)) {
    if (devDeps[name] !== undefined && devDeps[name] !== expected) {
      allChanges.push({
        file: relPath,
        package: name + " (dev)",
        from: devDeps[name],
        to: expected,
      });
      devDeps[name] = expected;
      changed = true;
    }
  }

  if (changed) {
    filesUpdated.add(relPath);
    if (!dryRun) {
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
    }
  }
}

function syncNestjs(): void {
  const variantDirs = [
    "backend/nestjs/clean-architecture/full",
    "backend/nestjs/clean-architecture/minimal",
    "backend/nestjs/feature-architecture/full",
    "backend/nestjs/feature-architecture/minimal",
    "backend/nestjs/nlayer-architecture/full",
    "backend/nestjs/nlayer-architecture/minimal",
  ];

  for (const variantDir of variantDirs) {
    const pkgPath = resolve(ROOT, variantDir, "package.json");
    if (!existsSync(pkgPath)) continue;

    syncNodePackageJson(
      pkgPath,
      manifest.nestjs.packages,
      manifest.nestjs.devPackages
    );
  }
}

function syncFrontend(): void {
  const variants: Array<{
    dir: string;
    deps: Record<string, string>;
    devDeps: Record<string, string>;
  }> = [
    // Vue / Vuetify
    ...["full", "minimal"].map((v) => ({
      dir: `frontend/vue/vuetify/${v}`,
      deps: { ...manifest.vue.packages, ...manifest.vue.vuetify },
      devDeps: { ...manifest.vue.devPackages },
    })),
    // Vue / PrimeVue
    ...["full", "minimal"].map((v) => ({
      dir: `frontend/vue/primevue/${v}`,
      deps: { ...manifest.vue.packages, ...manifest.vue.primevue },
      devDeps: { ...manifest.vue.devPackages },
    })),
    // React / MUI
    ...["full", "minimal"].map((v) => ({
      dir: `frontend/react/mui/${v}`,
      deps: { ...manifest.react.packages, ...manifest.react.mui },
      devDeps: { ...manifest.react.devPackages },
    })),
    // React / PrimeReact
    ...["full", "minimal"].map((v) => ({
      dir: `frontend/react/primereact/${v}`,
      deps: { ...manifest.react.packages, ...manifest.react.primereact },
      devDeps: { ...manifest.react.devPackages },
    })),
  ];

  for (const { dir, deps, devDeps } of variants) {
    const pkgPath = resolve(ROOT, dir, "package.json");
    if (!existsSync(pkgPath)) continue;

    syncNodePackageJson(pkgPath, deps, devDeps);
  }
}

// ─── Docker Syncer ───────────────────────────────────────────────────────────

const DOCKER_IMAGE_MAP: Record<string, string> = {
  "mcr.microsoft.com/dotnet/sdk": "dotnetSdk",
  "mcr.microsoft.com/dotnet/aspnet": "dotnetRuntime",
  "eclipse-temurin": "temurinJdk",
  node: "node",
  postgres: "postgres",
  nginx: "nginx",
};

function syncDocker(): void {
  // Sync Dockerfiles
  const dockerfiles = [
    "shared/templates/dotnet/Dockerfile",
    "shared/templates/spring/Dockerfile",
    "shared/templates/nestjs/Dockerfile",
  ];

  for (const df of dockerfiles) {
    const absPath = resolve(ROOT, df);
    if (!existsSync(absPath)) continue;

    let content = readFile(absPath);
    const original = content;

    // Replace FROM image:tag lines
    content = content.replace(
      /^(FROM\s+)(\S+?):(\S+)(\s)/gm,
      (_match, prefix, image, tag, suffix) => {
        let manifestKey: string | undefined;

        if (image === "eclipse-temurin") {
          if (tag.includes("jdk")) manifestKey = "temurinJdk";
          else if (tag.includes("jre")) manifestKey = "temurinJre";
        } else if (image === "node") {
          if (tag.includes("slim")) manifestKey = "nodeSlim";
          else manifestKey = "node";
        } else {
          manifestKey = DOCKER_IMAGE_MAP[image];
        }

        if (!manifestKey) return _match;

        const expected = manifest.docker[manifestKey];
        if (!expected || tag === expected) return _match;

        allChanges.push({
          file: df,
          package: `${image} (${manifestKey})`,
          from: tag,
          to: expected,
        });
        return `${prefix}${image}:${expected}${suffix}`;
      }
    );

    writeIfChanged(absPath, original, content);
  }

  // Sync docker-compose files (postgres image)
  const composeFiles = findComposeFiles();

  for (const compose of composeFiles) {
    let content = readFile(compose);
    const original = content;
    const relPath = rel(compose);

    content = content.replace(
      /(image:\s*postgres:)(\S+)/g,
      (_match, prefix, tag) => {
        if (tag !== manifest.docker.postgres) {
          allChanges.push({
            file: relPath,
            package: "postgres",
            from: tag,
            to: manifest.docker.postgres,
          });
        }
        return `${prefix}${manifest.docker.postgres}`;
      }
    );

    writeIfChanged(compose, original, content);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main(): void {
  console.log("Version Sync Automation");
  console.log("=======================\n");
  console.log(`Manifest: ${rel(manifestPath)}`);
  if (dryRun) console.log("Mode: DRY RUN (no files will be modified)");
  if (stackFilter) console.log(`Stack filter: ${stackFilter}`);
  console.log();

  const sections: Array<{
    label: string;
    stacks: string[];
    fn: () => void;
  }> = [
    { label: ".NET", stacks: ["dotnet"], fn: syncDotnet },
    { label: "Spring", stacks: ["spring"], fn: syncSpring },
    { label: "NestJS", stacks: ["nestjs"], fn: syncNestjs },
    { label: "Frontend (Vue)", stacks: ["vue"], fn: syncFrontend },
    { label: "Frontend (React)", stacks: ["react"], fn: syncFrontend },
    { label: "Docker", stacks: ["docker"], fn: syncDocker },
  ];

  // Deduplicate: frontend syncer handles both vue and react in one call
  const executedFns = new Set<() => void>();

  for (const { label, stacks, fn } of sections) {
    if (stackFilter && !stacks.includes(stackFilter)) continue;
    if (executedFns.has(fn)) continue;
    executedFns.add(fn);

    const beforeCount = allChanges.length;
    console.log(`── ${label} ${"─".repeat(60 - label.length)}`);
    fn();
    const sectionChanges = allChanges.slice(beforeCount);

    if (sectionChanges.length === 0) {
      console.log("  No changes needed — all versions match.\n");
    } else {
      for (const c of sectionChanges) {
        const action = dryRun ? "would update" : "updated";
        console.log(
          `  ${c.file}: ${c.package} ${c.from} → ${c.to} (${action})`
        );
      }
      console.log();
    }
  }

  // Summary
  console.log("══════════════════════════════════════════════════════════════");
  if (allChanges.length === 0) {
    console.log("All versions already match manifest. Nothing to do.");
  } else {
    const verb = dryRun ? "would be" : "were";
    console.log(
      `${filesUpdated.size} file(s) ${verb} updated, ${allChanges.length} package version(s) ${verb} changed.`
    );
    if (dryRun) {
      console.log("\nRe-run without --dry-run to apply changes.");
    } else {
      console.log(
        "\nRun `npm run check-versions` to verify all versions are aligned."
      );
    }
  }
}

main();

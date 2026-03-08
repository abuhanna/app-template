/**
 * Version Sync Checker
 *
 * Validates that ALL template variants use dependency versions
 * matching the centralized manifest (scripts/versions/manifest.json).
 *
 * Checks: .csproj, pom.xml, package.json, Dockerfiles, docker-compose.yml
 *
 * Usage: npx tsx scripts/check-versions.ts
 * Exit code: 0 = all match, 1 = mismatches found
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, relative, basename, dirname } from "path";
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

/** Find files by name under a directory using git ls-files */
function findFiles(dirPattern: string, cwd = ROOT): string[] {
  // Extract the filename/extension filter from the glob pattern
  // e.g. "backend/dotnet/clean-arch/full/**/*.csproj" → dir="backend/dotnet/clean-arch/full", ext=".csproj"
  // e.g. "backend/spring/clean-arch/full/**/pom.xml" → dir="backend/spring/clean-arch/full", name="pom.xml"
  const parts = dirPattern.split("/**/");
  const dir = parts[0];
  const fileFilter = parts.length > 1 ? parts[1] : parts[0];

  try {
    const cmd = `git ls-files --full-name -- "${dir}/"`;
    const result = execSync(cmd, { cwd, encoding: "utf-8" }).trim();
    if (!result) return [];

    const allFiles = result.split("\n");

    // Filter by filename pattern
    if (fileFilter.startsWith("*.")) {
      const ext = fileFilter.slice(1); // e.g. ".csproj"
      return allFiles
        .filter((f) => f.endsWith(ext))
        .map((f) => resolve(cwd, f));
    } else {
      // Exact filename match (e.g. "pom.xml", "package.json")
      return allFiles
        .filter((f) => basename(f) === fileFilter)
        .map((f) => resolve(cwd, f));
    }
  } catch {
    return [];
  }
}

/** Find docker-compose files across shared/templates */
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

interface Mismatch {
  file: string;
  package: string;
  expected: string;
  actual: string;
}

interface VariantResult {
  variant: string;
  totalChecked: number;
  mismatches: Mismatch[];
}

// ─── Load Manifest ───────────────────────────────────────────────────────────

const manifestPath = resolve(ROOT, "scripts/versions/manifest.json");
const manifest: Manifest = JSON.parse(readFile(manifestPath));

// ─── .NET Checker ─────────────────────────────────────────────────────────────

function checkDotnet(): VariantResult[] {
  const results: VariantResult[] = [];
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

    const mismatches: Mismatch[] = [];
    let totalChecked = 0;

    // Find all .csproj files
    const csprojFiles = findFiles(
      `${variantDir}/**/*.csproj`,
      ROOT
    );

    for (const csproj of csprojFiles) {
      const content = readFile(csproj);
      const relPath = rel(csproj);

      // Check TargetFramework
      const fwMatch = content.match(
        /<TargetFramework>([^<]+)<\/TargetFramework>/
      );
      if (fwMatch) {
        totalChecked++;
        if (fwMatch[1] !== manifest.dotnet.framework) {
          mismatches.push({
            file: relPath,
            package: "TargetFramework",
            expected: manifest.dotnet.framework,
            actual: fwMatch[1],
          });
        }
      }

      // Check PackageReference versions
      const pkgRegex =
        /<PackageReference\s+Include="([^"]+)"\s+Version="([^"]+)"/g;
      let match: RegExpExecArray | null;
      while ((match = pkgRegex.exec(content)) !== null) {
        const [, name, version] = match;
        const expected = manifest.dotnet.packages[name];
        if (expected) {
          totalChecked++;
          if (version !== expected) {
            mismatches.push({
              file: relPath,
              package: name,
              expected,
              actual: version,
            });
          }
        }
      }
    }

    results.push({ variant: variantDir, totalChecked, mismatches });
  }

  return results;
}

// ─── Spring Checker ───────────────────────────────────────────────────────────

// Map manifest keys to Maven groupId:artifactId patterns
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

// Reverse map: "groupId:artifactId" → { manifestKey, expectedVersion }
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

function checkSpring(): VariantResult[] {
  const results: VariantResult[] = [];
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

    const mismatches: Mismatch[] = [];
    let totalChecked = 0;

    const pomFiles = findFiles(`${variantDir}/**/pom.xml`, ROOT);

    // Collect properties from all pom.xml (usually only root has them)
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

    // Resolve a version string (may be ${prop.name})
    function resolveVersion(v: string): string {
      const varMatch = v.match(/^\$\{(.+)\}$/);
      if (varMatch) {
        return properties[varMatch[1]] ?? v;
      }
      return v;
    }

    for (const pom of pomFiles) {
      const content = readFile(pom);
      const relPath = rel(pom);

      // Check spring-boot-starter-parent version
      const parentMatch = content.match(
        /<parent>\s*<groupId>org\.springframework\.boot<\/groupId>\s*<artifactId>spring-boot-starter-parent<\/artifactId>\s*<version>([^<]+)<\/version>/s
      );
      if (parentMatch) {
        totalChecked++;
        if (parentMatch[1] !== manifest.spring.springBootVersion) {
          mismatches.push({
            file: relPath,
            package: "spring-boot-starter-parent",
            expected: manifest.spring.springBootVersion,
            actual: parentMatch[1],
          });
        }
      }

      // Check java.version property
      if (properties["java.version"] !== undefined) {
        // Only check once per variant (from root pom)
        const isRootPom =
          pom === pomFiles[0] ||
          basename(dirname(pom)) === basename(resolve(ROOT, variantDir));
        if (isRootPom) {
          totalChecked++;
          if (properties["java.version"] !== manifest.spring.javaVersion) {
            mismatches.push({
              file: relPath,
              package: "java.version",
              expected: manifest.spring.javaVersion,
              actual: properties["java.version"],
            });
          }
        }
      }

      // Check maven-compiler-plugin version
      const compilerMatch = content.match(
        /<artifactId>maven-compiler-plugin<\/artifactId>\s*<version>([^<]+)<\/version>/s
      );
      if (compilerMatch) {
        const actualVersion = resolveVersion(compilerMatch[1]);
        const expected = manifest.spring.plugins["maven-compiler-plugin"];
        if (expected) {
          totalChecked++;
          if (actualVersion !== expected) {
            mismatches.push({
              file: relPath,
              package: "maven-compiler-plugin",
              expected,
              actual: actualVersion,
            });
          }
        }
      }

      // Check dependency versions
      // Parse <dependency> blocks
      const depRegex =
        /<dependency>\s*<groupId>([^<]+)<\/groupId>\s*<artifactId>([^<]+)<\/artifactId>(?:\s*<version>([^<]+)<\/version>)?/gs;
      let depMatch: RegExpExecArray | null;
      while ((depMatch = depRegex.exec(content)) !== null) {
        const [, groupId, artifactId, rawVersion] = depMatch;
        if (!rawVersion) continue; // version inherited from parent/BOM

        const coord = `${groupId}:${artifactId}`;
        const info = springLookup.get(coord);
        if (!info) continue;

        const actualVersion = resolveVersion(rawVersion);
        totalChecked++;
        if (actualVersion !== info.version) {
          mismatches.push({
            file: relPath,
            package: `${info.key} (${artifactId})`,
            expected: info.version,
            actual: actualVersion,
          });
        }
      }

      // Check annotationProcessorPaths (lombok, mapstruct, lombok-mapstruct-binding)
      const annotationRegex =
        /<path>\s*<groupId>([^<]+)<\/groupId>\s*<artifactId>([^<]+)<\/artifactId>\s*<version>([^<]+)<\/version>/gs;
      let annMatch: RegExpExecArray | null;
      while ((annMatch = annotationRegex.exec(content)) !== null) {
        const [, groupId, artifactId, rawVersion] = annMatch;
        const coord = `${groupId}:${artifactId}`;
        const info = springLookup.get(coord);
        if (!info) continue;

        const actualVersion = resolveVersion(rawVersion);
        totalChecked++;
        if (actualVersion !== info.version) {
          mismatches.push({
            file: relPath,
            package: `${info.key} (${artifactId})`,
            expected: info.version,
            actual: actualVersion,
          });
        }
      }
    }

    results.push({ variant: variantDir, totalChecked, mismatches });
  }

  return results;
}

// ─── NestJS Checker ───────────────────────────────────────────────────────────

function checkNodePackageJson(
  pkgPath: string,
  expectedDeps: Record<string, string>,
  expectedDevDeps: Record<string, string>
): { totalChecked: number; mismatches: Mismatch[] } {
  const mismatches: Mismatch[] = [];
  let totalChecked = 0;
  const relPath = rel(pkgPath);

  const pkg = JSON.parse(readFile(pkgPath));
  const deps = pkg.dependencies ?? {};
  const devDeps = pkg.devDependencies ?? {};

  // Check dependencies
  for (const [name, expected] of Object.entries(expectedDeps)) {
    if (deps[name] !== undefined) {
      totalChecked++;
      if (deps[name] !== expected) {
        mismatches.push({
          file: relPath,
          package: name,
          expected,
          actual: deps[name],
        });
      }
    }
  }

  // Check devDependencies
  for (const [name, expected] of Object.entries(expectedDevDeps)) {
    if (devDeps[name] !== undefined) {
      totalChecked++;
      if (devDeps[name] !== expected) {
        mismatches.push({
          file: relPath,
          package: name + " (dev)",
          expected,
          actual: devDeps[name],
        });
      }
    }
  }

  return { totalChecked, mismatches };
}

function checkNestjs(): VariantResult[] {
  const results: VariantResult[] = [];
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

    const { totalChecked, mismatches } = checkNodePackageJson(
      pkgPath,
      manifest.nestjs.packages,
      manifest.nestjs.devPackages
    );

    results.push({ variant: variantDir, totalChecked, mismatches });
  }

  return results;
}

// ─── Frontend Checkers ────────────────────────────────────────────────────────

function checkFrontend(): VariantResult[] {
  const results: VariantResult[] = [];

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

    const { totalChecked, mismatches } = checkNodePackageJson(
      pkgPath,
      deps,
      devDeps
    );

    results.push({ variant: dir, totalChecked, mismatches });
  }

  return results;
}

// ─── Docker Checker ───────────────────────────────────────────────────────────

// Map FROM image references to manifest keys
const DOCKER_IMAGE_MAP: Record<string, string> = {
  "mcr.microsoft.com/dotnet/sdk": "dotnetSdk",
  "mcr.microsoft.com/dotnet/aspnet": "dotnetRuntime",
  "eclipse-temurin": "temurinJdk", // Will check tag suffix for jdk vs jre
  node: "node", // Will check tag suffix for alpine vs slim
  postgres: "postgres",
  nginx: "nginx",
};

function checkDocker(): VariantResult[] {
  const results: VariantResult[] = [];

  // Check Dockerfiles
  const dockerfiles = [
    "shared/templates/dotnet/Dockerfile",
    "shared/templates/spring/Dockerfile",
    "shared/templates/nestjs/Dockerfile",
  ];

  for (const df of dockerfiles) {
    const absPath = resolve(ROOT, df);
    if (!existsSync(absPath)) continue;

    const content = readFile(absPath);
    const mismatches: Mismatch[] = [];
    let totalChecked = 0;

    // Parse FROM lines
    const fromRegex = /^FROM\s+(\S+?)(?::(\S+))?\s/gm;
    let match: RegExpExecArray | null;
    while ((match = fromRegex.exec(content)) !== null) {
      const [, image, tag] = match;
      if (!tag) continue;

      let manifestKey: string | undefined;

      if (image === "eclipse-temurin") {
        // Distinguish jdk vs jre by tag
        if (tag.includes("jdk")) manifestKey = "temurinJdk";
        else if (tag.includes("jre")) manifestKey = "temurinJre";
      } else if (image === "node") {
        if (tag.includes("slim")) manifestKey = "nodeSlim";
        else manifestKey = "node";
      } else {
        manifestKey = DOCKER_IMAGE_MAP[image];
      }

      if (!manifestKey) continue;

      const expected = manifest.docker[manifestKey];
      if (!expected) continue;

      totalChecked++;
      if (tag !== expected) {
        mismatches.push({
          file: df,
          package: `${image} (${manifestKey})`,
          expected,
          actual: tag,
        });
      }
    }

    results.push({ variant: df, totalChecked, mismatches });
  }

  // Check docker-compose files for postgres image
  const composeFiles = findComposeFiles();

  for (const compose of composeFiles) {
    const content = readFile(compose);
    const relPath = rel(compose);

    const mismatches: Mismatch[] = [];
    let totalChecked = 0;

    // Match image: postgres:TAG
    const imgRegex = /image:\s*postgres:(\S+)/g;
    let imgMatch: RegExpExecArray | null;
    while ((imgMatch = imgRegex.exec(content)) !== null) {
      totalChecked++;
      if (imgMatch[1] !== manifest.docker.postgres) {
        mismatches.push({
          file: relPath,
          package: "postgres",
          expected: manifest.docker.postgres,
          actual: imgMatch[1],
        });
      }
    }

    if (totalChecked > 0) {
      results.push({ variant: relPath, totalChecked, mismatches });
    }
  }

  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main(): void {
  console.log("Version Sync Checker");
  console.log("====================\n");
  console.log(`Manifest: ${rel(manifestPath)}\n`);

  const allResults: VariantResult[] = [];

  // Run all checkers
  const sections: Array<{ label: string; fn: () => VariantResult[] }> = [
    { label: ".NET", fn: checkDotnet },
    { label: "Spring", fn: checkSpring },
    { label: "NestJS", fn: checkNestjs },
    { label: "Frontend", fn: checkFrontend },
    { label: "Docker", fn: checkDocker },
  ];

  for (const { label, fn } of sections) {
    console.log(`── ${label} ${"─".repeat(60 - label.length)}`);
    const results = fn();
    for (const r of results) {
      if (r.mismatches.length === 0) {
        console.log(
          `  ✅ ${r.variant} — all ${r.totalChecked} packages match`
        );
      } else {
        console.log(
          `  ❌ ${r.variant} — ${r.mismatches.length} mismatch(es):`
        );
        for (const m of r.mismatches) {
          const fileNote =
            m.file !== r.variant ? ` [${basename(m.file)}]` : "";
          console.log(
            `     ${m.package}: expected ${m.expected}, found ${m.actual}${fileNote}`
          );
        }
      }
      allResults.push(r);
    }
    console.log();
  }

  // Summary
  const totalVariants = allResults.length;
  const failedVariants = allResults.filter(
    (r) => r.mismatches.length > 0
  );
  const totalMismatches = failedVariants.reduce(
    (sum, r) => sum + r.mismatches.length,
    0
  );
  const totalChecked = allResults.reduce(
    (sum, r) => sum + r.totalChecked,
    0
  );

  console.log("══════════════════════════════════════════════════════════════");
  if (totalMismatches === 0) {
    console.log(
      `✅ All ${totalChecked} version checks passed across ${totalVariants} targets.`
    );
    process.exit(0);
  } else {
    console.log(
      `❌ ${totalMismatches} mismatch(es) in ${failedVariants.length}/${totalVariants} targets (${totalChecked} total checks).`
    );
    process.exit(1);
  }
}

main();

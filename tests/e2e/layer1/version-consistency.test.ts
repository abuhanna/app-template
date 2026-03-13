import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllBackendCombos, getAllFrontendCombos } from '../config/matrix.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

// ---------- Helpers ----------

function readJsonFile(filePath: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function readXmlVersion(pomPath: string, artifactId: string): string | null {
  try {
    const content = fs.readFileSync(pomPath, 'utf-8');
    // Simple regex for <artifactId>...</artifactId> followed by <version>...</version>
    const regex = new RegExp(
      `<artifactId>${artifactId}</artifactId>\\s*<version>([^<]+)</version>`,
    );
    const match = content.match(regex);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

// ---------- NestJS version consistency ----------

describe('NestJS version consistency', () => {
  const nestCombos = getAllBackendCombos().filter((c) => c.stack === 'nestjs');

  // Group by variant to check arch consistency within a variant
  for (const variant of ['full', 'minimal'] as const) {
    const combos = nestCombos.filter((c) => c.variant === variant);
    if (combos.length <= 1) continue;

    describe(`variant: ${variant}`, () => {
      it('all architectures use the same core dependency versions', () => {
        const versions: Map<string, Record<string, string>> = new Map();

        for (const { arch } of combos) {
          const pkgPath = path.join(
            REPO_ROOT,
            'backend',
            'nestjs',
            `${arch}-architecture`,
            variant,
            'package.json',
          );
          const pkg = readJsonFile(pkgPath);
          if (!pkg) continue;

          const deps = {
            ...(pkg.dependencies as Record<string, string>),
            ...(pkg.devDependencies as Record<string, string>),
          };

          versions.set(arch, deps);
        }

        // Compare all arches against the first (clean is baseline)
        const baseline = versions.get('clean');
        if (!baseline) return;

        for (const [arch, deps] of versions) {
          if (arch === 'clean') continue;

          for (const [pkg, ver] of Object.entries(baseline)) {
            if (deps[pkg] && deps[pkg] !== ver) {
              expect.fail(
                `nestjs/${arch}/${variant}: ${pkg} is ${deps[pkg]}, ` +
                  `but clean has ${ver}`,
              );
            }
          }
        }
      });
    });
  }
});

// ---------- Dotnet version consistency ----------

describe('Dotnet version consistency', () => {
  const dotnetCombos = getAllBackendCombos().filter((c) => c.stack === 'dotnet');

  for (const variant of ['full', 'minimal'] as const) {
    const combos = dotnetCombos.filter((c) => c.variant === variant);
    if (combos.length <= 1) continue;

    describe(`variant: ${variant}`, () => {
      it('all architectures target the same .NET framework version', () => {
        const tfms: Map<string, string[]> = new Map();

        for (const { arch } of combos) {
          const baseDir = path.join(
            REPO_ROOT,
            'backend',
            'dotnet',
            `${arch}-architecture`,
            variant,
          );

          // Find all .csproj files and extract TargetFramework
          const csprojFiles = findFiles(baseDir, '.csproj');
          const frameworks: string[] = [];

          for (const csproj of csprojFiles) {
            const content = fs.readFileSync(csproj, 'utf-8');
            const match = content.match(/<TargetFramework>([^<]+)<\/TargetFramework>/);
            if (match) frameworks.push(match[1]);
          }

          tfms.set(arch, [...new Set(frameworks)]);
        }

        const baseline = tfms.get('clean');
        if (!baseline) return;

        for (const [arch, frameworks] of tfms) {
          if (arch === 'clean') continue;
          expect(
            frameworks.sort(),
            `dotnet/${arch}/${variant} has different TFMs`,
          ).toEqual(baseline.sort());
        }
      });
    });
  }
});

// ---------- Frontend version consistency ----------

describe('Frontend version consistency', () => {
  const frontendCombos = getAllFrontendCombos();

  // Group by framework+ui to check variant consistency
  const grouped = new Map<string, typeof frontendCombos>();
  for (const combo of frontendCombos) {
    const key = `${combo.framework}-${combo.ui}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(combo);
  }

  for (const [key, combos] of grouped) {
    if (combos.length <= 1) continue;

    describe(key, () => {
      it('full and minimal use same core dependency versions', () => {
        const versions: Map<string, Record<string, string>> = new Map();

        for (const { framework, ui, variant } of combos) {
          const pkgPath = path.join(
            REPO_ROOT,
            'frontend',
            framework,
            ui,
            variant,
            'package.json',
          );
          const pkg = readJsonFile(pkgPath);
          if (!pkg) continue;

          const deps = {
            ...(pkg.dependencies as Record<string, string>),
            ...(pkg.devDependencies as Record<string, string>),
          };

          versions.set(variant, deps);
        }

        const full = versions.get('full');
        const minimal = versions.get('minimal');
        if (!full || !minimal) return;

        // Check shared dependencies have the same versions
        for (const [pkg, ver] of Object.entries(full)) {
          if (minimal[pkg] && minimal[pkg] !== ver) {
            expect.fail(
              `${key}: ${pkg} is ${minimal[pkg]} in minimal, ` +
                `but ${ver} in full`,
            );
          }
        }
      });
    });
  }
});

// ---------- Utility ----------

function findFiles(dir: string, ext: string): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'target' && entry.name !== 'bin' && entry.name !== 'obj') {
      results.push(...findFiles(fullPath, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }

  return results;
}

// ---------- Version Manifest ----------

const manifestPath = path.join(REPO_ROOT, 'scripts', 'versions', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// ---------- Manifest: Dotnet package versions ----------

describe('Manifest: Dotnet package versions', () => {
  const dotnetCombos = getAllBackendCombos().filter((c) => c.stack === 'dotnet');

  it('all .csproj files use manifest-aligned package versions', () => {
    const manifestPkgs = manifest.dotnet.packages as Record<string, string>;
    const mismatches: string[] = [];

    for (const { arch, variant } of dotnetCombos) {
      const baseDir = path.join(
        REPO_ROOT, 'backend', 'dotnet', `${arch}-architecture`, variant,
      );
      const csprojFiles = findFiles(baseDir, '.csproj');

      for (const csproj of csprojFiles) {
        const content = fs.readFileSync(csproj, 'utf-8');
        const refs = content.matchAll(/<PackageReference\s+Include="([^"]+)"\s+Version="([^"]+)"/g);

        for (const [, pkg, ver] of refs) {
          if (manifestPkgs[pkg] && manifestPkgs[pkg] !== ver) {
            const relPath = path.relative(REPO_ROOT, csproj);
            mismatches.push(`${relPath}: ${pkg} is ${ver}, manifest says ${manifestPkgs[pkg]}`);
          }
        }
      }
    }

    if (mismatches.length > 0) {
      expect.fail(`Package version mismatches:\n  ${mismatches.join('\n  ')}`);
    }
  });

  it('all .csproj files target the correct framework', () => {
    const expectedTfm = manifest.dotnet.framework as string;
    const mismatches: string[] = [];

    for (const { arch, variant } of dotnetCombos) {
      const baseDir = path.join(
        REPO_ROOT, 'backend', 'dotnet', `${arch}-architecture`, variant,
      );
      const csprojFiles = findFiles(baseDir, '.csproj');

      for (const csproj of csprojFiles) {
        const content = fs.readFileSync(csproj, 'utf-8');
        const match = content.match(/<TargetFramework>([^<]+)<\/TargetFramework>/);
        if (match && match[1] !== expectedTfm) {
          const relPath = path.relative(REPO_ROOT, csproj);
          mismatches.push(`${relPath}: ${match[1]} (expected ${expectedTfm})`);
        }
      }
    }

    if (mismatches.length > 0) {
      expect.fail(`Target framework mismatches:\n  ${mismatches.join('\n  ')}`);
    }
  });
});

// ---------- Manifest: Spring versions ----------

describe('Manifest: Spring versions', () => {
  const springCombos = getAllBackendCombos().filter((c) => c.stack === 'spring');

  it('Spring Boot parent version matches manifest', () => {
    const expected = manifest.spring.springBootVersion as string;
    const mismatches: string[] = [];

    for (const { arch, variant } of springCombos) {
      const pomPath = path.join(
        REPO_ROOT, 'backend', 'spring', `${arch}-architecture`, variant, 'pom.xml',
      );
      const content = fs.readFileSync(pomPath, 'utf-8');
      // Extract version from <parent>...<artifactId>spring-boot-starter-parent</artifactId>...<version>
      const parentMatch = content.match(
        /<parent>[\s\S]*?<artifactId>spring-boot-starter-parent<\/artifactId>\s*<version>([^<]+)<\/version>/,
      );

      if (parentMatch && parentMatch[1] !== expected) {
        mismatches.push(`spring/${arch}/${variant}: ${parentMatch[1]} (expected ${expected})`);
      }
    }

    if (mismatches.length > 0) {
      expect.fail(`Spring Boot version mismatches:\n  ${mismatches.join('\n  ')}`);
    }
  });

  it('Java version matches manifest', () => {
    const expected = manifest.spring.javaVersion as string;
    const mismatches: string[] = [];

    for (const { arch, variant } of springCombos) {
      const pomPath = path.join(
        REPO_ROOT, 'backend', 'spring', `${arch}-architecture`, variant, 'pom.xml',
      );
      const content = fs.readFileSync(pomPath, 'utf-8');
      const javaMatch = content.match(/<java\.version>([^<]+)<\/java\.version>/);

      if (javaMatch && javaMatch[1] !== expected) {
        mismatches.push(`spring/${arch}/${variant}: ${javaMatch[1]} (expected ${expected})`);
      }
    }

    if (mismatches.length > 0) {
      expect.fail(`Java version mismatches:\n  ${mismatches.join('\n  ')}`);
    }
  });

  it('key dependency versions match manifest in properties or inline', () => {
    const manifestPkgs = manifest.spring.packages as Record<string, string>;
    const mismatches: string[] = [];

    // Map manifest keys to pom.xml property names (clean-arch uses <properties>)
    const propertyMap: Record<string, string> = {
      jjwt: 'jjwt.version',
      mapstruct: 'mapstruct.version',
      'springdoc-openapi': 'springdoc.version',
      bucket4j: 'bucket4j.version',
      lombok: 'lombok.version',
    };

    for (const { arch, variant } of springCombos) {
      const pomDir = path.join(
        REPO_ROOT, 'backend', 'spring', `${arch}-architecture`, variant,
      );

      // Collect all pom.xml files
      const pomFiles = findFiles(pomDir, '.xml').filter((f) => f.endsWith('pom.xml'));

      for (const pomPath of pomFiles) {
        const content = fs.readFileSync(pomPath, 'utf-8');
        const relPath = path.relative(REPO_ROOT, pomPath);

        // Check <properties> block for version properties
        for (const [manifestKey, expectedVer] of Object.entries(manifestPkgs)) {
          const propName = propertyMap[manifestKey];
          if (propName) {
            const propRegex = new RegExp(`<${propName.replace('.', '\\.')}>([^<]+)</${propName.replace('.', '\\.')}>`);
            const propMatch = content.match(propRegex);
            if (propMatch && propMatch[1] !== expectedVer) {
              mismatches.push(`${relPath}: <${propName}> is ${propMatch[1]}, manifest says ${expectedVer}`);
            }
          }
        }

        // Check inline <version> tags for known artifacts
        const inlineArtifacts: Record<string, string> = {
          'poi-ooxml': manifestPkgs['poi-ooxml'],
          'commons-csv': manifestPkgs['commons-csv'],
          'itext7-core': manifestPkgs['itext7-core'],
        };

        for (const [artifactId, expectedVer] of Object.entries(inlineArtifacts)) {
          if (!expectedVer) continue;
          const version = readXmlVersion(pomPath, artifactId);
          if (version && version !== expectedVer) {
            mismatches.push(`${relPath}: ${artifactId} is ${version}, manifest says ${expectedVer}`);
          }
        }
      }
    }

    if (mismatches.length > 0) {
      expect.fail(`Spring dependency version mismatches:\n  ${mismatches.join('\n  ')}`);
    }
  });
});

// ---------- Manifest: NestJS package.json versions ----------

describe('Manifest: NestJS package.json versions', () => {
  const nestCombos = getAllBackendCombos().filter((c) => c.stack === 'nestjs');

  it('all NestJS package.json dependencies match manifest', () => {
    const manifestDeps = manifest.nestjs.packages as Record<string, string>;
    const manifestDevDeps = manifest.nestjs.devPackages as Record<string, string>;
    const mismatches: string[] = [];

    for (const { arch, variant } of nestCombos) {
      const pkgPath = path.join(
        REPO_ROOT, 'backend', 'nestjs', `${arch}-architecture`, variant, 'package.json',
      );
      const pkg = readJsonFile(pkgPath);
      if (!pkg) continue;

      const deps = pkg.dependencies as Record<string, string> | undefined;
      const devDeps = pkg.devDependencies as Record<string, string> | undefined;
      const label = `nestjs/${arch}/${variant}`;

      // Check deps against manifest (only if present in actual package.json)
      if (deps) {
        for (const [name, expectedVer] of Object.entries(manifestDeps)) {
          if (deps[name] && deps[name] !== expectedVer) {
            mismatches.push(`${label}: ${name} is ${deps[name]}, manifest says ${expectedVer}`);
          }
        }
      }

      if (devDeps) {
        for (const [name, expectedVer] of Object.entries(manifestDevDeps)) {
          if (devDeps[name] && devDeps[name] !== expectedVer) {
            mismatches.push(`${label}: ${name} (dev) is ${devDeps[name]}, manifest says ${expectedVer}`);
          }
        }
      }
    }

    if (mismatches.length > 0) {
      expect.fail(`NestJS version mismatches:\n  ${mismatches.join('\n  ')}`);
    }
  });
});

// ---------- Manifest: Frontend package.json versions ----------

describe('Manifest: Frontend package.json versions', () => {
  const frontendCombos = getAllFrontendCombos();

  it('all frontend package.json dependencies match manifest', () => {
    const mismatches: string[] = [];

    for (const { framework, ui, variant } of frontendCombos) {
      const pkgPath = path.join(
        REPO_ROOT, 'frontend', framework, ui, variant, 'package.json',
      );
      const pkg = readJsonFile(pkgPath);
      if (!pkg) continue;

      const deps = pkg.dependencies as Record<string, string> | undefined;
      const devDeps = pkg.devDependencies as Record<string, string> | undefined;
      const label = `${framework}/${ui}/${variant}`;

      // Framework-level packages
      const frameworkManifest = manifest[framework] as Record<string, unknown>;
      const frameworkPkgs = frameworkManifest.packages as Record<string, string>;
      const frameworkDevPkgs = frameworkManifest.devPackages as Record<string, string>;

      // UI-specific packages
      const uiPkgs = frameworkManifest[ui] as Record<string, string> | undefined;

      // Check framework deps
      if (deps && frameworkPkgs) {
        for (const [name, expectedVer] of Object.entries(frameworkPkgs)) {
          if (deps[name] && deps[name] !== expectedVer) {
            mismatches.push(`${label}: ${name} is ${deps[name]}, manifest says ${expectedVer}`);
          }
        }
      }

      // Check framework devDeps
      if (devDeps && frameworkDevPkgs) {
        for (const [name, expectedVer] of Object.entries(frameworkDevPkgs)) {
          if (devDeps[name] && devDeps[name] !== expectedVer) {
            mismatches.push(`${label}: ${name} (dev) is ${devDeps[name]}, manifest says ${expectedVer}`);
          }
        }
      }

      // Check UI-specific deps (can be in deps or devDeps)
      if (uiPkgs) {
        const allActual = { ...deps, ...devDeps };
        for (const [name, expectedVer] of Object.entries(uiPkgs)) {
          if (allActual[name] && allActual[name] !== expectedVer) {
            mismatches.push(`${label}: ${name} (ui) is ${allActual[name]}, manifest says ${expectedVer}`);
          }
        }
      }
    }

    if (mismatches.length > 0) {
      expect.fail(`Frontend version mismatches:\n  ${mismatches.join('\n  ')}`);
    }
  });
});

// ---------- Manifest: Dockerfile base image tags ----------

describe('Manifest: Dockerfile base image tags', () => {
  const dockerManifest = manifest.docker as Record<string, string>;

  it.each([
    {
      backend: 'dotnet',
      expectedImages: [
        `dotnet/sdk:${dockerManifest.dotnetSdk}`,
        `dotnet/aspnet:${dockerManifest.dotnetRuntime}`,
      ],
    },
    {
      backend: 'spring',
      expectedImages: [
        `eclipse-temurin:${dockerManifest.temurinJdk}`,
        `eclipse-temurin:${dockerManifest.temurinJre}`,
      ],
    },
    {
      backend: 'nestjs',
      expectedImages: [
        `node:${dockerManifest.node}`,
        `node:${dockerManifest.nodeSlim}`,
      ],
    },
  ])('shared/templates/$backend/Dockerfile uses correct base images', ({ backend, expectedImages }) => {
    const dockerfilePath = path.join(REPO_ROOT, 'shared', 'templates', backend, 'Dockerfile');
    const content = fs.readFileSync(dockerfilePath, 'utf-8');

    for (const image of expectedImages) {
      expect(content, `Dockerfile for ${backend} should contain ${image}`).toContain(image);
    }
  });
});

// ---------- Spring cross-architecture version consistency ----------

describe('Spring cross-architecture version consistency', () => {
  const springCombos = getAllBackendCombos().filter((c) => c.stack === 'spring');

  for (const variant of ['full', 'minimal'] as const) {
    const combos = springCombos.filter((c) => c.variant === variant);
    if (combos.length <= 1) continue;

    describe(`variant: ${variant}`, () => {
      it('all architectures use the same Spring Boot version', () => {
        const versions: Map<string, string> = new Map();

        for (const { arch } of combos) {
          const pomPath = path.join(
            REPO_ROOT, 'backend', 'spring', `${arch}-architecture`, variant, 'pom.xml',
          );
          const content = fs.readFileSync(pomPath, 'utf-8');
          const match = content.match(
            /<parent>[\s\S]*?<artifactId>spring-boot-starter-parent<\/artifactId>\s*<version>([^<]+)<\/version>/,
          );
          if (match) versions.set(arch, match[1]);
        }

        const unique = new Set(versions.values());
        expect(
          unique.size,
          `Spring Boot versions differ across archs in ${variant}: ${JSON.stringify(Object.fromEntries(versions))}`,
        ).toBe(1);
      });

      it('all architectures use the same Java version', () => {
        const versions: Map<string, string> = new Map();

        for (const { arch } of combos) {
          const pomPath = path.join(
            REPO_ROOT, 'backend', 'spring', `${arch}-architecture`, variant, 'pom.xml',
          );
          const content = fs.readFileSync(pomPath, 'utf-8');
          const match = content.match(/<java\.version>([^<]+)<\/java\.version>/);
          if (match) versions.set(arch, match[1]);
        }

        const unique = new Set(versions.values());
        expect(
          unique.size,
          `Java versions differ across archs in ${variant}: ${JSON.stringify(Object.fromEntries(versions))}`,
        ).toBe(1);
      });
    });
  }
});

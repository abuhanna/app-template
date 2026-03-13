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
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      results.push(...findFiles(fullPath, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }

  return results;
}

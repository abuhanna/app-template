import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllBackendCombos, getAllFrontendCombos } from '../config/matrix.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

// ---------- Backend templates ----------

describe.each(getAllBackendCombos())(
  'backend/$stack/$arch-architecture/$variant',
  ({ stack, arch, variant }) => {
    const templateDir = path.join(
      REPO_ROOT,
      'backend',
      stack,
      `${arch}-architecture`,
      variant,
    );

    it('directory exists', () => {
      expect(fs.existsSync(templateDir)).toBe(true);
    });

    if (stack === 'dotnet') {
      it('has solution file', () => {
        expect(fs.existsSync(path.join(templateDir, 'App.Template.sln'))).toBe(true);
      });

      if (arch === 'clean') {
        it('has clean-architecture project layout', () => {
          expect(fs.existsSync(path.join(templateDir, 'src', 'Core'))).toBe(true);
          expect(fs.existsSync(path.join(templateDir, 'src', 'Infrastructure'))).toBe(true);
          expect(fs.existsSync(path.join(templateDir, 'src', 'Presentation'))).toBe(true);
        });
      } else {
        it('has single-project layout', () => {
          expect(fs.existsSync(path.join(templateDir, 'src', 'App.Template.Api'))).toBe(true);
        });
      }
    }

    if (stack === 'spring') {
      it('has pom.xml', () => {
        expect(fs.existsSync(path.join(templateDir, 'pom.xml'))).toBe(true);
      });

      it('has Maven wrapper', () => {
        expect(fs.existsSync(path.join(templateDir, 'mvnw'))).toBe(true);
      });

      if (arch === 'clean') {
        it('has multi-module layout with api/pom.xml', () => {
          expect(fs.existsSync(path.join(templateDir, 'api', 'pom.xml'))).toBe(true);
        });
      }
    }

    if (stack === 'nestjs') {
      it('has package.json', () => {
        expect(fs.existsSync(path.join(templateDir, 'package.json'))).toBe(true);
      });

      it('has tsconfig.json', () => {
        expect(fs.existsSync(path.join(templateDir, 'tsconfig.json'))).toBe(true);
      });

      it('has src directory', () => {
        expect(fs.existsSync(path.join(templateDir, 'src'))).toBe(true);
      });
    }
  },
);

// ---------- Frontend templates ----------

describe.each(getAllFrontendCombos())(
  'frontend/$framework/$ui/$variant',
  ({ framework, ui, variant }) => {
    const templateDir = path.join(
      REPO_ROOT,
      'frontend',
      framework,
      ui,
      variant,
    );

    it('directory exists', () => {
      expect(fs.existsSync(templateDir)).toBe(true);
    });

    it('has package.json', () => {
      expect(fs.existsSync(path.join(templateDir, 'package.json'))).toBe(true);
    });

    it('has index.html', () => {
      expect(fs.existsSync(path.join(templateDir, 'index.html'))).toBe(true);
    });

    it('has src directory', () => {
      expect(fs.existsSync(path.join(templateDir, 'src'))).toBe(true);
    });

    it('has vite config', () => {
      const hasMjs = fs.existsSync(path.join(templateDir, 'vite.config.mjs'));
      const hasTs = fs.existsSync(path.join(templateDir, 'vite.config.ts'));
      const hasJs = fs.existsSync(path.join(templateDir, 'vite.config.js'));
      expect(
        hasMjs || hasTs || hasJs,
        `No vite config found in ${framework}/${ui}/${variant}`,
      ).toBe(true);
    });
  },
);

// ---------- Shared templates ----------

describe('Shared templates', () => {
  const sharedCommon = path.join(REPO_ROOT, 'shared', 'common');

  it('shared/common exists with required files', () => {
    expect(fs.existsSync(path.join(sharedCommon, 'CLAUDE.md'))).toBe(true);
    expect(fs.existsSync(path.join(sharedCommon, '.gitignore'))).toBe(true);
    expect(fs.existsSync(path.join(sharedCommon, '.env.example'))).toBe(true);
  });

  describe.each(['dotnet', 'spring', 'nestjs'] as const)(
    'shared/templates/%s',
    (backend) => {
      const templateDir = path.join(REPO_ROOT, 'shared', 'templates', backend);

      it('has Dockerfile', () => {
        expect(fs.existsSync(path.join(templateDir, 'Dockerfile'))).toBe(true);
      });

      it('has docker-compose.yml', () => {
        expect(fs.existsSync(path.join(templateDir, 'docker-compose.yml'))).toBe(true);
      });

      it('has supervisord.conf', () => {
        expect(fs.existsSync(path.join(templateDir, 'supervisord.conf'))).toBe(true);
      });

      it('has fullstack README', () => {
        expect(fs.existsSync(path.join(templateDir, 'README.fullstack.md'))).toBe(true);
      });
    },
  );

  describe('shared/docker', () => {
    it('has nginx config', () => {
      expect(
        fs.existsSync(path.join(REPO_ROOT, 'shared', 'docker', 'nginx', 'nginx.conf')),
      ).toBe(true);
    });

    it('has supervisor base config', () => {
      expect(
        fs.existsSync(
          path.join(REPO_ROOT, 'shared', 'docker', 'supervisor', 'supervisord.conf'),
        ),
      ).toBe(true);
    });
  });
});

// ---------- Backend variant-specific structure ----------

describe('Backend variant-specific structure', () => {
  // Returns paths that should exist ONLY in the full variant (not in minimal)
  function getFullOnlyPaths(
    stack: string,
    arch: string,
  ): string[] {
    if (stack === 'dotnet') {
      if (arch === 'clean') {
        return [
          'src/Presentation/App.Template.WebAPI/Controllers/UsersController.cs',
          'src/Presentation/App.Template.WebAPI/Controllers/DepartmentsController.cs',
        ];
      }
      if (arch === 'feature') {
        return [
          'src/App.Template.Api/Features/Users',
          'src/App.Template.Api/Features/Departments',
        ];
      }
      // nlayer
      return [
        'src/App.Template.Api/Controllers/UsersController.cs',
        'src/App.Template.Api/Controllers/DepartmentsController.cs',
      ];
    }

    if (stack === 'spring') {
      if (arch === 'clean') {
        return [
          'api/src/main/java/apptemplate/api/controllers/UsersController.java',
          'api/src/main/java/apptemplate/api/controllers/DepartmentsController.java',
        ];
      }
      if (arch === 'feature') {
        // users/ exists in both full and minimal; only departments/ is full-only
        return [
          'src/main/java/com/apptemplate/api/features/departments',
        ];
      }
      // nlayer
      return [
        'src/main/java/com/apptemplate/api/controller/UserController.java',
        'src/main/java/com/apptemplate/api/controller/DepartmentController.java',
      ];
    }

    if (stack === 'nestjs') {
      if (arch === 'clean') {
        // user-management exists in both; only department-management is full-only
        return ['src/modules/department-management'];
      }
      if (arch === 'feature') {
        return ['src/features/users', 'src/features/departments'];
      }
      // nlayer
      return [
        'src/controllers/users.controller.ts',
        'src/controllers/departments.controller.ts',
      ];
    }

    return [];
  }

  const combos = getAllBackendCombos();

  for (const { stack, arch } of combos.filter((c) => c.variant === 'full')) {
    const label = `${stack}/${arch}`;
    const fullDir = path.join(REPO_ROOT, 'backend', stack, `${arch}-architecture`, 'full');
    const minimalDir = path.join(REPO_ROOT, 'backend', stack, `${arch}-architecture`, 'minimal');
    const fullOnlyPaths = getFullOnlyPaths(stack, arch);

    if (fullOnlyPaths.length === 0) continue;

    describe(label, () => {
      it('full variant has user/department management', () => {
        for (const p of fullOnlyPaths) {
          expect(
            fs.existsSync(path.join(fullDir, p)),
            `Expected ${p} to exist in ${label}/full`,
          ).toBe(true);
        }
      });

      it('minimal variant has NO user/department management', () => {
        for (const p of fullOnlyPaths) {
          expect(
            fs.existsSync(path.join(minimalDir, p)),
            `Expected ${p} to NOT exist in ${label}/minimal`,
          ).toBe(false);
        }
      });
    });
  }
});

// ---------- Frontend variant-specific structure ----------

describe('Frontend variant-specific structure', () => {
  // Returns page paths that exist ONLY in full variant
  function getFullOnlyPages(framework: string): string[] {
    if (framework === 'vue') {
      return ['dashboard.vue', 'users', 'departments'];
    }
    // react
    return ['Dashboard.tsx', 'Users.tsx', 'Departments.tsx'];
  }

  const combos = getAllFrontendCombos();

  for (const { framework, ui } of combos.filter((c) => c.variant === 'full')) {
    const label = `${framework}/${ui}`;
    const fullPagesDir = path.join(REPO_ROOT, 'frontend', framework, ui, 'full', 'src', 'pages');
    const minimalPagesDir = path.join(REPO_ROOT, 'frontend', framework, ui, 'minimal', 'src', 'pages');
    const fullOnlyPages = getFullOnlyPages(framework);

    describe(label, () => {
      it('full has user and department management pages', () => {
        for (const page of fullOnlyPages) {
          expect(
            fs.existsSync(path.join(fullPagesDir, page)),
            `Expected ${page} in ${label}/full/src/pages`,
          ).toBe(true);
        }
      });

      it('minimal has NO user or department management pages', () => {
        for (const page of fullOnlyPages) {
          expect(
            fs.existsSync(path.join(minimalPagesDir, page)),
            `Expected ${page} to NOT exist in ${label}/minimal/src/pages`,
          ).toBe(false);
        }
      });

      it('has package.json with build script', () => {
        for (const variant of ['full', 'minimal'] as const) {
          const pkgPath = path.join(REPO_ROOT, 'frontend', framework, ui, variant, 'package.json');
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          expect(pkg.scripts?.build, `${label}/${variant} missing build script`).toBeTruthy();
        }
      });

      it('has router setup', () => {
        for (const variant of ['full', 'minimal'] as const) {
          const routerDir = path.join(
            REPO_ROOT, 'frontend', framework, ui, variant, 'src', 'router',
          );
          expect(
            fs.existsSync(routerDir),
            `${label}/${variant} missing src/router/`,
          ).toBe(true);
        }
      });
    });
  }
});

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

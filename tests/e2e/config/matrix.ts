import type {
  ProjectType,
  BackendFramework,
  BackendArchitecture,
  FrontendFramework,
  UILibrary,
  TemplateVariant,
} from '@cli/types.js';

export type Priority = 'critical' | 'high' | 'normal';

export interface MatrixEntry {
  id: string;
  projectType: ProjectType;
  backend?: BackendFramework;
  architecture?: BackendArchitecture;
  frontendFramework?: FrontendFramework;
  ui?: UILibrary;
  variant: TemplateVariant;
  priority: Priority;
  expectedFiles: string[];
  expectedEndpoints?: string[];
}

// ---------- Constants ----------

const BACKENDS: BackendFramework[] = ['dotnet', 'spring', 'nestjs'];
const ARCHITECTURES: BackendArchitecture[] = ['clean', 'feature', 'nlayer'];
const FRONTEND_UI_PAIRS: Array<{ framework: FrontendFramework; ui: UILibrary }> = [
  { framework: 'vue', ui: 'vuetify' },
  { framework: 'vue', ui: 'primevue' },
  { framework: 'react', ui: 'mui' },
  { framework: 'react', ui: 'primereact' },
];
// Only full and minimal exist on disk (zero is defined in types but has no templates)
const VARIANTS: TemplateVariant[] = ['full', 'minimal'];

// ---------- Expected Files Builders ----------

/**
 * Expected files use post-rename names where applicable.
 * For dotnet, the .sln and project dirs get renamed (App.Template → Test.App),
 * so we check for the renamed versions since generate.ts applies rename.
 * For spring, the pom.xml content changes but filename stays.
 * Directory-only checks are used where file names are rename-dependent.
 */
function backendExpectedFiles(
  stack: BackendFramework,
  arch: BackendArchitecture,
): string[] {
  switch (stack) {
    case 'dotnet':
      if (arch === 'clean') {
        return [
          'Test.App.sln',
          'src/Core',
          'src/Infrastructure',
          'src/Presentation',
        ];
      }
      // feature + nlayer both use single-project structure
      return ['Test.App.sln', 'src/Test.App.Api'];

    case 'spring':
      if (arch === 'clean') {
        return ['pom.xml', 'api/pom.xml'];
      }
      return ['pom.xml'];

    case 'nestjs':
      return ['package.json', 'tsconfig.json', 'src'];
  }
}

function frontendExpectedFiles(
  framework: FrontendFramework,
  ui: UILibrary,
): string[] {
  const base = ['package.json', 'index.html', 'src'];
  if (framework === 'vue') {
    return [...base, 'vite.config.mjs'];
  }
  // react uses .ts config
  return [...base, 'vite.config.ts'];
}

function fullstackRootFiles(): string[] {
  return [
    'Dockerfile',
    'docker-compose.yml',
    'CLAUDE.md',
    'README.md',
    '.gitignore',
    'docker/nginx',
    'docker/supervisor',
  ];
}

function prefixFiles(files: string[], prefix: string): string[] {
  return files.map((f) => `${prefix}/${f}`);
}

// ---------- Priority Assignment ----------

/** Critical: one fullstack per backend (clean/full + vue/vuetify), one frontend per framework */
function assignPriority(entry: {
  projectType: ProjectType;
  backend?: BackendFramework;
  architecture?: BackendArchitecture;
  ui?: UILibrary;
  variant: TemplateVariant;
}): Priority {
  if (entry.variant === 'minimal') return 'normal';

  if (entry.projectType === 'fullstack') {
    // Critical: clean-arch + vue/vuetify + full for each backend
    if (
      entry.architecture === 'clean' &&
      entry.ui === 'vuetify' &&
      entry.variant === 'full'
    ) {
      return 'critical';
    }
    return 'high';
  }

  if (entry.projectType === 'backend') {
    // Critical: clean-arch + full for each backend
    if (entry.architecture === 'clean' && entry.variant === 'full') {
      return 'critical';
    }
    return 'high';
  }

  if (entry.projectType === 'frontend') {
    // Critical: one per framework (vuetify for vue, mui for react)
    if (
      entry.variant === 'full' &&
      (entry.ui === 'vuetify' || entry.ui === 'mui')
    ) {
      return 'critical';
    }
    return 'high';
  }

  return 'normal';
}

// ---------- Endpoint Expectations ----------

function backendEndpoints(
  variant: TemplateVariant,
): string[] {
  const base = ['/api/health'];

  if (variant === 'full') {
    return [
      ...base,
      '/api/auth/login',
      '/api/auth/refresh-token',
      '/api/users',
      '/api/departments',
      '/api/notifications',
      '/api/audit-logs',
      '/api/files',
    ];
  }

  // minimal
  return [
    ...base,
    '/api/notifications',
    '/api/audit-logs',
    '/api/files',
  ];
}

// ---------- Matrix Generation ----------

export function generateMatrix(): MatrixEntry[] {
  const entries: MatrixEntry[] = [];

  // Fullstack combinations: 3 backends × 3 archs × 4 frontend-UI × 2 variants = 72
  for (const backend of BACKENDS) {
    for (const arch of ARCHITECTURES) {
      for (const { framework, ui } of FRONTEND_UI_PAIRS) {
        for (const variant of VARIANTS) {
          const entry: MatrixEntry = {
            id: `fullstack-${backend}-${arch}-${framework}-${ui}-${variant}`,
            projectType: 'fullstack',
            backend,
            architecture: arch,
            frontendFramework: framework,
            ui,
            variant,
            priority: 'high', // placeholder
            expectedFiles: [
              ...prefixFiles(backendExpectedFiles(backend, arch), 'backend'),
              ...prefixFiles(frontendExpectedFiles(framework, ui), 'frontend'),
              ...fullstackRootFiles(),
            ],
            expectedEndpoints: backendEndpoints(variant),
          };
          entry.priority = assignPriority(entry);
          entries.push(entry);
        }
      }
    }
  }

  // Backend-only combinations: 3 backends × 3 archs × 2 variants = 18
  for (const backend of BACKENDS) {
    for (const arch of ARCHITECTURES) {
      for (const variant of VARIANTS) {
        const entry: MatrixEntry = {
          id: `backend-${backend}-${arch}-${variant}`,
          projectType: 'backend',
          backend,
          architecture: arch,
          variant,
          priority: 'high',
          expectedFiles: [
            ...prefixFiles(backendExpectedFiles(backend, arch), 'backend'),
            '.gitignore',
            'CLAUDE.md',
            'README.md',
          ],
          expectedEndpoints: backendEndpoints(variant),
        };
        entry.priority = assignPriority(entry);
        entries.push(entry);
      }
    }
  }

  // Frontend-only combinations: 4 framework-UI × 2 variants = 8
  for (const { framework, ui } of FRONTEND_UI_PAIRS) {
    for (const variant of VARIANTS) {
      const entry: MatrixEntry = {
        id: `frontend-${framework}-${ui}-${variant}`,
        projectType: 'frontend',
        frontendFramework: framework,
        ui,
        variant,
        priority: 'high',
        expectedFiles: [
          ...prefixFiles(frontendExpectedFiles(framework, ui), 'frontend'),
          '.gitignore',
          'CLAUDE.md',
          'README.md',
        ],
      };
      entry.priority = assignPriority(entry);
      entries.push(entry);
    }
  }

  return entries;
}

// Cached full matrix
let _matrix: MatrixEntry[] | null = null;

export function getFullMatrix(): MatrixEntry[] {
  if (!_matrix) {
    _matrix = generateMatrix();
  }
  return _matrix;
}

export function getCriticalSubset(): MatrixEntry[] {
  return getFullMatrix().filter((e) => e.priority === 'critical');
}

export function getHighAndAbove(): MatrixEntry[] {
  return getFullMatrix().filter(
    (e) => e.priority === 'critical' || e.priority === 'high',
  );
}

export function getBackendEntries(): MatrixEntry[] {
  return getFullMatrix().filter(
    (e) => e.projectType === 'backend' || e.projectType === 'fullstack',
  );
}

export function getFrontendEntries(): MatrixEntry[] {
  return getFullMatrix().filter(
    (e) => e.projectType === 'frontend' || e.projectType === 'fullstack',
  );
}

/**
 * Get matrix entries filtered by environment variables.
 * Used by Layer 2 tests to split work across CI matrix jobs.
 *
 * E2E_ALL=1               → full matrix; otherwise critical subset
 * BACKEND_FILTER=dotnet   → entries with that backend (backend-only + fullstack)
 * FRONTEND_FILTER=true    → frontend-only entries (no fullstack)
 *
 * When no filter is set, returns the E2E_ALL-determined set as-is.
 */
export function getFilteredEntries(): MatrixEntry[] {
  let entries = process.env.E2E_ALL
    ? getFullMatrix()
    : getCriticalSubset();

  const backendFilter = process.env.BACKEND_FILTER;
  const frontendFilter = process.env.FRONTEND_FILTER;

  if (!backendFilter && !frontendFilter) {
    return entries;
  }

  if (frontendFilter) {
    return entries.filter((e) => e.projectType === 'frontend');
  }

  if (backendFilter) {
    return entries.filter((e) => e.backend === backendFilter);
  }

  return entries;
}

// ---------- Backend/Frontend template path combos (for structure tests) ----------

export interface BackendCombo {
  stack: BackendFramework;
  arch: BackendArchitecture;
  variant: TemplateVariant;
}

export interface FrontendCombo {
  framework: FrontendFramework;
  ui: UILibrary;
  variant: TemplateVariant;
}

export function getAllBackendCombos(): BackendCombo[] {
  const combos: BackendCombo[] = [];
  for (const stack of BACKENDS) {
    for (const arch of ARCHITECTURES) {
      for (const variant of VARIANTS) {
        combos.push({ stack, arch, variant });
      }
    }
  }
  return combos;
}

export function getAllFrontendCombos(): FrontendCombo[] {
  const combos: FrontendCombo[] = [];
  for (const { framework, ui } of FRONTEND_UI_PAIRS) {
    for (const variant of VARIANTS) {
      combos.push({ framework, ui, variant });
    }
  }
  return combos;
}

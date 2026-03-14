# CLI Development Guide

Guide for developing, testing, and publishing the `@abuhannaa/create-apptemplate` CLI tool.

---

## Local Development Setup

```bash
# Clone the repository
git clone https://github.com/abuhanna/app-template.git
cd app-template/create-apptemplate

# Install dependencies
npm install

# Start watch mode (rebuilds on file changes)
npm run dev

# In another terminal, test the CLI
npm run cli                              # Runs via tsx (no build needed)
npm run cli -- my-test-project           # With arguments
npm run cli -- my-app -- --backend dotnet --type fullstack
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch mode — tsup rebuilds on file changes |
| `npm run build` | Production build (ESM bundle + DTS) |
| `npm run typecheck` | TypeScript type checking (tsc --noEmit) |
| `npm test` | Run unit tests (vitest) |
| `npm run cli` | Run CLI directly via tsx (no build step) |

### Testing with `npm link`

```bash
# In create-apptemplate/
npm run build
npm link

# Now test as if installed globally
npm create @abuhannaa/apptemplate my-test-app

# Or with arguments
npm create @abuhannaa/apptemplate my-test-app -- --backend spring --type backend

# Unlink when done
npm unlink -g @abuhannaa/create-apptemplate
```

---

## Source File Map

| File | Purpose |
|------|---------|
| `src/index.ts` | Main entry point, flow orchestration, next steps display |
| `src/cli.ts` | CLI argument parsing (hand-rolled, no yargs/commander) |
| `src/prompts.ts` | Interactive prompts via @clack/prompts |
| `src/generator.ts` | Project generation orchestrator |
| `src/types.ts` | TypeScript type definitions (unions + interfaces) |
| `src/utils/download.ts` | Template download via degit + GitHub raw API |
| `src/utils/rename.ts` | Namespace/project renaming (.NET + Spring) |
| `src/utils/package-manager.ts` | Package manager detection & dependency installation |
| `src/utils/errors.ts` | Degit error formatting with user-friendly messages |

---

## How the Generator Works

The CLI uses a **download-and-mutate** strategy (NOT a template engine):

### Step-by-Step Flow

```
User runs: npm create @abuhannaa/apptemplate@latest
                           │
                    ┌──────▼──────┐
                    │  1. Banner  │  Show intro, parse CLI args
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  2. Mode    │  Interactive (prompts) or Non-Interactive (flags)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  3. mkdir   │  Create project directory
                    └──────┬──────┘
                           │
              ┌────────────▼────────────┐
              │  4. Download Templates  │  degit clones from GitHub
              │                         │
              │  • Backend template     │  backend/{fw}/{arch}-architecture/{variant}
              │  • Frontend template    │  frontend/{fw}/{ui}/{variant}
              │  • Root config files    │  GitHub raw API for .env, .gitignore, etc.
              │  • Docker templates     │  Targeted degit of docker/ subdirectory
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  5. Folder References   │  Replace backend-dotnet → backend,
              │                         │  frontend-vuetify → frontend, etc.
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  6. Namespace Rename    │  App.Template → MyCompany.MyApp
              │                         │  (files, folders, .csproj, pom.xml)
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  7. Install Deps        │  Optional: dotnet restore / mvnw / npm
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  8. Env Setup           │  .env.example → .env
              │                         │  Set VITE_BACKEND_TYPE in frontend
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  9. Docker Cleanup      │  Remove individual Dockerfiles from
              │                         │  backend/ and frontend/ (fullstack only)
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  10. Success Output     │  Summary + context-sensitive next steps
              └─────────────────────────┘
```

### Download Strategy

**Backend & Frontend templates**: Downloaded via degit, which pulls a specific subdirectory from the GitHub repo without cloning the entire repository.

```typescript
// Path formula:
const backendPath = `backend/${backend}/${architecture}-architecture/${variant}`;
const frontendPath = `frontend/${framework}/${ui}/${variant}`;
```

**Root configuration files**: Downloaded individually via GitHub raw API (faster than cloning the entire repo for ~10 files):
- `.env.example`, `.gitignore`, `CLAUDE.md`
- Fullstack: `Makefile`
- Backend-specific: `Dockerfile.{backend}`, `docker-compose.{backend}.yml`, `supervisord.{backend}.conf`, `README.fullstack.{backend}.md`

**Docker infrastructure**: Targeted degit of the `docker/` subdirectory, then selective file copying.

### Namespace Renaming

The CLI replaces the placeholder namespace `App.Template` / `AppTemplate` with the user's chosen project name.

**.NET renaming** (`renameDotNetProject()`):
- File contents: `App.Template` → `MyCompany.MyApp`, `AppTemplate` → `MyCompanyMyApp`
- Folder names: `App.Template.Domain/` → `MyCompany.MyApp.Domain/`
- File names: `App.Template.Api.csproj` → `MyCompany.MyApp.Api.csproj`, `.sln` files
- Targets: `.cs`, `.csproj`, `.sln`, `.json` files

**Spring renaming** (`renameSpringProject()`):
- Derives from `MyCompany.MyApp`:
  - `packageName` = `mycompany.myapp`
  - `artifactId` = `mycompany-myapp`
  - `pkgPath` = `mycompany/myapp`
- Renames Java package directories: `apptemplate/` → `mycompany/myapp/`
- Updates `pom.xml`, `.java`, `.yml`, `.properties` files
- Clean-arch: `apptemplate.*` (no `com.` prefix)
- Feature/N-Layer: `com.apptemplate.*` (with `com.` prefix)

**NestJS**: No renaming needed (uses original naming conventions).

---

## CLI Argument Reference

### Flags

| Flag | Alias | Type | Default | Description |
|------|-------|------|---------|-------------|
| `--type` | `-t` | `fullstack\|backend\|frontend` | `fullstack` | Project type |
| `--backend` | `-b` | `dotnet\|spring\|nestjs` | Required | Backend framework |
| `--architecture` | `-a` | `clean\|nlayer\|feature` | `clean` | Architecture pattern |
| `--framework` | `-f` | `vue\|react` | `vue` | Frontend framework |
| `--ui` | `-u` | `vuetify\|primevue\|mui\|primereact` | `vuetify` | UI library |
| `--name` | `-n` | `Company.Project` | Required* | Project namespace |
| `--variant` | `-V` | `full\|minimal` | `full` | Template variant |
| `--root` | `-r` | boolean | `false` | Place files in project root |
| `--install` | `-i` | boolean | `false` | Auto-install dependencies |
| `--help` | `-h` | boolean | — | Show help |
| `--version` | `-v` | boolean | — | Show version |

*Required for .NET and Spring backends (not NestJS or frontend-only).

### Non-Interactive Mode

Activated when `projectPath` + `backend` + (namespace if dotnet/spring) are all provided via flags.

```bash
# Fully non-interactive:
npm create @abuhannaa/apptemplate my-app -- \
  --type fullstack \
  --backend dotnet \
  --architecture clean \
  --framework vue \
  --ui vuetify \
  --variant full \
  --name MyCompany.MyApp \
  --install
```

### UI Compatibility Validation

| Frontend Framework | Valid UI Libraries |
|--------------------|--------------------|
| vue | vuetify, primevue |
| react | mui, primereact |

Invalid combinations (e.g., `--framework vue --ui mui`) emit a warning and clear the UI value, falling back to the default or prompting interactively.

---

## Interactive Prompt Flow

| # | Prompt | Type | Skip Condition |
|---|--------|------|----------------|
| 1 | Project directory path | text | `--projectPath` provided |
| 2 | Project type | select | `--type` provided |
| 3 | Backend framework | select | Frontend-only or `--backend` |
| 4 | Architecture pattern | select | Frontend-only or `--architecture` |
| 5 | Frontend framework | select | Backend-only or `--framework` |
| 6 | UI library | select | Backend-only or `--ui` |
| 7 | Template variant | select | `--variant` provided |
| 8 | Project namespace | text | Frontend-only, NestJS, or `--name` |
| 9 | Place files in root? | confirm | Fullstack or `--root` |
| 10 | Install dependencies? | confirm | `--install` |
| 11 | Confirm settings | confirm | Never skipped |

---

## How to Add a New Backend

Example: Adding Go support.

### 1. Update Type Definitions

**`src/types.ts`**:
```typescript
export type BackendFramework = 'dotnet' | 'spring' | 'nestjs' | 'go';
```

### 2. Update CLI Validation

**`src/cli.ts`**:
```typescript
const validBackends = ['dotnet', 'spring', 'nestjs', 'go'];
```

### 3. Add Prompt Options

**`src/prompts.ts`**:
- Add to backend select options: `{ value: 'go', label: 'Go (Gin/Echo)' }`
- Add `getBackendLabel()` case

### 4. Add Rename Function (if needed)

**`src/utils/rename.ts`**:
- Add `renameGoProject()` function if namespace renaming is needed
- Or skip if Go doesn't need namespace changes

### 5. Add Install Case

**`src/utils/package-manager.ts`**:
```typescript
case 'go':
  // Run go mod download
  break;
```

### 6. Update Next Steps

**`src/index.ts`** — add Go-specific commands to `showNextSteps()`:
```typescript
case 'go':
  console.log('  go run ./cmd/server');
  break;
```

### 7. Update Folder References

**`src/generator.ts`** — add to `updateFolderReferences()`:
```typescript
content = content.replace(/backend-go/g, 'backend');
```

### 8. Create Template Projects

```
backend/go/
  clean-architecture/{full,minimal}/
  feature-architecture/{full,minimal}/
  nlayer-architecture/{full,minimal}/
```

### 9. Create Docker Templates

```
docker/templates/root/
  Dockerfile.go
  docker-compose.go.yml
  supervisord.go.conf
  README.fullstack.go.md
```

### 10. Update Documentation

- Update `docs/version-alignment.md` with Go dependency versions
- Update `docs/architecture-patterns.md` with Go-specific patterns
- Update `docs/docker-templates.md` with Go Docker details

---

## How to Add a New Frontend Framework

Example: Adding Svelte support.

1. **`src/types.ts`**: Add `'svelte'` to `FrontendFramework` union
2. **`src/cli.ts`**: Add to `validFrontendFrameworks`, update UI compatibility map
3. **`src/prompts.ts`**: Add select option, update UI library selection logic
4. **`src/index.ts`**: Update `showNextSteps()` with Svelte commands
5. **`src/generator.ts`**: Update `updateFolderReferences()` for `frontend-{ui}` patterns
6. Create `frontend/svelte/{ui1,ui2}/{full,minimal}/` template projects

---

## Testing Locally Before Publishing

### 1. Unit Tests

```bash
cd create-apptemplate
npm test
```

### 2. Manual Testing (Interactive Mode)

```bash
# Build and link
npm run build && npm link

# Test each project type
npm create @abuhannaa/apptemplate /tmp/test-fullstack
npm create @abuhannaa/apptemplate /tmp/test-backend
npm create @abuhannaa/apptemplate /tmp/test-frontend

# Verify generated projects build
cd /tmp/test-fullstack/backend && dotnet build
cd /tmp/test-fullstack/frontend && npm install && npm run build
```

### 3. Manual Testing (Non-Interactive Mode)

```bash
# Test each backend
npm create @abuhannaa/apptemplate /tmp/test-dotnet -- --backend dotnet --type backend --name Test.App
npm create @abuhannaa/apptemplate /tmp/test-spring -- --backend spring --type backend --name Test.App
npm create @abuhannaa/apptemplate /tmp/test-nestjs -- --backend nestjs --type backend

# Test each frontend
npm create @abuhannaa/apptemplate /tmp/test-vue-vuetify -- --type frontend --framework vue --ui vuetify
npm create @abuhannaa/apptemplate /tmp/test-react-mui -- --type frontend --framework react --ui mui

# Test variant
npm create @abuhannaa/apptemplate /tmp/test-minimal -- --backend dotnet --variant minimal --name Test.App
```

### 4. Test the Build Artifact

```bash
npm run build
node dist/index.js --version
node dist/index.js --help
node dist/index.js /tmp/test-dist -- --backend dotnet --name Test.App
```

---

## Publishing Checklist

1. **Pre-publish checks**:
   ```bash
   npm run typecheck        # No type errors
   npm test                 # All tests pass
   npm run build            # Clean build
   ```

2. **Version bump**:
   ```bash
   npm version patch        # or minor/major
   ```

3. **Verify package contents**:
   ```bash
   npm pack --dry-run       # Check what will be published
   ```
   Should only include `dist/` directory and `package.json`.

4. **Publish**:
   ```bash
   npm publish --access public
   ```

5. **Verify**:
   ```bash
   npx @abuhannaa/create-apptemplate@latest --version
   ```

---

## Build Configuration

### tsup.config.ts

```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],          // ESM-only output
  target: 'node18',         // Node 18+ required
  outDir: 'dist',
  clean: true,
  dts: true,                // Generate .d.ts files
  sourcemap: true,
  splitting: false,
  shims: true,              // ESM shims (__dirname, etc.)
  banner: { js: '#!/usr/bin/env node' },  // Make executable
});
```

### Key Design Decisions

- **ESM-only**: Uses `import.meta.url` for dynamic version reading
- **No yargs/commander**: CLI args parsed manually for minimal dependencies
- **@clack/prompts**: Chosen for beautiful terminal UX over inquirer
- **degit**: Lightweight alternative to `git clone` — downloads tarball, no `.git` history
- **No template engine**: Files are real working project files, not templates with placeholders

---

## Error Handling Strategy

| Layer | Behavior |
|-------|----------|
| CLI validation | Warns on invalid values, clears them, falls through to interactive prompts |
| Generator failures | Per-step spinners stop with error, project directory cleaned up if we created it |
| Dependency install | Failures are **warnings only** — project is still usable |
| Docker cleanup | Errors are silently ignored |
| Top-level catch | Displays red error message, exits with code 1 |

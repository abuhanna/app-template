#!/usr/bin/env bash
# validate-minimals.sh — Validate all minimal variants against the spec.
# Runs structural checks (grep-based) by default.
# Pass --build to also run build and test commands.
#
# Exit code: 0 if all checks pass, 1 if any fail.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_BUILDS=false
PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0
RESULTS=()

# Parse flags
for arg in "$@"; do
  case "$arg" in
    --build) RUN_BUILDS=true ;;
    *) echo "Unknown flag: $arg"; exit 2 ;;
  esac
done

# ─── Helpers ──────────────────────────────────────────────────────────────────

record() {
  local variant="$1" check="$2" status="$3"
  RESULTS+=("$(printf '%-52s | %-40s | %s' "$variant" "$check" "$status")")
  if [[ "$status" == "PASS" ]]; then
    PASS_COUNT=$((PASS_COUNT + 1))
  elif [[ "$status" == "FAIL" ]]; then
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    SKIP_COUNT=$((SKIP_COUNT + 1))
  fi
}

# Check that a grep pattern is found somewhere under a directory.
assert_grep() {
  local variant="$1" check="$2" dir="$3" pattern="$4"
  if grep -rql --include='*.cs' --include='*.java' --include='*.ts' --include='*.js' \
       --include='*.vue' --include='*.tsx' --include='*.jsx' \
       -E "$pattern" "$dir" >/dev/null 2>&1; then
    record "$variant" "$check" "PASS"
  else
    record "$variant" "$check" "FAIL"
  fi
}

# Check that a grep pattern is NOT found.
assert_no_grep() {
  local variant="$1" check="$2" dir="$3" pattern="$4"
  if grep -rql --include='*.cs' --include='*.java' --include='*.ts' --include='*.js' \
       --include='*.vue' --include='*.tsx' --include='*.jsx' \
       -E "$pattern" "$dir" >/dev/null 2>&1; then
    record "$variant" "$check" "FAIL"
  else
    record "$variant" "$check" "PASS"
  fi
}

# Check that a file exists (exact path, no glob).
assert_exists() {
  local variant="$1" check="$2" filepath="$3"
  if [[ -f "$filepath" ]]; then
    record "$variant" "$check" "PASS"
  else
    record "$variant" "$check" "FAIL"
  fi
}

# Check that a file does NOT exist. Supports directory check with trailing /*.
assert_not_exists() {
  local variant="$1" check="$2" filepath="$3"
  if [[ -f "$filepath" ]]; then
    record "$variant" "$check" "FAIL"
  elif [[ "$filepath" == *'/*' ]]; then
    # Directory wildcard: check if directory exists and has files
    local dir="${filepath%/*}"
    if [[ -d "$dir" ]] && [[ -n "$(ls -A "$dir" 2>/dev/null)" ]]; then
      record "$variant" "$check" "FAIL"
    else
      record "$variant" "$check" "PASS"
    fi
  else
    record "$variant" "$check" "PASS"
  fi
}

# ─── Backend: .NET minimal variants ──────────────────────────────────────────

validate_dotnet_minimal() {
  local arch="$1"
  local dir="$REPO_ROOT/backend/dotnet/${arch}-architecture/minimal"
  local label="dotnet/${arch}/minimal"

  if [[ ! -d "$dir" ]]; then
    record "$label" "directory exists" "FAIL"
    return
  fi

  # Build
  if $RUN_BUILDS; then
    if (cd "$dir" && dotnet build --nologo -v q 2>&1) >/dev/null; then
      record "$label" "build succeeds" "PASS"
    else
      record "$label" "build succeeds" "FAIL"
    fi
  else
    record "$label" "build succeeds" "SKIP"
  fi

  # Tests exist
  if [[ -d "$dir/tests" ]] && find "$dir/tests" -name '*Test*' -o -name '*Tests*' | grep -q .; then
    record "$label" "test files exist" "PASS"
  else
    record "$label" "test files exist" "FAIL"
  fi

  # Tests pass
  if $RUN_BUILDS; then
    if (cd "$dir" && dotnet test --nologo -v q 2>&1) >/dev/null; then
      record "$label" "tests pass" "PASS"
    else
      record "$label" "tests pass" "FAIL"
    fi
  else
    record "$label" "tests pass" "SKIP"
  fi

  # Health endpoint
  assert_grep "$label" "health endpoint exists" "$dir/src" \
    '(HealthController|health|\/health)'

  # Swagger config
  assert_grep "$label" "swagger config exists" "$dir/src" \
    '(AddSwaggerGen|UseSwagger|SwaggerDoc)'

  # Docker HEALTHCHECK
  local dockerfile="$REPO_ROOT/shared/templates/dotnet/Dockerfile"
  if [[ -f "$dockerfile" ]] && grep -q 'HEALTHCHECK' "$dockerfile"; then
    record "$label" "Docker HEALTHCHECK" "PASS"
  else
    record "$label" "Docker HEALTHCHECK" "FAIL"
  fi

  # NO user management controller
  assert_no_grep "$label" "NO user management controller" "$dir/src" \
    'class Users?Controller'

  # NO department management controller
  assert_no_grep "$label" "NO department management controller" "$dir/src" \
    'class Departments?Controller'

  # NO export controller
  assert_no_grep "$label" "NO export controller" "$dir/src" \
    'class Exports?Controller'
}

# ─── Backend: Spring Boot minimal variants ────────────────────────────────────

validate_spring_minimal() {
  local arch="$1"
  local dir="$REPO_ROOT/backend/spring/${arch}-architecture/minimal"
  local label="spring/${arch}/minimal"

  if [[ ! -d "$dir" ]]; then
    record "$label" "directory exists" "FAIL"
    return
  fi

  # Build
  if $RUN_BUILDS; then
    if (cd "$dir" && ./mvnw -B -q compile 2>&1) >/dev/null; then
      record "$label" "build succeeds" "PASS"
    else
      record "$label" "build succeeds" "FAIL"
    fi
  else
    record "$label" "build succeeds" "SKIP"
  fi

  # Tests exist
  local test_dir
  if [[ "$arch" == "clean" ]]; then
    test_dir="$dir/api/src/test"
  else
    test_dir="$dir/src/test"
  fi
  if [[ -d "$test_dir" ]] && find "$test_dir" -name '*Test.java' -o -name '*Tests.java' | grep -q .; then
    record "$label" "test files exist" "PASS"
  else
    record "$label" "test files exist" "FAIL"
  fi

  # Tests pass
  if $RUN_BUILDS; then
    if (cd "$dir" && ./mvnw -B -q test 2>&1) >/dev/null; then
      record "$label" "tests pass" "PASS"
    else
      record "$label" "tests pass" "FAIL"
    fi
  else
    record "$label" "tests pass" "SKIP"
  fi

  # Health endpoint
  local src_root
  if [[ "$arch" == "clean" ]]; then
    src_root="$dir/api/src"
  else
    src_root="$dir/src"
  fi

  assert_grep "$label" "health endpoint exists" "$src_root" \
    '(HealthController|/health|@GetMapping.*health)'

  # Swagger config (OpenApiConfig or springdoc)
  assert_grep "$label" "swagger config exists" "$src_root" \
    '(OpenApiConfig|springdoc|@OpenAPIDefinition|OpenAPI)'

  # Docker HEALTHCHECK
  local dockerfile="$REPO_ROOT/shared/templates/spring/Dockerfile"
  if [[ -f "$dockerfile" ]] && grep -q 'HEALTHCHECK' "$dockerfile"; then
    record "$label" "Docker HEALTHCHECK" "PASS"
  else
    record "$label" "Docker HEALTHCHECK" "FAIL"
  fi

  # NO user management controller
  assert_no_grep "$label" "NO user management controller" "$src_root" \
    'class Users?Controller'

  # NO department management controller
  assert_no_grep "$label" "NO department management controller" "$src_root" \
    'class Departments?Controller'

  # NO export controller
  assert_no_grep "$label" "NO export controller" "$src_root" \
    'class Exports?Controller'
}

# ─── Backend: NestJS minimal variants ─────────────────────────────────────────

validate_nestjs_minimal() {
  local arch="$1"
  local dir="$REPO_ROOT/backend/nestjs/${arch}-architecture/minimal"
  local label="nestjs/${arch}/minimal"

  if [[ ! -d "$dir" ]]; then
    record "$label" "directory exists" "FAIL"
    return
  fi

  # Build
  if $RUN_BUILDS; then
    if (cd "$dir" && npm run build 2>&1) >/dev/null; then
      record "$label" "build succeeds" "PASS"
    else
      record "$label" "build succeeds" "FAIL"
    fi
  else
    record "$label" "build succeeds" "SKIP"
  fi

  # Tests exist
  if find "$dir/src" -name '*.spec.ts' | grep -q .; then
    record "$label" "test files exist" "PASS"
  else
    record "$label" "test files exist" "FAIL"
  fi

  # Tests pass
  if $RUN_BUILDS; then
    if (cd "$dir" && npm test -- --passWithNoTests 2>&1) >/dev/null; then
      record "$label" "tests pass" "PASS"
    else
      record "$label" "tests pass" "FAIL"
    fi
  else
    record "$label" "tests pass" "SKIP"
  fi

  # Health endpoint
  assert_grep "$label" "health endpoint exists" "$dir/src" \
    "(HealthController|health\.controller|'health'|/health)"

  # Swagger config
  assert_grep "$label" "swagger config exists" "$dir/src" \
    '(SwaggerModule|DocumentBuilder|@nestjs/swagger)'

  # Docker HEALTHCHECK
  local dockerfile="$REPO_ROOT/shared/templates/nestjs/Dockerfile"
  if [[ -f "$dockerfile" ]] && grep -q 'HEALTHCHECK' "$dockerfile"; then
    record "$label" "Docker HEALTHCHECK" "PASS"
  else
    record "$label" "Docker HEALTHCHECK" "FAIL"
  fi

  # NO user management controller (users.controller.ts file or UsersController class)
  assert_no_grep "$label" "NO user management controller" "$dir/src" \
    'class UsersController'

  # NO department management controller
  assert_no_grep "$label" "NO department management controller" "$dir/src" \
    'class DepartmentsController'

  # NO export controller
  assert_no_grep "$label" "NO export controller" "$dir/src" \
    'class ExportController'
}

# ─── Frontend minimal variants ────────────────────────────────────────────────

validate_vue_minimal() {
  local ui="$1"
  local dir="$REPO_ROOT/frontend/vue/${ui}/minimal"
  local label="vue/${ui}/minimal"

  if [[ ! -d "$dir" ]]; then
    record "$label" "directory exists" "FAIL"
    return
  fi

  # Build
  if $RUN_BUILDS; then
    if (cd "$dir" && npm run build 2>&1) >/dev/null; then
      record "$label" "build succeeds" "PASS"
    else
      record "$label" "build succeeds" "FAIL"
    fi
  else
    record "$label" "build succeeds" "SKIP"
  fi

  # Required pages
  assert_exists "$label" "login page exists" \
    "$dir/src/pages/login.vue"
  assert_exists "$label" "forgot-password page exists" \
    "$dir/src/pages/forgot-password.vue"
  assert_exists "$label" "reset-password page exists" \
    "$dir/src/pages/reset-password.vue"
  assert_exists "$label" "profile page exists" \
    "$dir/src/pages/profile.vue"

  # Excluded pages (full-only)
  assert_not_exists "$label" "NO dashboard page" \
    "$dir/src/pages/dashboard.vue"
  assert_not_exists "$label" "NO user management page" \
    "$dir/src/pages/users/*"
  assert_not_exists "$label" "NO department management page" \
    "$dir/src/pages/departments/*"
  assert_not_exists "$label" "NO dead type files" \
    "$dir/src/types/user.js"
}

validate_react_minimal() {
  local ui="$1"
  local dir="$REPO_ROOT/frontend/react/${ui}/minimal"
  local label="react/${ui}/minimal"

  if [[ ! -d "$dir" ]]; then
    record "$label" "directory exists" "FAIL"
    return
  fi

  # Build
  if $RUN_BUILDS; then
    if (cd "$dir" && npm run build 2>&1) >/dev/null; then
      record "$label" "build succeeds" "PASS"
    else
      record "$label" "build succeeds" "FAIL"
    fi
  else
    record "$label" "build succeeds" "SKIP"
  fi

  # Required pages
  assert_exists "$label" "login page exists" \
    "$dir/src/pages/Login.tsx"
  assert_exists "$label" "forgot-password page exists" \
    "$dir/src/pages/ForgotPassword.tsx"
  assert_exists "$label" "reset-password page exists" \
    "$dir/src/pages/ResetPassword.tsx"
  assert_exists "$label" "profile page exists" \
    "$dir/src/pages/Profile.tsx"

  # Excluded pages (full-only)
  assert_not_exists "$label" "NO dashboard page" \
    "$dir/src/pages/Dashboard.tsx"
  assert_not_exists "$label" "NO user management page" \
    "$dir/src/pages/Users.tsx"
  assert_not_exists "$label" "NO department management page" \
    "$dir/src/pages/Departments.tsx"

  # Dead type files for excluded entities
  assert_not_exists "$label" "NO dead type files (user)" \
    "$dir/src/types/user.ts"
  assert_not_exists "$label" "NO dead type files (department)" \
    "$dir/src/types/department.ts"
}

# ─── Run all checks ──────────────────────────────────────────────────────────

echo ""
echo "Minimal Variant Validation"
echo "=========================="
echo ""

if $RUN_BUILDS; then
  echo "Mode: FULL (structural checks + builds + tests)"
else
  echo "Mode: STRUCTURAL (grep/file checks only — pass --build for full)"
fi
echo ""

# Backend
for arch in clean feature nlayer; do
  validate_dotnet_minimal "$arch"
done
for arch in clean feature nlayer; do
  validate_spring_minimal "$arch"
done
for arch in clean feature nlayer; do
  validate_nestjs_minimal "$arch"
done

# Frontend
for ui in vuetify primevue; do
  validate_vue_minimal "$ui"
done
for ui in mui primereact; do
  validate_react_minimal "$ui"
done

# ─── Print results ───────────────────────────────────────────────────────────

echo ""
printf '%-52s | %-40s | %s\n' "VARIANT" "CHECK" "STATUS"
printf '%-52s-+-%-40s-+-%s\n' \
  "----------------------------------------------------" \
  "----------------------------------------" \
  "------"

for line in "${RESULTS[@]}"; do
  echo "$line"
done

echo ""
echo "──────────────────────────────────────────────────"
echo "  PASS: $PASS_COUNT   FAIL: $FAIL_COUNT   SKIP: $SKIP_COUNT"
echo "──────────────────────────────────────────────────"
echo ""

if [[ $FAIL_COUNT -gt 0 ]]; then
  echo "RESULT: FAILED ($FAIL_COUNT check(s) failed)"
  exit 1
else
  echo "RESULT: ALL CHECKS PASSED"
  exit 0
fi

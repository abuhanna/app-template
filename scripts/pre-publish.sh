#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="/tmp/check-output-$$.log"

cd "$REPO_ROOT"

echo "╔══════════════════════════════════════════════╗"
echo "║  AppTemplate Pre-Publish Validation Suite    ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0
RESULTS=()

run_check() {
  local name="$1"
  local cmd="$2"
  echo "▶ $name..."
  if bash -c "$cmd" > "$LOG_FILE" 2>&1; then
    echo "  ✅ PASS"
    PASS=$((PASS + 1))
    RESULTS+=("✅ $name")
  else
    echo "  ❌ FAIL (see $LOG_FILE)"
    FAIL=$((FAIL + 1))
    RESULTS+=("❌ $name")
  fi
}

# ── Layer 1: Quick Tests (~3 min) ──
echo "━━━ Layer 1: Quick Tests ━━━"
run_check "CLI build" "cd create-apptemplate && npm run build"
run_check "CLI typecheck" "cd create-apptemplate && npm run typecheck"
run_check "CLI unit tests" "cd create-apptemplate && npm test"
run_check "Layer 1 tests" "npm run test:quick"
run_check "Version consistency" "npm run check-versions"
run_check "Feature parity" "npm run check-parity"
run_check "Minimal variant compliance" "./scripts/validate-minimals.sh"
run_check "Feature validation" "./scripts/validate-features.sh"

# ── Layer 2: Full Matrix (~45-90 min) ──
echo ""
echo "━━━ Layer 2: Full Matrix (all combinations) ━━━"
run_check "Full matrix generation" "E2E_ALL=1 npm run test:matrix -- --reporter=dot"

# ── Layer 3: Contract Tests (~30 min) ──
echo ""
echo "━━━ Layer 3: Contract Tests ━━━"
echo "Starting test database..."
./scripts/test-db.sh start
run_check "API contract compliance" "npm run test:contract -- --reporter=dot"
./scripts/test-db.sh stop

# ── Summary ──
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  RESULTS                                     ║"
echo "╠══════════════════════════════════════════════╣"
for r in "${RESULTS[@]}"; do echo "║  $r"; done
echo "╠══════════════════════════════════════════════╣"
echo "║  Total: $((PASS + FAIL))  Pass: $PASS  Fail: $FAIL"
echo "╚══════════════════════════════════════════════╝"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "❌ PRE-PUBLISH FAILED — fix $FAIL issue(s) before publishing"
  exit 1
else
  echo ""
  echo "✅ ALL CHECKS PASSED — safe to publish"
  echo ""
  echo "To publish:"
  echo "  cd create-apptemplate"
  echo "  npm version <major|minor|patch>"
  echo "  npm publish --access public"
  exit 0
fi

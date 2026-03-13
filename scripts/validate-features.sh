#!/bin/bash
# =============================================================================
# validate-features.sh
# Validates that all 6 default features exist across every backend & frontend
# variant, per docs/api-contract.md.
#
# Features:
#   1. Notifications   (all variants)
#   2. File Management (all variants)
#   3. Audit Logs      (all variants)
#   4. Export           (full + minimal only)
#   5. Structured Logging (all variants)
#   6. Rate Limiting   (full + minimal only)
#
# Usage: bash scripts/validate-features.sh [--verbose]
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

VERBOSE="${1:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PASS="${GREEN}PASS${NC}"
WARN="${YELLOW}WARN${NC}"
FAIL="${RED}FAIL${NC}"
SKIP="${CYAN}N/A ${NC}"

TOTAL_PASS=0
TOTAL_FAIL=0
TOTAL_WARN=0
DETAILS=""
COUNT_FILE=$(mktemp)
echo "0 0 0" > "$COUNT_FILE"
trap "rm -f $COUNT_FILE" EXIT

# ─── Helpers ────────────────────────────────────────────────────────────────────

log_detail() {
  DETAILS+="  $1\n"
}

file_exists() {
  [[ -f "$1" ]]
}

dir_exists() {
  [[ -d "$1" ]]
}

# Check if any file in a directory tree matches a glob (case insensitive name)
has_file() {
  local dir="$1"
  local pattern="$2"
  find "$dir" -maxdepth 12 -iname "$pattern" -not -path "*/node_modules/*" -not -path "*/target/*" -not -path "*/dist/*" -not -path "*/bin/*" -not -path "*/obj/*" -not -path "*/coverage/*" 2>/dev/null | head -1 | grep -q .
}

# Check if any source file contains a pattern
has_pattern() {
  local dir="$1"
  local pattern="$2"
  local ext="${3:-*}"
  grep -rl "$pattern" "$dir" --include="*.$ext" \
    --exclude-dir=node_modules --exclude-dir=target \
    --exclude-dir=dist --exclude-dir=bin --exclude-dir=obj \
    --exclude-dir=coverage 2>/dev/null | head -1 | grep -q .
}

# ─── .NET Checks ───────────────────────────────────────────────────────────────

check_dotnet() {
  local base="$1"
  local variant="$2"   # e.g. clean-architecture/full
  local var_type="$3"  # full or minimal

  local notifications="FAIL"
  local files="FAIL"
  local audit="FAIL"
  local export_feat="FAIL"
  local logger="FAIL"
  local ratelimit="FAIL"

  # --- Notifications ---
  if has_file "$base" "*Notification*.cs" && has_pattern "$base" "notifications" "cs"; then
    if has_pattern "$base" "unread-count\|UnreadCount\|unread_count" "cs" && \
       has_pattern "$base" "read-all\|ReadAll\|read_all" "cs"; then
      notifications="PASS"
    else
      notifications="WARN"
      log_detail "[dotnet/$variant] Notifications: missing some endpoints (unread-count/read-all)"
    fi
  else
    log_detail "[dotnet/$variant] Notifications: entity or controller missing"
  fi

  # --- File Management ---
  if has_file "$base" "*File*.cs" && has_pattern "$base" "FilesController\|FileController\|files" "cs"; then
    if has_pattern "$base" "upload\|Upload\|IFormFile" "cs" && \
       has_pattern "$base" "download\|Download" "cs"; then
      files="PASS"
    else
      files="WARN"
      log_detail "[dotnet/$variant] Files: missing upload or download endpoint"
    fi
  else
    log_detail "[dotnet/$variant] Files: entity or controller missing"
  fi

  # --- Audit Logs ---
  if has_file "$base" "*AuditLog*.cs" && has_pattern "$base" "audit-logs\|AuditLog" "cs"; then
    audit="PASS"
  else
    audit="FAIL"
    log_detail "[dotnet/$variant] AuditLogs: entity or controller missing"
  fi

  # --- Export ---
  if [[ "$var_type" == "full" || "$var_type" == "minimal" ]]; then
    if has_pattern "$base" "ExportController\|ExportService" "cs"; then
      if has_pattern "$base" "ClosedXML\|CsvHelper\|QuestPDF" "cs" || \
         has_pattern "$base" "ClosedXML\|CsvHelper\|QuestPDF" "csproj"; then
        export_feat="PASS"
      else
        export_feat="WARN"
        log_detail "[dotnet/$variant] Export: controller exists but missing export library references"
      fi
    else
      export_feat="FAIL"
      log_detail "[dotnet/$variant] Export: ExportController/ExportService missing"
    fi
  fi

  # --- Logger ---
  if has_pattern "$base" "Serilog" "cs" || has_pattern "$base" "Serilog" "csproj" || \
     has_pattern "$base" "Serilog" "json"; then
    if has_pattern "$base" "WriteTo.*Console\|Console.*sink\|WriteTo.*File\|File.*sink\|CompactJson\|RollingFile" "json" || \
       has_pattern "$base" "WriteTo" "cs"; then
      logger="PASS"
    else
      logger="WARN"
      log_detail "[dotnet/$variant] Logger: Serilog present but missing file/console sinks"
    fi
  else
    logger="FAIL"
    log_detail "[dotnet/$variant] Logger: Serilog not configured"
  fi

  # --- Rate Limiting ---
  if [[ "$var_type" == "full" || "$var_type" == "minimal" ]]; then
    if has_pattern "$base" "AspNetCoreRateLimit\|IpRateLimiting\|UseIpRateLimiting" "cs" || \
       has_pattern "$base" "AspNetCoreRateLimit" "csproj"; then
      ratelimit="PASS"
    else
      ratelimit="FAIL"
      log_detail "[dotnet/$variant] RateLimiting: AspNetCoreRateLimit not configured"
    fi
  fi

  echo "$notifications|$files|$audit|$export_feat|$logger|$ratelimit"
}

# ─── Spring Checks ──────────────────────────────────────────────────────────────

check_spring() {
  local base="$1"
  local variant="$2"
  local var_type="$3"

  local notifications="FAIL"
  local files="FAIL"
  local audit="FAIL"
  local export_feat="FAIL"
  local logger="FAIL"
  local ratelimit="FAIL"

  # --- Notifications ---
  if has_file "$base" "*Notification*.java" && has_pattern "$base" "NotificationsController\|NotificationController" "java"; then
    if has_pattern "$base" "unread-count\|unreadCount" "java" && \
       has_pattern "$base" "read-all\|readAll" "java"; then
      # Check for delete endpoint
      if has_pattern "$base" "DeleteMapping.*notification\|deleteNotification\|@DeleteMapping" "java"; then
        notifications="PASS"
      else
        notifications="WARN"
        log_detail "[spring/$variant] Notifications: missing DELETE endpoint"
      fi
    else
      notifications="WARN"
      log_detail "[spring/$variant] Notifications: missing unread-count or read-all endpoint"
    fi
  else
    log_detail "[spring/$variant] Notifications: entity or controller missing"
  fi

  # --- File Management ---
  if has_file "$base" "*File*.java" && has_pattern "$base" "FileController\|FilesController" "java"; then
    if has_pattern "$base" "MultipartFile\|upload" "java" && \
       has_pattern "$base" "download" "java"; then
      files="PASS"
    else
      files="WARN"
      log_detail "[spring/$variant] Files: missing upload or download"
    fi
  else
    log_detail "[spring/$variant] Files: entity or controller missing"
  fi

  # --- Audit Logs ---
  if has_file "$base" "*AuditLog*.java" && has_pattern "$base" "AuditLog" "java"; then
    audit="PASS"
  else
    audit="FAIL"
    log_detail "[spring/$variant] AuditLogs: entity or controller missing"
  fi

  # --- Export ---
  if [[ "$var_type" == "full" || "$var_type" == "minimal" ]]; then
    if has_pattern "$base" "ExportController\|ExportService" "java"; then
      if has_pattern "$base" "poi\|commons-csv\|itext\|opencsv" "xml" || \
         has_pattern "$base" "poi\|commons-csv\|itext" "java"; then
        export_feat="PASS"
      else
        export_feat="WARN"
        log_detail "[spring/$variant] Export: controller exists but missing library deps"
      fi
    else
      export_feat="FAIL"
      log_detail "[spring/$variant] Export: ExportController/ExportService missing"
    fi
  fi

  # --- Logger ---
  if has_file "$base" "logback-spring.xml"; then
    if has_pattern "$base" "LogstashEncoder\|JsonLayout\|logstash" "xml"; then
      logger="PASS"
    else
      logger="WARN"
      log_detail "[spring/$variant] Logger: logback exists but no JSON/Logstash encoder"
    fi
  elif has_pattern "$base" "logging.level\|logging.pattern" "yml" || \
       has_pattern "$base" "logging.level\|logging.pattern" "yaml" || \
       has_pattern "$base" "logging.level\|logging.pattern" "properties"; then
    logger="WARN"
    log_detail "[spring/$variant] Logger: basic logging config only, no logback-spring.xml with structured JSON"
  else
    logger="FAIL"
    log_detail "[spring/$variant] Logger: no logging configuration found"
  fi

  # --- Rate Limiting ---
  if [[ "$var_type" == "full" || "$var_type" == "minimal" ]]; then
    if has_pattern "$base" "bucket4j\|Bucket4j\|RateLimitFilter\|RateLimit" "java" || \
       has_pattern "$base" "bucket4j" "xml"; then
      if has_pattern "$base" "RateLimitFilter\|RateLimitInterceptor\|RateLimitingFilter\|Bucket" "java"; then
        ratelimit="PASS"
      else
        ratelimit="WARN"
        log_detail "[spring/$variant] RateLimiting: bucket4j dep exists but no filter/interceptor implementation"
      fi
    else
      ratelimit="FAIL"
      log_detail "[spring/$variant] RateLimiting: no rate limiting library or implementation"
    fi
  fi

  echo "$notifications|$files|$audit|$export_feat|$logger|$ratelimit"
}

# ─── NestJS Checks ──────────────────────────────────────────────────────────────

check_nestjs() {
  local base="$1"
  local variant="$2"
  local var_type="$3"

  local notifications="FAIL"
  local files="FAIL"
  local audit="FAIL"
  local export_feat="FAIL"
  local logger="FAIL"
  local ratelimit="FAIL"

  # --- Notifications ---
  if has_file "$base" "*notification*.ts" && has_pattern "$base" "NotificationsController\|notifications.controller" "ts"; then
    if has_pattern "$base" "unread-count\|unreadCount" "ts" && \
       has_pattern "$base" "read-all\|readAll" "ts"; then
      notifications="PASS"
    else
      notifications="WARN"
      log_detail "[nestjs/$variant] Notifications: missing unread-count or read-all endpoint"
    fi
  else
    log_detail "[nestjs/$variant] Notifications: entity or controller missing"
  fi

  # --- File Management ---
  if has_file "$base" "*file*.ts" && has_pattern "$base" "FilesController\|FileController\|files.controller" "ts"; then
    if has_pattern "$base" "FileInterceptor\|upload\|multer" "ts" && \
       has_pattern "$base" "download" "ts"; then
      files="PASS"
    else
      files="WARN"
      log_detail "[nestjs/$variant] Files: missing upload or download"
    fi
  else
    log_detail "[nestjs/$variant] Files: entity or controller missing"
  fi

  # --- Audit Logs ---
  if has_file "$base" "*audit*.ts" && has_pattern "$base" "AuditLog\|audit-log\|audit_log" "ts"; then
    audit="PASS"
  else
    audit="FAIL"
    log_detail "[nestjs/$variant] AuditLogs: entity or controller missing"
  fi

  # --- Export ---
  if [[ "$var_type" == "full" || "$var_type" == "minimal" ]]; then
    if has_pattern "$base" "ExportController\|ExportService\|export.controller\|export.service" "ts"; then
      if grep -q "exceljs\|json2csv\|pdfkit" "$base/package.json" 2>/dev/null; then
        export_feat="PASS"
      else
        export_feat="WARN"
        log_detail "[nestjs/$variant] Export: controller exists but missing exceljs/json2csv/pdfkit deps"
      fi
    else
      export_feat="FAIL"
      log_detail "[nestjs/$variant] Export: ExportController/ExportService missing"
    fi
  fi

  # --- Logger ---
  if grep -q "nestjs-pino\|pino" "$base/package.json" 2>/dev/null; then
    if has_pattern "$base" "LoggerModule\|PinoLogger\|nestjs-pino" "ts"; then
      logger="PASS"
    else
      logger="WARN"
      log_detail "[nestjs/$variant] Logger: pino in deps but not configured in app module"
    fi
  elif has_pattern "$base" "LoggingInterceptor\|LoggerService" "ts"; then
    logger="WARN"
    log_detail "[nestjs/$variant] Logger: basic LoggingInterceptor only, missing Pino structured logging"
  else
    logger="FAIL"
    log_detail "[nestjs/$variant] Logger: no logging configuration found"
  fi

  # --- Rate Limiting ---
  if [[ "$var_type" == "full" || "$var_type" == "minimal" ]]; then
    if grep -q "@nestjs/throttler\|throttler" "$base/package.json" 2>/dev/null; then
      if has_pattern "$base" "ThrottlerModule\|ThrottlerGuard" "ts"; then
        ratelimit="PASS"
      else
        ratelimit="WARN"
        log_detail "[nestjs/$variant] RateLimiting: throttler in deps but not configured"
      fi
    else
      ratelimit="FAIL"
      log_detail "[nestjs/$variant] RateLimiting: @nestjs/throttler not installed"
    fi
  fi

  echo "$notifications|$files|$audit|$export_feat|$logger|$ratelimit"
}

# ─── Frontend Checks ────────────────────────────────────────────────────────────

check_frontend() {
  local base="$1"
  local variant="$2"
  local var_type="$3"
  local framework="$4"  # vue or react

  local notifications="FAIL"
  local files="FAIL"
  local audit="FAIL"
  local export_feat="FAIL"
  local api_services="FAIL"
  local realtime="FAIL"

  local ext="ts"
  [[ "$framework" == "vue" ]] && ext="vue"

  # --- Notifications ---
  if has_file "$base/src" "*otification*.$ext" || has_file "$base/src" "*otification*.js"; then
    notifications="PASS"
  else
    notifications="FAIL"
    log_detail "[frontend/$variant] Notifications: page/component missing"
  fi

  # --- File Management ---
  if has_file "$base/src" "*ile*.$ext" || has_file "$base/src" "*ileService*" || \
     has_file "$base/src" "*iles*.$ext"; then
    if has_pattern "$base/src" "upload\|Upload" "ts" || has_pattern "$base/src" "upload\|Upload" "js" || \
       has_pattern "$base/src" "upload\|Upload" "vue"; then
      files="PASS"
    else
      files="WARN"
      log_detail "[frontend/$variant] Files: page exists but no upload functionality"
    fi
  else
    files="FAIL"
    log_detail "[frontend/$variant] Files: page/component missing"
  fi

  # --- Audit Logs ---
  if has_file "$base/src" "*udit*.$ext" || has_file "$base/src" "*udit*.js" || \
     has_file "$base/src" "*AuditLog*.$ext"; then
    audit="PASS"
  else
    audit="FAIL"
    log_detail "[frontend/$variant] AuditLogs: page/component missing"
  fi

  # --- Export ---
  if [[ "$var_type" == "full" || "$var_type" == "minimal" ]]; then
    if has_file "$base/src" "*xport*" && has_pattern "$base/src" "xlsx\|csv\|pdf\|format" "ts" || \
       has_pattern "$base/src" "xlsx\|csv\|pdf\|format" "js" || \
       has_pattern "$base/src" "xlsx\|csv\|pdf\|format" "vue"; then
      export_feat="PASS"
    else
      export_feat="FAIL"
      log_detail "[frontend/$variant] Export: ExportButton or export service missing"
    fi
  fi

  # --- API Services ---
  if has_pattern "$base/src" "axios\|interceptor" "ts" || \
     has_pattern "$base/src" "axios\|interceptor" "js"; then
    if has_file "$base/src" "*api*" || has_file "$base/src" "*service*"; then
      api_services="PASS"
    else
      api_services="WARN"
      log_detail "[frontend/$variant] API: axios configured but no service files"
    fi
  else
    api_services="FAIL"
    log_detail "[frontend/$variant] API: no axios/interceptor setup"
  fi

  # --- Real-time ---
  if has_pattern "$base/src" "signalr\|stomp\|socket.io\|VITE_BACKEND_TYPE" "ts" || \
     has_pattern "$base/src" "signalr\|stomp\|socket.io\|VITE_BACKEND_TYPE" "js"; then
    realtime="PASS"
  else
    realtime="FAIL"
    log_detail "[frontend/$variant] Realtime: no SignalR/STOMP/Socket.IO integration"
  fi

  echo "$notifications|$files|$audit|$export_feat|$api_services|$realtime"
}

# ─── Run All Checks ─────────────────────────────────────────────────────────────

bump_counter() {
  local counts
  read -r p w f < "$COUNT_FILE"
  case "$1" in
    PASS) p=$((p+1)) ;;
    WARN) w=$((w+1)) ;;
    FAIL) f=$((f+1)) ;;
  esac
  echo "$p $w $f" > "$COUNT_FILE"
}

colorize() {
  case "$1" in
    PASS) echo -e "$PASS" ; bump_counter PASS ;;
    WARN) echo -e "$WARN" ; bump_counter WARN ;;
    FAIL) echo -e "$FAIL" ; bump_counter FAIL ;;
    *)    echo -e "$SKIP" ;;
  esac
}

print_row() {
  local label="$1"
  shift
  printf "| %-35s |" "$label"
  for val in "$@"; do
    printf " %b |" "$(colorize "$val")"
  done
  echo ""
}

separator() {
  echo "|-------------------------------------|------|------|-------|--------|--------|--------|"
}

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║           Feature Validation Report — All Variants                      ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ─── .NET Backend ────────────────────────────────────────────────────────────────

echo -e "${BOLD}${CYAN}=== .NET Backend ===${NC}"
echo ""
echo "| Variant                             | Notf | File | Audit | Export | Logger | RateL  |"
separator

for arch in clean feature nlayer; do
  for vtype in full minimal; do
    base="$ROOT_DIR/backend/dotnet/${arch}-architecture/$vtype"
    if dir_exists "$base"; then
      IFS='|' read -r n f a e l r <<< "$(check_dotnet "$base" "${arch}-architecture/$vtype" "$vtype")"
      print_row "dotnet/${arch}-arch/$vtype" "$n" "$f" "$a" "$e" "$l" "$r"
    fi
  done
done

echo ""

# ─── Spring Backend ─────────────────────────────────────────────────────────────

echo -e "${BOLD}${CYAN}=== Spring Backend ===${NC}"
echo ""
echo "| Variant                             | Notf | File | Audit | Export | Logger | RateL  |"
separator

for arch in clean feature nlayer; do
  for vtype in full minimal; do
    base="$ROOT_DIR/backend/spring/${arch}-architecture/$vtype"
    if dir_exists "$base"; then
      IFS='|' read -r n f a e l r <<< "$(check_spring "$base" "${arch}-architecture/$vtype" "$vtype")"
      print_row "spring/${arch}-arch/$vtype" "$n" "$f" "$a" "$e" "$l" "$r"
    fi
  done
done

echo ""

# ─── NestJS Backend ─────────────────────────────────────────────────────────────

echo -e "${BOLD}${CYAN}=== NestJS Backend ===${NC}"
echo ""
echo "| Variant                             | Notf | File | Audit | Export | Logger | RateL  |"
separator

for arch in clean feature nlayer; do
  for vtype in full minimal; do
    base="$ROOT_DIR/backend/nestjs/${arch}-architecture/$vtype"
    if dir_exists "$base"; then
      IFS='|' read -r n f a e l r <<< "$(check_nestjs "$base" "${arch}-architecture/$vtype" "$vtype")"
      print_row "nestjs/${arch}-arch/$vtype" "$n" "$f" "$a" "$e" "$l" "$r"
    fi
  done
done

echo ""

# ─── Frontend ───────────────────────────────────────────────────────────────────

echo -e "${BOLD}${CYAN}=== Frontend ===${NC}"
echo ""
echo "| Variant                             | Notf | File | Audit | Export | API    | RT     |"
separator

for fw in vue react; do
  if [[ "$fw" == "vue" ]]; then
    libs="vuetify primevue"
  else
    libs="mui primereact"
  fi
  for lib in $libs; do
    for vtype in full minimal; do
      base="$ROOT_DIR/frontend/$fw/$lib/$vtype"
      if dir_exists "$base"; then
        IFS='|' read -r n f a e api rt <<< "$(check_frontend "$base" "$fw/$lib/$vtype" "$vtype" "$fw")"
        print_row "$fw/$lib/$vtype" "$n" "$f" "$a" "$e" "$api" "$rt"
      fi
    done
  done
done

echo ""

# ─── Summary ────────────────────────────────────────────────────────────────────

read -r TOTAL_PASS TOTAL_WARN TOTAL_FAIL < "$COUNT_FILE"

echo -e "${BOLD}=== Summary ===${NC}"
echo -e "  ${GREEN}PASS:${NC} $TOTAL_PASS"
echo -e "  ${YELLOW}WARN:${NC} $TOTAL_WARN"
echo -e "  ${RED}FAIL:${NC} $TOTAL_FAIL"
echo ""

if [[ -n "$DETAILS" ]]; then
  echo -e "${BOLD}=== Details ===${NC}"
  echo -e "$DETAILS"
fi

if [[ $TOTAL_FAIL -gt 0 ]]; then
  echo -e "${RED}${BOLD}Validation FAILED — $TOTAL_FAIL feature(s) missing${NC}"
  exit 1
elif [[ $TOTAL_WARN -gt 0 ]]; then
  echo -e "${YELLOW}${BOLD}Validation passed with $TOTAL_WARN warning(s)${NC}"
  exit 0
else
  echo -e "${GREEN}${BOLD}All features validated successfully!${NC}"
  exit 0
fi

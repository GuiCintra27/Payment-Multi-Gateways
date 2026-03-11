#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="betalent-payment-gateway"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

die() { log_error "$1"; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "$1 not found. Install it first."
}

wait_for_port() {
  local host="$1" port="$2" name="$3" timeout="${4:-60}"
  log_info "Waiting for ${name} (${host}:${port})..."
  local start; start="$(date +%s)"
  while true; do
    (echo >/dev/tcp/"${host}"/"${port}") >/dev/null 2>&1 && { log_info "${name} is ready."; return 0; }
    [ $(($(date +%s) - start)) -ge "${timeout}" ] && { log_error "${name} did not start in ${timeout}s."; return 1; }
    sleep 1
  done
}

COMPOSE_CMD=""
APP_PID=""

cleanup() {
  local exit_code=$?
  if [ -n "${APP_PID}" ] && kill -0 "${APP_PID}" 2>/dev/null; then
    log_warn "Stopping AdonisJS (PID ${APP_PID})..."
    kill -TERM "${APP_PID}" 2>/dev/null || true
    wait "${APP_PID}" 2>/dev/null || true
  fi
  exit "${exit_code}"
}
trap cleanup EXIT INT TERM

# ──────────────────────────────────────────────────────────
log_info "Starting ${PROJECT_NAME} (local dev)..."

require_cmd docker
require_cmd node
require_cmd npm

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  die "docker compose not found."
fi

# ── Start MySQL + Gateway Mocks ──
log_info "Starting infrastructure (MySQL + Gateway Mocks)..."
${COMPOSE_CMD} -f "${ROOT_DIR}/docker-compose.yaml" up -d mysql gateway-mock

wait_for_port 127.0.0.1 3306 "MySQL" 60 || exit 1
wait_for_port 127.0.0.1 3001 "Gateway Mock 1" 30 || exit 1
wait_for_port 127.0.0.1 3002 "Gateway Mock 2" 30 || exit 1

# ── Install dependencies ──
if [ ! -d "${ROOT_DIR}/node_modules" ]; then
  log_info "Installing dependencies..."
  (cd "${ROOT_DIR}" && npm install)
fi

# ── Run migrations + seeds ──
log_info "Running migrations..."
(cd "${ROOT_DIR}" && node ace migration:run --force)

log_info "Running seeds..."
(cd "${ROOT_DIR}" && node ace db:seed) || log_warn "Seeds may have already run."

# ── Start AdonisJS dev server ──
log_info "Starting AdonisJS dev server..."
(cd "${ROOT_DIR}" && node ace serve --hmr) &
APP_PID=$!

wait_for_port 127.0.0.1 3333 "AdonisJS" 30 || exit 1

echo ""
echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}  ${PROJECT_NAME} is running locally${NC}"
echo -e "${GREEN}====================================================${NC}"
echo ""
echo -e "  API:            ${BLUE}http://localhost:3333${NC}"
echo -e "  Gateway Mock 1: ${BLUE}http://localhost:3001${NC}"
echo -e "  Gateway Mock 2: ${BLUE}http://localhost:3002${NC}"
echo -e "  MySQL:          ${BLUE}localhost:3306${NC}"
echo ""
echo -e "${YELLOW}Hot-reload is enabled.${NC}"
echo -e "Press ${GREEN}Ctrl+C${NC} to stop."
echo ""

wait "${APP_PID}"

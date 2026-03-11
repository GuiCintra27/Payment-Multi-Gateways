#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCOPE="${1:-all}"

log() { printf "\n[ci] %s\n" "$1"; }

run_lint() {
  log "Running lint"
  (cd "$ROOT_DIR" && npm run lint)
}

run_test() {
  log "Running tests"
  (cd "$ROOT_DIR" && npm test)
}

run_typecheck() {
  log "Running typecheck"
  (cd "$ROOT_DIR" && npm run typecheck)
}

wait_for() {
  local url="$1" label="$2" retries="${3:-30}" sleep_time="${4:-2}"
  for _ in $(seq 1 "$retries"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      log "OK: $label"
      return 0
    fi
    sleep "$sleep_time"
  done
  log "FAIL: $label"
  return 1
}

run_smoke() {
  log "Running smoke test (docker compose)"
  (cd "$ROOT_DIR" && docker compose up -d --build)
  wait_for "http://localhost:3333" "app health" 60 2
  log "Smoke OK"
}

cleanup() {
  if [[ "$SCOPE" == "smoke" || "$SCOPE" == "all" ]]; then
    log "Cleaning up docker compose"
    (cd "$ROOT_DIR" && docker compose down) || true
  fi
}
trap cleanup EXIT

case "$SCOPE" in
  lint)      run_lint ;;
  test)      run_test ;;
  typecheck) run_typecheck ;;
  smoke)     run_smoke ;;
  all)
    run_lint
    run_typecheck
    run_test
    ;;
  *)
    echo "Usage: $0 [lint|test|typecheck|smoke|all]"
    exit 1
    ;;
esac

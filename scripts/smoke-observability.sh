#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_URL="${BASE_URL:-http://localhost:3333}"
LOKI_URL="${LOKI_URL:-http://localhost:3100}"
TEMPO_URL="${TEMPO_URL:-http://localhost:3200}"
GRAFANA_URL="${GRAFANA_URL:-http://localhost:${GRAFANA_PORT:-3005}}"
GRAFANA_USER="${GRAFANA_USER:-admin}"
GRAFANA_PASSWORD="${GRAFANA_PASSWORD:-admin}"
ADMIN_EMAIL="${SMOKE_ADMIN_EMAIL:-admin@betalent.tech}"
ADMIN_PASSWORD="${SMOKE_ADMIN_PASSWORD:-admin123}"
REQUEST_PREFIX="${OBS_SMOKE_REQUEST_PREFIX:-obs-smoke-$(date +%s)}"
TMP_DIR="$(mktemp -d)"
KEEP_STACK="${OBS_SMOKE_KEEP_STACK:-false}"

compose() {
  docker compose -f "$ROOT_DIR/docker-compose.yaml" -f "$ROOT_DIR/docker-compose.monitoring.yaml" "$@"
}

cleanup() {
  if [[ "$KEEP_STACK" != "true" ]]; then
    compose down -v >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

log() {
  printf '\n[obs-smoke] %s\n' "$1"
}

fail() {
  printf '\n[obs-smoke][error] %s\n' "$1" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 not found"
}

query_grafana_datasources() {
  local output_file="$1"
  curl -sS -u "$GRAFANA_USER:$GRAFANA_PASSWORD" "$GRAFANA_URL/api/datasources" -o "$output_file"
}

assert_grafana_datasource() {
  local datasources_file="$1"
  local datasource_name="$2"

  node -e "
    const fs = require('fs')
    const payload = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'))
    const expectedName = process.argv[2]
    const hasDatasource = Array.isArray(payload) && payload.some((item) => item?.name === expectedName)
    if (!hasDatasource) process.exit(1)
  " "$datasources_file" "$datasource_name" || fail "Grafana datasource '$datasource_name' not found"
}

wait_for_http() {
  local name="$1"
  local url="$2"
  local retries="${3:-60}"
  local delay_seconds="${4:-2}"

  for _ in $(seq 1 "$retries"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay_seconds"
  done

  fail "$name did not become ready at $url"
}

request() {
  local method="$1"
  local url="$2"
  local output_file="$3"
  local body="${4:-}"
  shift 4 || true

  local headers=("$@")
  local args=(-sS -o "$output_file" -w '%{http_code}' -X "$method" "$url")

  for header in "${headers[@]}"; do
    args+=(-H "$header")
  done

  if [[ -n "$body" ]]; then
    args+=(-d "$body")
  fi

  curl "${args[@]}"
}

json_value() {
  local file="$1"
  local expression="$2"

  node -e "
    const fs = require('fs')
    const data = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'))
    const value = (function () { return ${expression} })()
    if (value === undefined || value === null) process.exit(1)
    process.stdout.write(String(value))
  " "$file"
}

assert_status() {
  local actual="$1"
  local expected="$2"
  local label="$3"

  [[ "$actual" == "$expected" ]] || fail "$label returned HTTP $actual, expected $expected"
}

query_loki_for_request_id() {
  local request_id="$1"
  local output_file="$2"
  local query="{service=\"app\"} |= \"\\\"requestId\\\":\\\"$request_id\\\"\""
  local end_ns start_ns
  end_ns="$(date +%s)000000000"
  start_ns="$((end_ns - 600000000000))"

  curl -sS -G "$LOKI_URL/loki/api/v1/query_range" \
    --data-urlencode "query=$query" \
    --data-urlencode "limit=200" \
    --data-urlencode "start=$start_ns" \
    --data-urlencode "end=$end_ns" \
    -o "$output_file"
}

extract_trace_id_from_loki() {
  local file="$1"
  local message="$2"

  node -e "
    const fs = require('fs')
    const payload = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'))
    const expectedMessage = process.argv[2]

    const streams = payload?.data?.result ?? []
    for (const stream of streams) {
      for (const value of stream.values ?? []) {
        const line = String(value[1] ?? '')
        if (!line.includes(expectedMessage)) continue

        const traceMatch = line.match(/\"trace_id\":\"([a-f0-9]{32})\"/)
        if (traceMatch?.[1]) {
          process.stdout.write(traceMatch[1])
          process.exit(0)
        }
      }
    }

    process.exit(1)
  " "$file" "$message"
}

wait_for_loki_trace_id() {
  local request_id="$1"
  local message="$2"
  local output_file="$3"

  for _ in $(seq 1 30); do
    query_loki_for_request_id "$request_id" "$output_file"

    if trace_id="$(extract_trace_id_from_loki "$output_file" "$message" 2>/dev/null)"; then
      printf '%s' "$trace_id"
      return 0
    fi

    sleep 2
  done

  return 1
}

wait_for_tempo_trace() {
  local trace_id="$1"
  local output_file="$2"

  for _ in $(seq 1 30); do
    local status
    status="$(curl -sS -o "$output_file" -w '%{http_code}' "$TEMPO_URL/api/traces/$trace_id" || true)"

    if [[ "$status" == "200" ]] && node -e "
      const fs = require('fs')
      const payload = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'))

      function hasSpans(node, depth = 0) {
        if (!node || depth > 8) return false
        if (Array.isArray(node)) return node.some((item) => hasSpans(item, depth + 1))
        if (typeof node !== 'object') return false
        if (Array.isArray(node.spans) && node.spans.length > 0) return true
        return Object.values(node).some((value) => hasSpans(value, depth + 1))
      }

      if (!hasSpans(payload)) process.exit(1)
    " "$output_file"; then
      return 0
    fi

    sleep 2
  done

  return 1
}

require_cmd curl
require_cmd node
require_cmd docker

log "Starting application + monitoring stack"
compose up -d --build

log "Waiting for dependencies to become ready"
wait_for_http "app" "$BASE_URL"
wait_for_http "loki" "$LOKI_URL/ready"
wait_for_http "tempo" "$TEMPO_URL/ready"
wait_for_http "grafana" "http://localhost:${GRAFANA_PORT:-3005}/api/health"

log "Validating Grafana datasources"
query_grafana_datasources "$TMP_DIR/grafana_datasources.json"
assert_grafana_datasource "$TMP_DIR/grafana_datasources.json" "Prometheus"
assert_grafana_datasource "$TMP_DIR/grafana_datasources.json" "Loki"
assert_grafana_datasource "$TMP_DIR/grafana_datasources.json" "Tempo"

REQUEST_ID_FALLBACK="${REQUEST_PREFIX}-fallback"
REQUEST_ID_REFUND="${REQUEST_PREFIX}-refund"
REQUEST_ID_NO_ACTIVE="${REQUEST_PREFIX}-no-active"

log "Logging in as seeded admin"
LOGIN_STATUS="$(request POST "$BASE_URL/login" "$TMP_DIR/login.json" \
  "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  'Content-Type: application/json' \
  "X-Request-Id: ${REQUEST_PREFIX}-login")"
assert_status "$LOGIN_STATUS" 200 "login"
TOKEN="$(json_value "$TMP_DIR/login.json" 'data.token')"

log "Creating product for observability scenarios"
PRODUCT_STATUS="$(request POST "$BASE_URL/products" "$TMP_DIR/product.json" \
  "{\"name\":\"Observability Product ${REQUEST_PREFIX}\",\"amount\":2099}" \
  'Content-Type: application/json' \
  "Authorization: Bearer $TOKEN" \
  "X-Request-Id: ${REQUEST_PREFIX}-product")"
assert_status "$PRODUCT_STATUS" 201 "create product"
PRODUCT_ID="$(json_value "$TMP_DIR/product.json" 'data.id')"

log "Forcing gateway1 to fail so fallback is exercised"
compose exec -T mysql mysql -uroot -proot betalent -e \
  "UPDATE gateways SET credentials = JSON_SET(credentials, '$.token', 'INVALID_OBS_SMOKE_TOKEN') WHERE name = 'gateway1';"

log "Running fallback purchase (gateway1 fail -> gateway2 success)"
PURCHASE_STATUS="$(request POST "$BASE_URL/purchases" "$TMP_DIR/purchase_fallback.json" \
  "{\"client\":{\"name\":\"Obs Buyer\",\"email\":\"${REQUEST_PREFIX}@example.com\"},\"products\":[{\"id\":$PRODUCT_ID,\"quantity\":1}],\"card\":{\"number\":\"4111111111111111\",\"cvv\":\"123\",\"holderName\":\"OBS BUYER\",\"expirationDate\":\"12/2030\"}}" \
  'Content-Type: application/json' \
  "X-Request-Id: ${REQUEST_ID_FALLBACK}")"
assert_status "$PURCHASE_STATUS" 201 "fallback purchase"
FALLBACK_TRANSACTION_ID="$(json_value "$TMP_DIR/purchase_fallback.json" 'data.transaction.id')"
FALLBACK_GATEWAY="$(json_value "$TMP_DIR/purchase_fallback.json" 'data.gateway')"
[[ "$FALLBACK_GATEWAY" == "gateway2" ]] || fail "fallback purchase should use gateway2, got $FALLBACK_GATEWAY"

log "Refunding fallback transaction"
REFUND_STATUS="$(request POST "$BASE_URL/transactions/$FALLBACK_TRANSACTION_ID/refund" "$TMP_DIR/refund.json" '' \
  "Authorization: Bearer $TOKEN" \
  "X-Request-Id: ${REQUEST_ID_REFUND}")"
assert_status "$REFUND_STATUS" 200 "refund"

log "Disabling all gateways and validating controlled failure"
compose exec -T mysql mysql -uroot -proot betalent -e \
  "UPDATE gateways SET is_active = 0;"

NO_ACTIVE_STATUS="$(request POST "$BASE_URL/purchases" "$TMP_DIR/purchase_no_active.json" \
  "{\"client\":{\"name\":\"No Active Buyer\",\"email\":\"${REQUEST_PREFIX}-no-active@example.com\"},\"products\":[{\"id\":$PRODUCT_ID,\"quantity\":1}],\"card\":{\"number\":\"4111111111111111\",\"cvv\":\"123\",\"holderName\":\"NO ACTIVE\",\"expirationDate\":\"12/2030\"}}" \
  'Content-Type: application/json' \
  "X-Request-Id: ${REQUEST_ID_NO_ACTIVE}")"
assert_status "$NO_ACTIVE_STATUS" 503 "purchase with no active gateways"

log "Validating logs and traces for fallback request"
FALLBACK_TRACE_ID="$(wait_for_loki_trace_id "$REQUEST_ID_FALLBACK" 'Gateway charge failed, trying next' "$TMP_DIR/loki_fallback.json")" \
  || fail "fallback request was not indexed in Loki with trace_id"
wait_for_tempo_trace "$FALLBACK_TRACE_ID" "$TMP_DIR/tempo_fallback.json" \
  || fail "fallback trace $FALLBACK_TRACE_ID not found in Tempo"

log "Validating logs and traces for refund request"
REFUND_TRACE_ID="$(wait_for_loki_trace_id "$REQUEST_ID_REFUND" 'Refund completed' "$TMP_DIR/loki_refund.json")" \
  || fail "refund request was not indexed in Loki with trace_id"
wait_for_tempo_trace "$REFUND_TRACE_ID" "$TMP_DIR/tempo_refund.json" \
  || fail "refund trace $REFUND_TRACE_ID not found in Tempo"

log "Validating logs and traces for no-active request"
NO_ACTIVE_TRACE_ID="$(wait_for_loki_trace_id "$REQUEST_ID_NO_ACTIVE" 'No active gateways available' "$TMP_DIR/loki_no_active.json")" \
  || fail "no-active request was not indexed in Loki with trace_id"
wait_for_tempo_trace "$NO_ACTIVE_TRACE_ID" "$TMP_DIR/tempo_no_active.json" \
  || fail "no-active trace $NO_ACTIVE_TRACE_ID not found in Tempo"

log "Observability smoke completed successfully"

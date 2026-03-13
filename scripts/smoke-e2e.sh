#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_URL="${BASE_URL:-http://localhost:3333}"
ADMIN_EMAIL="${SMOKE_ADMIN_EMAIL:-admin@betalent.tech}"
ADMIN_PASSWORD="${SMOKE_ADMIN_PASSWORD:-admin123}"
REQUEST_ID_PREFIX="${SMOKE_REQUEST_ID_PREFIX:-smoke-$(date +%s)}"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

log() {
  printf '\n[smoke] %s\n' "$1"
}

fail() {
  printf '\n[smoke][error] %s\n' "$1" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 not found"
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

assert_metric_positive() {
  local file="$1"
  local metric_name="$2"
  local label="$3"

  node -e "
    const fs = require('fs')
    const content = fs.readFileSync(process.argv[1], 'utf8')
    const metric = process.argv[2]
    const match = content
      .split('\n')
      .find((line) => line.startsWith(metric + ' ') || line.startsWith(metric + '{'))
    if (!match) process.exit(1)
    const value = Number(match.trim().split(/\s+/).pop())
    if (!Number.isFinite(value) || value < 1) process.exit(1)
  " "$file" "$metric_name" || fail "$label metric not found with value >= 1"
}

require_cmd curl
require_cmd node

PRODUCT_NAME="Smoke Product ${REQUEST_ID_PREFIX}"
REQUEST_ID="${REQUEST_ID_PREFIX}-flow"

log "Logging in as seeded admin"
LOGIN_STATUS="$(request POST "$BASE_URL/login" "$TMP_DIR/login.json" \
  "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  'Content-Type: application/json' \
  "X-Request-Id: ${REQUEST_ID}-login")"
assert_status "$LOGIN_STATUS" 200 "login"
TOKEN="$(json_value "$TMP_DIR/login.json" 'data.token')"

log "Creating smoke product"
PRODUCT_STATUS="$(request POST "$BASE_URL/products" "$TMP_DIR/product.json" \
  "{\"name\":\"$PRODUCT_NAME\",\"amount\":1999}" \
  'Content-Type: application/json' \
  "Authorization: Bearer $TOKEN" \
  "X-Request-Id: ${REQUEST_ID}-product")"
assert_status "$PRODUCT_STATUS" 201 "create product"
PRODUCT_ID="$(json_value "$TMP_DIR/product.json" 'data.id')"

log "Creating public purchase"
PURCHASE_STATUS="$(request POST "$BASE_URL/purchases" "$TMP_DIR/purchase.json" \
  "{\"client\":{\"name\":\"Smoke Buyer\",\"email\":\"${REQUEST_ID_PREFIX}@example.com\"},\"products\":[{\"id\":$PRODUCT_ID,\"quantity\":1}],\"card\":{\"number\":\"4111111111111111\",\"cvv\":\"123\",\"holderName\":\"SMOKE BUYER\",\"expirationDate\":\"12/2030\"}}" \
  'Content-Type: application/json' \
  "X-Request-Id: ${REQUEST_ID}")"
assert_status "$PURCHASE_STATUS" 201 "purchase"
TRANSACTION_ID="$(json_value "$TMP_DIR/purchase.json" 'data.transaction.id')"
PURCHASE_GATEWAY="$(json_value "$TMP_DIR/purchase.json" 'data.gateway')"

log "Reading transaction detail"
TRANSACTION_STATUS="$(request GET "$BASE_URL/transactions/$TRANSACTION_ID" "$TMP_DIR/transaction.json" '' \
  "Authorization: Bearer $TOKEN" \
  "X-Request-Id: ${REQUEST_ID}-transaction")"
assert_status "$TRANSACTION_STATUS" 200 "transaction detail"
TRANSACTION_STATUS_VALUE="$(json_value "$TMP_DIR/transaction.json" 'data.status')"
[[ "$TRANSACTION_STATUS_VALUE" == "approved" ]] || fail "transaction status is $TRANSACTION_STATUS_VALUE, expected approved"

log "Refunding transaction"
REFUND_STATUS="$(request POST "$BASE_URL/transactions/$TRANSACTION_ID/refund" "$TMP_DIR/refund.json" '' \
  "Authorization: Bearer $TOKEN" \
  "X-Request-Id: ${REQUEST_ID}-refund")"
assert_status "$REFUND_STATUS" 200 "refund"
REFUND_VALUE="$(json_value "$TMP_DIR/refund.json" 'data.transaction.status')"
[[ "$REFUND_VALUE" == "refunded" ]] || fail "refund status is $REFUND_VALUE, expected refunded"

log "Checking metrics"
METRICS_STATUS="$(request GET "$BASE_URL/metrics" "$TMP_DIR/metrics.txt" '' \
  "X-Request-Id: ${REQUEST_ID}-metrics")"
assert_status "$METRICS_STATUS" 200 "metrics"
assert_metric_positive "$TMP_DIR/metrics.txt" 'app_purchases_total{status="approved"}' "purchase success"
assert_metric_positive "$TMP_DIR/metrics.txt" 'app_refunds_total{status="success"}' "refund success"
assert_metric_positive "$TMP_DIR/metrics.txt" "app_gateway_charge_success_total{gateway=\"${PURCHASE_GATEWAY}\"}" "gateway charge success"
assert_metric_positive "$TMP_DIR/metrics.txt" "app_gateway_refund_success_total{gateway=\"${PURCHASE_GATEWAY}\"}" "gateway refund success"

log "Smoke completed successfully"

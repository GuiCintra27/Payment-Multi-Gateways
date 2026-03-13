type MetricLabels = Record<string, string>

interface MetricDefinition {
  help: string
  type: 'counter'
}

export class MetricsService {
  private definitions = new Map<string, MetricDefinition>()
  private counters = new Map<string, number>()

  constructor() {
    this.register('app_purchases_total', 'Total purchases processed by final transaction status')
    this.register(
      'app_purchase_amount_cents_total',
      'Total purchase volume in cents by final transaction status and gateway'
    )
    this.register('app_refunds_total', 'Total refunds successfully completed')
    this.register(
      'app_refund_amount_cents_total',
      'Total refunded amount in cents by gateway after successful refunds'
    )
    this.register('app_gateway_charge_attempts_total', 'Total gateway charge attempts')
    this.register('app_gateway_charge_success_total', 'Total successful gateway charges')
    this.register('app_gateway_charge_failures_total', 'Total failed gateway charges')
    this.register('app_gateway_refund_attempts_total', 'Total gateway refund attempts')
    this.register('app_gateway_refund_success_total', 'Total successful gateway refunds')
    this.register('app_gateway_refund_failures_total', 'Total failed gateway refunds')
    this.register(
      'app_gateway_fallback_activated_total',
      'Total purchase attempts that required at least one fallback to another gateway'
    )
    this.register(
      'app_gateway_fallback_recovered_total',
      'Total purchase attempts recovered successfully after a fallback'
    )
    this.register('app_gateway_no_active_total', 'Total purchase attempts with no active gateways')
    this.register(
      'app_gateway_all_failed_total',
      'Total purchase attempts where all gateways failed'
    )
  }

  private register(name: string, help: string) {
    this.definitions.set(name, { help, type: 'counter' })
  }

  private formatLabels(labels: MetricLabels = {}) {
    const entries = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b))
    if (entries.length === 0) {
      return ''
    }

    const content = entries.map(([key, value]) => `${key}="${value}"`).join(',')
    return `{${content}}`
  }

  private sampleKey(name: string, labels: MetricLabels = {}) {
    return `${name}${this.formatLabels(labels)}`
  }

  increment(name: string, labels: MetricLabels = {}, value = 1) {
    const key = this.sampleKey(name, labels)
    this.counters.set(key, (this.counters.get(key) ?? 0) + value)
  }

  recordPurchase(status: string) {
    this.increment('app_purchases_total', { status })
  }

  recordPurchaseAmount(amountCents: number, status: string, gateway: string) {
    this.increment('app_purchase_amount_cents_total', { gateway, status }, amountCents)
  }

  recordRefundSuccess() {
    this.increment('app_refunds_total', { status: 'success' })
  }

  recordRefundAmount(amountCents: number, gateway: string) {
    this.increment('app_refund_amount_cents_total', { gateway }, amountCents)
  }

  recordGatewayChargeAttempt(gateway: string) {
    this.increment('app_gateway_charge_attempts_total', { gateway })
  }

  recordGatewayChargeSuccess(gateway: string) {
    this.increment('app_gateway_charge_success_total', { gateway })
  }

  recordGatewayChargeFailure(gateway: string) {
    this.increment('app_gateway_charge_failures_total', { gateway })
  }

  recordGatewayRefundAttempt(gateway: string) {
    this.increment('app_gateway_refund_attempts_total', { gateway })
  }

  recordGatewayRefundSuccess(gateway: string) {
    this.increment('app_gateway_refund_success_total', { gateway })
  }

  recordGatewayRefundFailure(gateway: string) {
    this.increment('app_gateway_refund_failures_total', { gateway })
  }

  recordFallbackActivated() {
    this.increment('app_gateway_fallback_activated_total')
  }

  recordFallbackRecovered() {
    this.increment('app_gateway_fallback_recovered_total')
  }

  recordNoActiveGateways() {
    this.increment('app_gateway_no_active_total')
  }

  recordAllGatewaysFailed() {
    this.increment('app_gateway_all_failed_total')
  }

  renderPrometheus() {
    const lines: string[] = []

    for (const [name, definition] of [...this.definitions.entries()].sort(([a], [b]) =>
      a.localeCompare(b)
    )) {
      lines.push(`# HELP ${name} ${definition.help}`)
      lines.push(`# TYPE ${name} ${definition.type}`)

      const samples = [...this.counters.entries()]
        .filter(([key]) => key === name || key.startsWith(`${name}{`))
        .sort(([a], [b]) => a.localeCompare(b))

      for (const [sampleKey, value] of samples) {
        lines.push(`${sampleKey} ${value}`)
      }
    }

    return `${lines.join('\n')}\n`
  }

  reset() {
    this.counters.clear()
  }
}

const metrics = new MetricsService()

export default metrics

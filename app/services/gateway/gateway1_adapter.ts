import type {
  GatewayStrategy,
  ChargeInput,
  ChargeOutput,
  RefundOutput,
  ExternalTransaction,
} from './gateway_interface.js'
import logger from '@adonisjs/core/services/logger'

interface Gateway1Credentials {
  url: string
  email: string
  token: string
}

/**
 * Gateway 1 Adapter
 *
 * Auth: POST /login with email + token → Bearer token
 * Schema: English field names (amount, name, email, cardNumber, cvv)
 * Endpoints:
 *   - POST /transactions (create)
 *   - POST /transactions/:id/charge_back (refund)
 *   - GET /transactions (list)
 */
export default class Gateway1Adapter implements GatewayStrategy {
  readonly name = 'gateway1'
  private bearerToken: string | null = null
  private credentials: Gateway1Credentials

  constructor(credentials: Gateway1Credentials) {
    this.credentials = credentials
  }

  private async authenticate(): Promise<void> {
    if (this.bearerToken) return

    const response = await fetch(`${this.credentials.url}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: this.credentials.email,
        token: this.credentials.token,
      }),
    })

    if (!response.ok) {
      throw new Error(`Gateway1 auth failed: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as { token?: string }
    this.bearerToken = data.token ?? null

    if (!this.bearerToken) {
      throw new Error('Gateway1 auth returned no token')
    }

    logger.debug({ gateway: this.name }, 'Gateway1 authenticated successfully')
  }

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.bearerToken}`,
    }
  }

  async createTransaction(data: ChargeInput): Promise<ChargeOutput> {
    await this.authenticate()

    const response = await fetch(`${this.credentials.url}/transactions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        amount: data.amount,
        name: data.name,
        email: data.email,
        cardNumber: data.cardNumber,
        cvv: data.cvv,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      logger.warn({ gateway: this.name, status: response.status, body: errorBody }, 'Charge failed')
      throw new Error(`Gateway1 charge failed: ${response.status}`)
    }

    const result = (await response.json()) as { id: string; status: string }

    return {
      externalId: String(result.id),
      status: result.status === 'approved' ? 'approved' : 'rejected',
    }
  }

  async refundTransaction(externalId: string): Promise<RefundOutput> {
    await this.authenticate()

    const response = await fetch(`${this.credentials.url}/transactions/${externalId}/charge_back`, {
      method: 'POST',
      headers: this.headers,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      logger.warn(
        { gateway: this.name, externalId, status: response.status, body: errorBody },
        'Refund failed'
      )
      throw new Error(`Gateway1 refund failed: ${response.status}`)
    }

    return { success: true }
  }

  async listTransactions(): Promise<ExternalTransaction[]> {
    await this.authenticate()

    const response = await fetch(`${this.credentials.url}/transactions`, {
      method: 'GET',
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Gateway1 list failed: ${response.status}`)
    }

    return (await response.json()) as ExternalTransaction[]
  }
}

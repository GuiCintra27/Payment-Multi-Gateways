import type {
  GatewayStrategy,
  ChargeInput,
  ChargeOutput,
  RefundOutput,
  ExternalTransaction,
} from './gateway_interface.js'
import logger from '@adonisjs/core/services/logger'

interface Gateway2Credentials {
  url: string
  authToken: string
  authSecret: string
}

/**
 * Gateway 2 Adapter
 *
 * Auth: Fixed headers (Gateway-Auth-Token + Gateway-Auth-Secret)
 * Schema: Portuguese field names (valor, nome, email, numeroCartao, cvv)
 * Endpoints:
 *   - POST /transacoes (create)
 *   - POST /transacoes/reembolso (refund, body: { id })
 *   - GET /transacoes (list)
 */
export default class Gateway2Adapter implements GatewayStrategy {
  readonly name = 'gateway2'
  private credentials: Gateway2Credentials

  constructor(credentials: Gateway2Credentials) {
    this.credentials = credentials
  }

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Gateway-Auth-Token': this.credentials.authToken,
      'Gateway-Auth-Secret': this.credentials.authSecret,
    }
  }

  async createTransaction(data: ChargeInput): Promise<ChargeOutput> {
    const response = await fetch(`${this.credentials.url}/transacoes`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        valor: data.amount,
        nome: data.name,
        email: data.email,
        numeroCartao: data.cardNumber,
        cvv: data.cvv,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      logger.warn({ gateway: this.name, status: response.status, body: errorBody }, 'Charge failed')
      throw new Error(`Gateway2 charge failed: ${response.status}`)
    }

    const result = (await response.json()) as { id: string; statusTransacao: string }

    return {
      externalId: String(result.id),
      status: result.statusTransacao === 'aprovada' ? 'approved' : 'rejected',
    }
  }

  async refundTransaction(externalId: string): Promise<RefundOutput> {
    const response = await fetch(`${this.credentials.url}/transacoes/reembolso`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ id: externalId }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      logger.warn(
        { gateway: this.name, externalId, status: response.status, body: errorBody },
        'Refund failed'
      )
      throw new Error(`Gateway2 refund failed: ${response.status}`)
    }

    return { success: true }
  }

  async listTransactions(): Promise<ExternalTransaction[]> {
    const response = await fetch(`${this.credentials.url}/transacoes`, {
      method: 'GET',
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Gateway2 list failed: ${response.status}`)
    }

    return (await response.json()) as ExternalTransaction[]
  }
}

import type {
  GatewayStrategy,
  ChargeInput,
  ChargeOutput,
  RefundOutput,
  ExternalTransaction,
} from './gateway_interface.js'
import { observabilityLogContext } from '#services/observability_log_context'
import logger from '@adonisjs/core/services/logger'

interface Gateway2Credentials {
  url: string
  authToken: string
  authSecret: string
}

interface Gateway2ErrorResponse {
  statusCode?: number
  erros?: Array<{ message?: string }>
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

  private createHeaders(requestId?: string): Record<string, string> {
    return requestId ? { ...this.headers, 'X-Request-Id': requestId } : this.headers
  }

  async createTransaction(data: ChargeInput): Promise<ChargeOutput> {
    const response = await fetch(`${this.credentials.url}/transacoes`, {
      method: 'POST',
      headers: this.createHeaders(data.requestId),
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
      logger.warn(
        observabilityLogContext(
          {
            requestId: data.requestId,
            route: data.route ?? 'POST /purchases',
            gateway: this.name,
            status: 'error',
          },
          {
            httpStatus: response.status,
            errorSnippet: errorBody.slice(0, 200),
          }
        ),
        'Charge failed'
      )
      throw new Error(`Gateway2 charge failed: ${response.status}`)
    }

    const result = (await response.json()) as
      | { id?: string; statusTransacao?: string }
      | Gateway2ErrorResponse

    if (
      'statusCode' in result &&
      typeof result.statusCode === 'number' &&
      result.statusCode >= 400
    ) {
      const message = result.erros?.[0]?.message ?? `Gateway2 charge failed: ${result.statusCode}`
      throw new Error(message)
    }

    if (!('id' in result) || !result.id) {
      throw new Error('Gateway2 charge returned no transaction id')
    }

    return {
      externalId: String(result.id),
      status: result.statusTransacao === 'rejeitada' ? 'rejected' : 'approved',
    }
  }

  async refundTransaction(externalId: string, requestId?: string): Promise<RefundOutput> {
    const response = await fetch(`${this.credentials.url}/transacoes/reembolso`, {
      method: 'POST',
      headers: this.createHeaders(requestId),
      body: JSON.stringify({ id: externalId }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      logger.warn(
        observabilityLogContext(
          {
            requestId,
            route: 'POST /transactions/:id/refund',
            gateway: this.name,
            status: 'error',
          },
          {
            externalId,
            httpStatus: response.status,
            errorSnippet: errorBody.slice(0, 200),
          }
        ),
        'Refund failed'
      )
      throw new Error(`Gateway2 refund failed: ${response.status}`)
    }

    return { success: true }
  }

  async listTransactions(): Promise<ExternalTransaction[]> {
    const response = await fetch(`${this.credentials.url}/transacoes`, {
      method: 'GET',
      headers: this.createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Gateway2 list failed: ${response.status}`)
    }

    const result = (await response.json()) as { data?: ExternalTransaction[] }
    return result.data ?? []
  }
}

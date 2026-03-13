/**
 * Gateway Strategy Interface
 *
 * Defines the contract for all gateway adapters.
 * Each gateway has its own auth mechanism and request/response schema.
 */

export interface ChargeInput {
  amount: number // in centavos
  name: string
  email: string
  cardNumber: string
  cvv: string
  requestId?: string
}

export interface ChargeOutput {
  externalId: string
  status: 'approved' | 'rejected' | 'error'
}

export interface RefundOutput {
  success: boolean
}

export interface ExternalTransaction {
  id: string
  amount: number
  status: string
  [key: string]: unknown
}

export interface GatewayStrategy {
  readonly name: string

  /**
   * Create a transaction (charge the card)
   */
  createTransaction(data: ChargeInput): Promise<ChargeOutput>

  /**
   * Refund a previously approved transaction
   */
  refundTransaction(externalId: string, requestId?: string): Promise<RefundOutput>

  /**
   * List all transactions from the gateway
   */
  listTransactions(): Promise<ExternalTransaction[]>
}

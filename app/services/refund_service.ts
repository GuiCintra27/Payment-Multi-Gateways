import Transaction from '#models/transaction'
import GatewayService from '#services/gateway/gateway_service'
import logger from '@adonisjs/core/services/logger'

export default class RefundService {
  private gatewayService = new GatewayService()

  async execute(transactionId: number) {
    // 1. Find transaction with gateway
    const transaction = await Transaction.query()
      .where('id', transactionId)
      .preload('gateway')
      .preload('client')
      .first()

    if (!transaction) {
      throw new Error('Transaction not found')
    }

    // 2. Validate status
    if (transaction.status === 'refunded') {
      throw new Error('Transaction already refunded')
    }

    if (transaction.status !== 'approved') {
      throw new Error(`Cannot refund transaction with status: ${transaction.status}`)
    }

    if (!transaction.externalId) {
      throw new Error('Transaction has no external ID — cannot refund')
    }

    // 3. Call refund on the original gateway
    await this.gatewayService.refund(transaction.gateway, transaction.externalId)

    // 4. Update status
    transaction.status = 'refunded'
    await transaction.save()

    logger.info(
      {
        transactionId: transaction.id,
        gateway: transaction.gateway.name,
        externalId: transaction.externalId,
      },
      'Refund completed'
    )

    return {
      transaction: {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        refundedAt: transaction.updatedAt,
      },
      client: {
        id: transaction.client.id,
        name: transaction.client.name,
        email: transaction.client.email,
      },
      gateway: transaction.gateway.name,
    }
  }
}

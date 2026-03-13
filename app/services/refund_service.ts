import Transaction from '#models/transaction'
import GatewayService from '#services/gateway/gateway_service'
import { observabilityLogContext } from '#services/observability_log_context'
import { withSpan } from '#services/trace_service'
import metrics from '#services/metrics_service'
import logger from '@adonisjs/core/services/logger'

export default class RefundService {
  private gatewayService = new GatewayService()

  async execute(
    transactionId: number,
    requestId?: string,
    route = 'POST /transactions/:id/refund'
  ) {
    return withSpan(
      'refund.execute',
      {
        attributes: {
          'app.request_id': requestId ?? '',
          'app.route': route,
          'app.transaction_id': transactionId,
        },
      },
      async (span) => {
        // 1. Find transaction with gateway
        const transaction = await Transaction.query()
          .where('id', transactionId)
          .preload('gateway')
          .preload('client')
          .first()

        if (!transaction) {
          span.setAttribute('app.validation_error', 'transaction_not_found')
          throw new Error('Transaction not found')
        }

        // 2. Validate status
        if (transaction.status === 'refunded') {
          span.setAttribute('app.validation_error', 'already_refunded')
          throw new Error('Transaction already refunded')
        }

        if (transaction.status !== 'approved') {
          span.setAttribute('app.validation_error', 'invalid_status')
          throw new Error(`Cannot refund transaction with status: ${transaction.status}`)
        }

        if (!transaction.externalId) {
          span.setAttribute('app.validation_error', 'missing_external_id')
          throw new Error('Transaction has no external ID — cannot refund')
        }

        span.setAttribute('app.gateway', transaction.gateway.name)
        span.setAttribute('app.external_id', transaction.externalId)

        // 3. Call refund on the original gateway
        await this.gatewayService.refund(
          transaction.gateway,
          transaction.externalId,
          requestId,
          route
        )

        // 4. Update status
        transaction.status = 'refunded'
        await transaction.save()
        metrics.recordRefundSuccess()
        metrics.recordRefundAmount(transaction.amount, transaction.gateway.name)

        logger.info(
          observabilityLogContext(
            {
              requestId,
              route,
              gateway: transaction.gateway.name,
              transactionId: transaction.id,
              status: transaction.status,
            },
            {
              externalId: transaction.externalId,
              amount: transaction.amount,
            }
          ),
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
    )
  }
}

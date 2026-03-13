import RefundService from '#services/refund_service'
import { observabilityLogContext } from '#services/observability_log_context'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

export default class RefundsController {
  /**
   * POST /transactions/:id/refund — refund a transaction (ADMIN, FINANCE)
   */
  async store({ params, request, response }: HttpContext) {
    const refundService = new RefundService()
    const requestId = request.header('x-request-id')
    const route = 'POST /transactions/:id/refund'

    try {
      const result = await refundService.execute(params.id, requestId, route)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Refund failed'

      if (message.includes('not found')) {
        return response.notFound({ message })
      }

      if (message.includes('already refunded') || message.includes('Cannot refund')) {
        return response.unprocessableEntity({ message })
      }

      logger.error(
        observabilityLogContext(
          {
            requestId,
            route,
            transactionId: params.id,
            status: 'error',
          },
          { error: message }
        ),
        'Unexpected refund failure'
      )

      return response.internalServerError({
        message: 'Unexpected error while processing refund.',
      })
    }
  }
}

import RefundService from '#services/refund_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class RefundsController {
  /**
   * POST /transactions/:id/refund — refund a transaction (ADMIN, FINANCE)
   */
  async store({ params, response }: HttpContext) {
    const refundService = new RefundService()

    try {
      const result = await refundService.execute(params.id)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Refund failed'

      if (message.includes('not found')) {
        return response.notFound({ message })
      }

      if (message.includes('already refunded') || message.includes('Cannot refund')) {
        return response.unprocessableEntity({ message })
      }

      return response.internalServerError({ message })
    }
  }
}

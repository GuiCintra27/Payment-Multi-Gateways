import PurchaseService from '#services/purchase_service'
import { observabilityLogContext } from '#services/observability_log_context'
import { purchaseValidator } from '#validators/purchase'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

export default class PurchasesController {
  /**
   * POST /purchases — public endpoint to make a purchase
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(purchaseValidator)
    const requestId = request.header('x-request-id')
    const route = 'POST /purchases'

    const purchaseService = new PurchaseService()

    try {
      const result = await purchaseService.execute({
        client: data.client,
        products: data.products,
        card: data.card,
        requestId,
        route,
      })

      return response.created(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Purchase failed'

      if (message.includes('Products not found')) {
        return response.unprocessableEntity({ message })
      }

      if (message.includes('All gateways failed')) {
        return response.serviceUnavailable({
          message: 'Payment processing failed. Please try again later.',
        })
      }

      if (message.includes('No active gateways available')) {
        return response.serviceUnavailable({
          message: 'Payment processing is temporarily unavailable.',
        })
      }

      logger.error(
        observabilityLogContext(
          {
            requestId,
            route,
            status: 'error',
          },
          { error: message }
        ),
        'Unexpected purchase failure'
      )

      return response.internalServerError({
        message: 'Unexpected error while processing purchase.',
      })
    }
  }
}

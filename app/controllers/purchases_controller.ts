import PurchaseService from '#services/purchase_service'
import { purchaseValidator } from '#validators/purchase'
import type { HttpContext } from '@adonisjs/core/http'

export default class PurchasesController {
  /**
   * POST /purchases — public endpoint to make a purchase
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(purchaseValidator)

    const purchaseService = new PurchaseService()

    try {
      const result = await purchaseService.execute({
        client: data.client,
        products: data.products,
        card: data.card,
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

      return response.internalServerError({ message })
    }
  }
}

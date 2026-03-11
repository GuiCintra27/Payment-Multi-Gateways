import Transaction from '#models/transaction'
import type { HttpContext } from '@adonisjs/core/http'

export default class TransactionsController {
  /**
   * GET /transactions — list all transactions (with client and gateway)
   */
  async index({}: HttpContext) {
    return Transaction.query().preload('client').preload('gateway').orderBy('created_at', 'desc')
  }

  /**
   * GET /transactions/:id — show transaction detail with products
   */
  async show({ params, response }: HttpContext) {
    const transaction = await Transaction.query()
      .where('id', params.id)
      .preload('client')
      .preload('gateway')
      .preload('products')
      .first()

    if (!transaction) {
      return response.notFound({ message: 'Transaction not found' })
    }

    return transaction
  }
}

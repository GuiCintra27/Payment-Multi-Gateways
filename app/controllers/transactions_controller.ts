import Transaction from '#models/transaction'
import TransactionTransformer from '#transformers/transaction_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class TransactionsController {
  /**
   * GET /transactions — list all transactions (with client and gateway)
   */
  async index({}: HttpContext) {
    const transactions = await Transaction.query()
      .preload('client')
      .preload('gateway')
      .orderBy('created_at', 'desc')

    return transactions.map((transaction) => TransactionTransformer.transform(transaction))
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

    return TransactionTransformer.transform(transaction, { includeProducts: true })
  }
}

import Client from '#models/client'
import TransactionTransformer from '#transformers/transaction_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClientsController {
  /**
   * GET /clients — list all clients with their transactions
   */
  async index({}: HttpContext) {
    const clients = await Client.query().orderBy('id', 'asc')

    return clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    }))
  }

  /**
   * GET /clients/:id — show a single client with transactions
   */
  async show({ params, response }: HttpContext) {
    const client = await Client.query()
      .where('id', params.id)
      .preload('transactions', (query) => {
        query.orderBy('created_at', 'desc')
      })
      .first()

    if (!client) {
      return response.notFound({ message: 'Client not found' })
    }

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      transactions: client.transactions.map((transaction) =>
        TransactionTransformer.summary(transaction)
      ),
    }
  }
}

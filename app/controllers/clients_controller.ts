import Client from '#models/client'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClientsController {
  /**
   * GET /clients — list all clients with their transactions
   */
  async index({}: HttpContext) {
    return Client.query().orderBy('id', 'asc')
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

    return client
  }
}

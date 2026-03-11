import Gateway from '#models/gateway'
import { toggleGatewayValidator, updateGatewayPriorityValidator } from '#validators/gateway'
import type { HttpContext } from '@adonisjs/core/http'

export default class GatewaysController {
  /**
   * GET /gateways — list all gateways
   */
  async index({}: HttpContext) {
    return Gateway.query().orderBy('priority', 'asc')
  }

  /**
   * PATCH /gateways/:id/toggle — activate/deactivate a gateway
   */
  async toggle({ params, request, response }: HttpContext) {
    const gateway = await Gateway.find(params.id)
    if (!gateway) {
      return response.notFound({ message: 'Gateway not found' })
    }

    const { isActive } = await request.validateUsing(toggleGatewayValidator)
    gateway.isActive = isActive
    await gateway.save()

    return gateway
  }

  /**
   * PATCH /gateways/:id/priority — change gateway priority
   */
  async priority({ params, request, response }: HttpContext) {
    const gateway = await Gateway.find(params.id)
    if (!gateway) {
      return response.notFound({ message: 'Gateway not found' })
    }

    const { priority } = await request.validateUsing(updateGatewayPriorityValidator)
    gateway.priority = priority
    await gateway.save()

    return gateway
  }
}

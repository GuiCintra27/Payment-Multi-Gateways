import Gateway from '#models/gateway'
import GatewayTransformer from '#transformers/gateway_transformer'
import { toggleGatewayValidator, updateGatewayPriorityValidator } from '#validators/gateway'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class GatewaysController {
  /**
   * GET /gateways — list all gateways
   */
  async index({}: HttpContext) {
    const gateways = await Gateway.query().orderBy('priority', 'asc')
    return gateways.map((gateway) => GatewayTransformer.transform(gateway))
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

    return GatewayTransformer.transform(gateway)
  }

  /**
   * PATCH /gateways/:id/priority — change gateway priority
   */
  async priority({ params, request, response }: HttpContext) {
    const { priority } = await request.validateUsing(updateGatewayPriorityValidator)
    const gatewayId = Number(params.id)

    const reorderedGateway = await db.transaction(async (trx) => {
      const gateways = await Gateway.query({ client: trx }).orderBy('priority', 'asc')
      const gateway = gateways.find((item) => item.id === gatewayId)

      if (!gateway) {
        return null
      }

      const reorderedGateways = gateways.filter((item) => item.id !== gateway.id)
      const targetIndex = Math.min(Math.max(priority - 1, 0), reorderedGateways.length)

      reorderedGateways.splice(targetIndex, 0, gateway)

      for (const [index, item] of reorderedGateways.entries()) {
        item.useTransaction(trx)
        item.priority = index + 1
        await item.save()
      }

      return gateway
    })

    if (!reorderedGateway) {
      return response.notFound({ message: 'Gateway not found' })
    }

    const updatedGateway = await Gateway.findOrFail(gatewayId)
    return GatewayTransformer.transform(updatedGateway)
  }
}

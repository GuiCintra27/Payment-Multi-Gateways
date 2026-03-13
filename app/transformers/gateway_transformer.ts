import type Gateway from '#models/gateway'

export default class GatewayTransformer {
  static transform(gateway: Gateway) {
    return {
      id: gateway.id,
      name: gateway.name,
      isActive: gateway.isActive,
      priority: gateway.priority,
      createdAt: gateway.createdAt,
      updatedAt: gateway.updatedAt,
    }
  }
}

import type { GatewayStrategy } from './gateway_interface.js'
import Gateway1Adapter from './gateway1_adapter.js'
import Gateway2Adapter from './gateway2_adapter.js'
import type Gateway from '#models/gateway'

/**
 * GatewayFactory — creates the correct adapter based on gateway name.
 * Parses credentials from the gateway model.
 */
export default class GatewayFactory {
  static create(gateway: Gateway): GatewayStrategy {
    const credentials = gateway.credentials ? JSON.parse(gateway.credentials) : {}

    switch (gateway.name) {
      case 'gateway1':
        return new Gateway1Adapter({
          url: credentials.url,
          email: credentials.email,
          token: credentials.token,
        })

      case 'gateway2':
        return new Gateway2Adapter({
          url: credentials.url,
          authToken: credentials.authToken,
          authSecret: credentials.authSecret,
        })

      default:
        throw new Error(`Unknown gateway: ${gateway.name}`)
    }
  }
}

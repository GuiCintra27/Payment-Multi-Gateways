import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Gateway from '#models/gateway'
import env from '#start/env'

export default class GatewaySeeder extends BaseSeeder {
  async run() {
    await Gateway.updateOrCreateMany('name', [
      {
        name: 'gateway1',
        isActive: true,
        priority: 1,
        credentials: JSON.stringify({
          url: env.get('GATEWAY1_URL', 'http://localhost:3001'),
          email: env.get('GATEWAY1_EMAIL', ''),
          token: env.get('GATEWAY1_TOKEN', ''),
        }),
      },
      {
        name: 'gateway2',
        isActive: true,
        priority: 2,
        credentials: JSON.stringify({
          url: env.get('GATEWAY2_URL', 'http://localhost:3002'),
          authToken: env.get('GATEWAY2_AUTH_TOKEN', ''),
          authSecret: env.get('GATEWAY2_AUTH_SECRET', ''),
        }),
      },
    ])
  }
}

import { test } from '@japa/runner'
import GatewayFactory from '#services/gateway/gateway_factory'
import Gateway from '#models/gateway'

test.group('GatewayFactory', () => {
  test('creates Gateway1Adapter for gateway1', ({ assert }) => {
    const gateway = new Gateway()
    gateway.name = 'gateway1'
    gateway.credentials = JSON.stringify({
      url: 'http://localhost:3001',
      email: 'test@test.com',
      token: 'test-token',
    })

    const adapter = GatewayFactory.create(gateway)
    assert.equal(adapter.name, 'gateway1')
  })

  test('creates Gateway2Adapter for gateway2', ({ assert }) => {
    const gateway = new Gateway()
    gateway.name = 'gateway2'
    gateway.credentials = JSON.stringify({
      url: 'http://localhost:3002',
      authToken: 'test-token',
      authSecret: 'test-secret',
    })

    const adapter = GatewayFactory.create(gateway)
    assert.equal(adapter.name, 'gateway2')
  })

  test('throws error for unknown gateway', ({ assert }) => {
    const gateway = new Gateway()
    gateway.name = 'unknown'
    gateway.credentials = '{}'

    assert.throws(() => GatewayFactory.create(gateway), 'Unknown gateway: unknown')
  })
})

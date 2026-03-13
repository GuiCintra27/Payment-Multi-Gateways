import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Gateway from '#models/gateway'
import GatewayService from '#services/gateway/gateway_service'
import Gateway1Adapter from '#services/gateway/gateway1_adapter'
import Gateway2Adapter from '#services/gateway/gateway2_adapter'
import env from '#start/env'

const runRealGatewayTests = process.env.RUN_REAL_GATEWAY_TESTS === 'true'

test.group('Gateway Integration', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('gateway1 adapter treats created transactions as approved', async ({ assert }) => {
    if (!runRealGatewayTests) return

    const adapter = new Gateway1Adapter({
      url: env.get('GATEWAY1_URL'),
      email: env.get('GATEWAY1_EMAIL', ''),
      token: env.get('GATEWAY1_TOKEN', ''),
    })

    const result = await adapter.createTransaction({
      amount: 5000,
      name: 'Buyer',
      email: 'gateway1-approved@test.com',
      cardNumber: '4111111111111111',
      cvv: '123',
    })

    assert.isString(result.externalId)
    assert.isAbove(result.externalId.length, 0)
    assert.equal(result.status, 'approved')
  })

  test('gateway2 adapter throws when the mock returns embedded business error payload', async ({
    assert,
  }) => {
    if (!runRealGatewayTests) return

    const adapter = new Gateway2Adapter({
      url: env.get('GATEWAY2_URL'),
      authToken: env.get('GATEWAY2_AUTH_TOKEN', ''),
      authSecret: env.get('GATEWAY2_AUTH_SECRET', ''),
    })

    await assert.rejects(
      () =>
        adapter.createTransaction({
          amount: 5000,
          name: 'Buyer',
          email: 'gateway2-error@test.com',
          cardNumber: '4111111111111111',
          cvv: '200',
        }),
      /contate a central do seu cartão/
    )
  })

  test('gateway service falls back from gateway1 to gateway2 against real mocks', async ({
    assert,
  }) => {
    if (!runRealGatewayTests) return

    await Gateway.create({
      name: 'gateway1',
      isActive: true,
      priority: 1,
      credentials: JSON.stringify({
        url: env.get('GATEWAY1_URL'),
        email: env.get('GATEWAY1_EMAIL', ''),
        token: env.get('GATEWAY1_TOKEN', ''),
      }),
    })
    await Gateway.create({
      name: 'gateway2',
      isActive: true,
      priority: 2,
      credentials: JSON.stringify({
        url: env.get('GATEWAY2_URL'),
        authToken: env.get('GATEWAY2_AUTH_TOKEN', ''),
        authSecret: env.get('GATEWAY2_AUTH_SECRET', ''),
      }),
    })

    const service = new GatewayService()
    const result = await service.charge({
      amount: 5000,
      name: 'Buyer',
      email: 'gateway-fallback@test.com',
      cardNumber: '4111111111111111',
      cvv: '100',
    })

    assert.equal(result.gateway.name, 'gateway2')
    assert.equal(result.result.status, 'approved')
    assert.isString(result.result.externalId)
    assert.isAbove(result.result.externalId.length, 0)
  })
})

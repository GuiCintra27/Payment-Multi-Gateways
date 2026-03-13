import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Gateway from '#models/gateway'

test.group('Gateways Management', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('ADMIN can toggle a gateway', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'gateway-admin@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    const gateway = await Gateway.create({
      name: 'gateway-toggle',
      isActive: true,
      priority: 1,
      credentials: '{}',
    })

    const response = await client.patch(`/gateways/${gateway.id}/toggle`).loginAs(admin).json({
      isActive: false,
    })

    response.assertStatus(200)
    assert.equal(response.body().isActive, false)
  })

  test('priority update keeps gateway ordering unique and sequential', async ({
    client,
    assert,
  }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'gateway-priority@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    const gateway1 = await Gateway.create({
      name: 'gateway-priority-1',
      isActive: true,
      priority: 1,
      credentials: '{}',
    })
    const gateway2 = await Gateway.create({
      name: 'gateway-priority-2',
      isActive: true,
      priority: 2,
      credentials: '{}',
    })
    const gateway3 = await Gateway.create({
      name: 'gateway-priority-3',
      isActive: true,
      priority: 3,
      credentials: '{}',
    })

    const response = await client.patch(`/gateways/${gateway3.id}/priority`).loginAs(admin).json({
      priority: 1,
    })

    response.assertStatus(200)

    const orderedGateways = await Gateway.query().orderBy('priority', 'asc')
    assert.deepEqual(
      orderedGateways.map((gateway) => ({ id: gateway.id, priority: gateway.priority })),
      [
        { id: gateway3.id, priority: 1 },
        { id: gateway1.id, priority: 2 },
        { id: gateway2.id, priority: 3 },
      ]
    )
  })
})

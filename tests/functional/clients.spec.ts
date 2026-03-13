import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import User from '#models/user'
import Client from '#models/client'
import Gateway from '#models/gateway'
import Transaction from '#models/transaction'

test.group('Clients', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /clients/:id returns transactions ordered by created_at desc', async ({
    client,
    assert,
  }) => {
    const user = await User.create({
      fullName: 'Manager',
      email: 'clients-show@test.com',
      password: 'password123',
      role: 'MANAGER',
    })
    const txClient = await Client.create({
      name: 'Client Ordered',
      email: 'clients-ordered@test.com',
    })
    const gateway = await Gateway.create({
      name: 'clients-gateway',
      isActive: true,
      priority: 1,
      credentials: '{}',
    })

    const olderTransaction = await Transaction.create({
      clientId: txClient.id,
      gatewayId: gateway.id,
      externalId: 'client-tx-1',
      status: 'approved',
      amount: 1000,
      cardLastNumbers: '1111',
    })
    olderTransaction.createdAt = DateTime.fromISO('2026-03-13T10:00:00')
    await olderTransaction.save()

    const newerTransaction = await Transaction.create({
      clientId: txClient.id,
      gatewayId: gateway.id,
      externalId: 'client-tx-2',
      status: 'refunded',
      amount: 2000,
      cardLastNumbers: '2222',
    })
    newerTransaction.createdAt = DateTime.fromISO('2026-03-13T11:00:00')
    await newerTransaction.save()

    const response = await client.get(`/clients/${txClient.id}`).loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().id, txClient.id)
    assert.lengthOf(response.body().transactions, 2)
    assert.equal(response.body().transactions[0].id, newerTransaction.id)
    assert.equal(response.body().transactions[1].id, olderTransaction.id)
  })

  test('GET /clients/:id returns 404 for non-existent client', async ({ client }) => {
    const user = await User.create({
      fullName: 'User',
      email: 'clients-missing@test.com',
      password: 'password123',
      role: 'USER',
    })

    const response = await client.get('/clients/99999').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Client not found',
    })
  })
})

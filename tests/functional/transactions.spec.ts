import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Client from '#models/client'
import Gateway from '#models/gateway'
import Transaction from '#models/transaction'
import Product from '#models/product'

test.group('Transactions', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('FINANCE can list transactions', async ({ client, assert }) => {
    const user = await User.create({
      fullName: 'Finance',
      email: 'transactions-finance@test.com',
      password: 'password123',
      role: 'FINANCE',
    })

    const txClient = await Client.create({
      name: 'Client One',
      email: 'transactions-client@test.com',
    })
    const gateway = await Gateway.create({
      name: 'transactions-gateway',
      isActive: true,
      priority: 1,
      credentials: '{}',
    })

    await Transaction.create({
      clientId: txClient.id,
      gatewayId: gateway.id,
      externalId: 'tx-1',
      status: 'approved',
      amount: 5000,
      cardLastNumbers: '1111',
    })

    const response = await client.get('/transactions').loginAs(user)

    response.assertStatus(200)
    assert.isArray(response.body())
    assert.lengthOf(response.body(), 1)
    assert.equal(response.body()[0].status, 'approved')
    assert.notProperty(response.body()[0].gateway, 'credentials')
  })

  test('GET /transactions/:id returns products for authorized users', async ({
    client,
    assert,
  }) => {
    const user = await User.create({
      fullName: 'Finance',
      email: 'transactions-show@test.com',
      password: 'password123',
      role: 'FINANCE',
    })

    const txClient = await Client.create({
      name: 'Client Two',
      email: 'transactions-show-client@test.com',
    })
    const gateway = await Gateway.create({
      name: 'transactions-show-gateway',
      isActive: true,
      priority: 1,
      credentials: '{}',
    })
    const product = await Product.create({
      name: 'Product One',
      amount: 1990,
    })

    const transaction = await Transaction.create({
      clientId: txClient.id,
      gatewayId: gateway.id,
      externalId: 'tx-2',
      status: 'approved',
      amount: 1990,
      cardLastNumbers: '4242',
    })

    await transaction.related('products').attach({
      [product.id]: {
        quantity: 1,
        price_at_time: product.amount,
      },
    })

    const response = await client.get(`/transactions/${transaction.id}`).loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().id, transaction.id)
    assert.lengthOf(response.body().products, 1)
    assert.equal(response.body().products[0].name, 'Product One')
    assert.notProperty(response.body().gateway, 'credentials')
  })

  test('GET /transactions/:id returns 404 for non-existent transaction', async ({ client }) => {
    const user = await User.create({
      fullName: 'Finance',
      email: 'transactions-missing@test.com',
      password: 'password123',
      role: 'FINANCE',
    })

    const response = await client.get('/transactions/99999').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Transaction not found',
    })
  })

  test('USER cannot access transactions', async ({ client }) => {
    const user = await User.create({
      fullName: 'User',
      email: 'transactions-user-forbidden@test.com',
      password: 'password123',
      role: 'USER',
    })

    const response = await client.get('/transactions').loginAs(user)

    response.assertStatus(403)
  })
})

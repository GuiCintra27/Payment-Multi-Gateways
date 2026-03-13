import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Product from '#models/product'
import Gateway from '#models/gateway'
import Client from '#models/client'
import Transaction from '#models/transaction'
import GatewayService from '#services/gateway/gateway_service'
import type { ChargeInput, ChargeOutput } from '#services/gateway/gateway_interface'

const originalCharge = GatewayService.prototype.charge

test.group('Purchases', (group) => {
  group.each.setup(() => {
    const cleanup = testUtils.db().withGlobalTransaction()

    return () => {
      GatewayService.prototype.charge = originalCharge
      return cleanup()
    }
  })

  test('POST /purchases creates client, transaction and pivot items', async ({ client, assert }) => {
    const gateway = await Gateway.create({
      name: 'gateway1',
      isActive: true,
      priority: 1,
      credentials: '{}',
    })
    const product1 = await Product.create({ name: 'Product One', amount: 1500 })
    const product2 = await Product.create({ name: 'Product Two', amount: 3000 })

    GatewayService.prototype.charge = async function (
      data: ChargeInput
    ): Promise<{ result: ChargeOutput; gateway: Gateway }> {
      assert.equal(data.amount, 6000)
      assert.equal(data.email, 'buyer@test.com')

      return {
        result: {
          externalId: 'external-purchase-1',
          status: 'approved',
        },
        gateway,
      }
    }

    const response = await client.post('/purchases').json({
      client: {
        name: 'Buyer',
        email: 'buyer@test.com',
      },
      products: [
        { id: product1.id, quantity: 2 },
        { id: product2.id, quantity: 1 },
      ],
      card: {
        number: '4111111111111111',
        cvv: '123',
        holderName: 'BUYER TEST',
        expirationDate: '12/2030',
      },
    })

    response.assertStatus(201)
    assert.equal(response.body().totalAmount, 6000)
    assert.equal(response.body().transaction.status, 'approved')
    assert.equal(response.body().transaction.cardLastNumbers, '1111')
    assert.equal(response.body().gateway, 'gateway1')
    assert.lengthOf(response.body().products, 2)

    const savedClient = await Client.findByOrFail('email', 'buyer@test.com')
    const savedTransaction = await Transaction.query()
      .where('external_id', 'external-purchase-1')
      .preload('products')
      .firstOrFail()

    assert.equal(savedClient.name, 'Buyer')
    assert.equal(savedTransaction.clientId, savedClient.id)
    assert.equal(savedTransaction.gatewayId, gateway.id)
    assert.equal(savedTransaction.amount, 6000)
    assert.equal(savedTransaction.cardLastNumbers, '1111')
    assert.lengthOf(savedTransaction.products, 2)

    const savedProduct1 = savedTransaction.products.find((product) => product.id === product1.id)
    const savedProduct2 = savedTransaction.products.find((product) => product.id === product2.id)

    assert.equal(savedProduct1?.$extras.pivot_quantity, 2)
    assert.equal(savedProduct1?.$extras.pivot_price_at_time, 1500)
    assert.equal(savedProduct2?.$extras.pivot_quantity, 1)
    assert.equal(savedProduct2?.$extras.pivot_price_at_time, 3000)
  })

  test('POST /purchases returns 503 when no active gateways are available', async ({ client }) => {
    const product = await Product.create({ name: 'Product One', amount: 1500 })

    const response = await client.post('/purchases').json({
      client: {
        name: 'Buyer',
        email: 'no-gateway@test.com',
      },
      products: [{ id: product.id, quantity: 1 }],
      card: {
        number: '4111111111111111',
        cvv: '123',
        holderName: 'BUYER TEST',
        expirationDate: '12/2030',
      },
    })

    response.assertStatus(503)
    response.assertBodyContains({
      message: 'Payment processing is temporarily unavailable.',
    })
  })
})

import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Client from '#models/client'
import Gateway from '#models/gateway'
import Transaction from '#models/transaction'
import GatewayService from '#services/gateway/gateway_service'
import type { RefundOutput } from '#services/gateway/gateway_interface'

const originalRefund = GatewayService.prototype.refund

test.group('Refunds', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.teardown(() => {
    GatewayService.prototype.refund = originalRefund
  })

  test('POST /transactions/:id/refund refunds an approved transaction', async ({
    client,
    assert,
  }) => {
    const finance = await User.create({
      fullName: 'Finance',
      email: 'refund-finance@test.com',
      password: 'password123',
      role: 'FINANCE',
    })
    const txClient = await Client.create({
      name: 'Refund Client',
      email: 'refund-client@test.com',
    })
    const gateway = await Gateway.create({
      name: 'gateway1',
      isActive: true,
      priority: 1,
      credentials: '{}',
    })
    const transaction = await Transaction.create({
      clientId: txClient.id,
      gatewayId: gateway.id,
      externalId: 'refund-external-1',
      status: 'approved',
      amount: 7500,
      cardLastNumbers: '1234',
    })

    let refundCalledWith: string | null = null

    GatewayService.prototype.refund = async function (
      receivedGateway,
      externalId,
      requestId
    ): Promise<RefundOutput> {
      assert.equal(receivedGateway.id, gateway.id)
      assert.equal(requestId, 'req-refund-1')
      refundCalledWith = externalId
      return { success: true }
    }

    const response = await client
      .post(`/transactions/${transaction.id}/refund`)
      .header('X-Request-Id', 'req-refund-1')
      .loginAs(finance)

    response.assertStatus(200)
    response.assertHeader('X-Request-Id', 'req-refund-1')
    assert.equal(response.body().transaction.status, 'refunded')
    assert.equal(refundCalledWith, 'refund-external-1')

    await transaction.refresh()
    assert.equal(transaction.status, 'refunded')
  })

  test('POST /transactions/:id/refund returns 422 for non-approved transactions', async ({
    client,
    assert,
  }) => {
    const finance = await User.create({
      fullName: 'Finance',
      email: 'refund-invalid@test.com',
      password: 'password123',
      role: 'FINANCE',
    })
    const txClient = await Client.create({
      name: 'Refund Client',
      email: 'refund-invalid-client@test.com',
    })
    const gateway = await Gateway.create({
      name: 'gateway2',
      isActive: true,
      priority: 1,
      credentials: '{}',
    })
    const transaction = await Transaction.create({
      clientId: txClient.id,
      gatewayId: gateway.id,
      externalId: 'refund-external-2',
      status: 'rejected',
      amount: 7500,
      cardLastNumbers: '1234',
    })

    const response = await client.post(`/transactions/${transaction.id}/refund`).loginAs(finance)

    response.assertStatus(422)
    assert.isString(response.header('X-Request-Id'))
    response.assertBodyContains({
      message: 'Cannot refund transaction with status: rejected',
    })
  })

  test('POST /transactions/:id/refund returns 422 when transaction is already refunded', async ({
    client,
  }) => {
    const finance = await User.create({
      fullName: 'Finance',
      email: 'refund-already@test.com',
      password: 'password123',
      role: 'FINANCE',
    })
    const txClient = await Client.create({
      name: 'Refunded Client',
      email: 'refund-already-client@test.com',
    })
    const gateway = await Gateway.create({
      name: 'gateway-refunded',
      isActive: true,
      priority: 1,
      credentials: '{}',
    })
    const transaction = await Transaction.create({
      clientId: txClient.id,
      gatewayId: gateway.id,
      externalId: 'refund-external-3',
      status: 'refunded',
      amount: 7500,
      cardLastNumbers: '1234',
    })

    const response = await client.post(`/transactions/${transaction.id}/refund`).loginAs(finance)

    response.assertStatus(422)
    response.assertBodyContains({
      message: 'Transaction already refunded',
    })
  })

  test('POST /transactions/:id/refund returns 404 when transaction does not exist', async ({
    client,
  }) => {
    const finance = await User.create({
      fullName: 'Finance',
      email: 'refund-not-found@test.com',
      password: 'password123',
      role: 'FINANCE',
    })

    const response = await client.post('/transactions/99999/refund').loginAs(finance)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Transaction not found',
    })
  })
})

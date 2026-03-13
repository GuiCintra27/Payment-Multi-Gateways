import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Gateway from '#models/gateway'
import GatewayFactory from '#services/gateway/gateway_factory'
import GatewayService from '#services/gateway/gateway_service'
import type {
  ChargeInput,
  ChargeOutput,
  ExternalTransaction,
  GatewayStrategy,
  RefundOutput,
} from '#services/gateway/gateway_interface'

const originalCreate = GatewayFactory.create

test.group('GatewayService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.teardown(() => {
    GatewayFactory.create = originalCreate
  })

  test('falls back to the next active gateway when the first one fails', async ({ assert }) => {
    await Gateway.create({
      name: 'gateway1',
      isActive: true,
      priority: 1,
      credentials: '{}',
    })
    await Gateway.create({
      name: 'gateway2',
      isActive: true,
      priority: 2,
      credentials: '{}',
    })

    const attemptedGateways: string[] = []

    GatewayFactory.create = function (gateway: Gateway): GatewayStrategy {
      return {
        name: gateway.name,
        async createTransaction(_data: ChargeInput): Promise<ChargeOutput> {
          attemptedGateways.push(gateway.name)

          if (gateway.name === 'gateway1') {
            throw new Error('Gateway1 failed')
          }

          return {
            externalId: 'gateway2-external-id',
            status: 'approved',
          }
        },
        async refundTransaction(_externalId: string): Promise<RefundOutput> {
          return { success: true }
        },
        async listTransactions(): Promise<ExternalTransaction[]> {
          return []
        },
      }
    }

    const service = new GatewayService()

    const result = await service.charge({
      amount: 5000,
      name: 'Buyer',
      email: 'buyer@test.com',
      cardNumber: '4111111111111111',
      cvv: '123',
    })

    assert.deepEqual(attemptedGateways, ['gateway1', 'gateway2'])
    assert.equal(result.gateway.name, 'gateway2')
    assert.equal(result.result.externalId, 'gateway2-external-id')
    assert.equal(result.result.status, 'approved')
  })
})

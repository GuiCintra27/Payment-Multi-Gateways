import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Product from '#models/product'
import Gateway from '#models/gateway'
import Transaction from '#models/transaction'
import metrics from '#services/metrics_service'
import GatewayFactory from '#services/gateway/gateway_factory'
import type {
  ChargeInput,
  ChargeOutput,
  ExternalTransaction,
  GatewayStrategy,
  RefundOutput,
} from '#services/gateway/gateway_interface'

const originalCreate = GatewayFactory.create

test.group('Metrics', (group) => {
  group.each.setup(() => {
    metrics.reset()
    return testUtils.db().withGlobalTransaction()
  })

  group.each.teardown(() => {
    GatewayFactory.create = originalCreate
  })

  test('GET /metrics exposes Prometheus-style metrics', async ({ client, assert }) => {
    const response = await client.get('/metrics')

    response.assertStatus(200)
    response.assertHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
    assert.include(response.text(), '# HELP app_purchases_total')
    assert.include(response.text(), '# HELP app_purchase_amount_cents_total')
    assert.include(response.text(), '# TYPE app_gateway_charge_failures_total counter')
  })

  test('metrics track purchase fallback and refund success', async ({ client, assert }) => {
    const finance = await User.create({
      fullName: 'Finance',
      email: 'metrics-finance@test.com',
      password: 'password123',
      role: 'FINANCE',
    })
    const product = await Product.create({ name: 'Metrics Product', amount: 2500 })

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

    GatewayFactory.create = function (gateway: Gateway): GatewayStrategy {
      return {
        name: gateway.name,
        async createTransaction(_data: ChargeInput): Promise<ChargeOutput> {
          if (gateway.name === 'gateway1') {
            throw new Error('Gateway1 failed')
          }

          return {
            externalId: 'metrics-external-1',
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

    const purchaseResponse = await client.post('/purchases').json({
      client: {
        name: 'Metrics Buyer',
        email: 'metrics-buyer@test.com',
      },
      products: [{ id: product.id, quantity: 1 }],
      card: {
        number: '4111111111111111',
        cvv: '123',
        holderName: 'METRICS BUYER',
        expirationDate: '12/2030',
      },
    })

    purchaseResponse.assertStatus(201)

    const transactionId = purchaseResponse.body().transaction.id

    const refundResponse = await client
      .post(`/transactions/${transactionId}/refund`)
      .loginAs(finance)

    refundResponse.assertStatus(200)

    const metricsResponse = await client.get('/metrics')
    metricsResponse.assertStatus(200)

    const body = metricsResponse.text()

    assert.include(body, 'app_purchases_total{status="approved"} 1')
    assert.include(
      body,
      'app_purchase_amount_cents_total{gateway="gateway2",status="approved"} 2500'
    )
    assert.include(body, 'app_refunds_total{status="success"} 1')
    assert.include(body, 'app_refund_amount_cents_total{gateway="gateway2"} 2500')
    assert.include(body, 'app_gateway_charge_attempts_total{gateway="gateway1"} 1')
    assert.include(body, 'app_gateway_charge_failures_total{gateway="gateway1"} 1')
    assert.include(body, 'app_gateway_charge_attempts_total{gateway="gateway2"} 1')
    assert.include(body, 'app_gateway_charge_success_total{gateway="gateway2"} 1')
    assert.include(body, 'app_gateway_fallback_activated_total 1')
    assert.include(body, 'app_gateway_fallback_recovered_total 1')
    assert.include(body, 'app_gateway_refund_attempts_total{gateway="gateway2"} 1')
    assert.include(body, 'app_gateway_refund_success_total{gateway="gateway2"} 1')

    const transaction = await Transaction.findOrFail(transactionId)
    assert.equal(transaction.status, 'refunded')
  })

  test('metrics count purchases attempted with no active gateways', async ({ client, assert }) => {
    const product = await Product.create({ name: 'No Gateway Product', amount: 1800 })

    const response = await client.post('/purchases').json({
      client: {
        name: 'No Gateway Buyer',
        email: 'no-gateway-metrics@test.com',
      },
      products: [{ id: product.id, quantity: 1 }],
      card: {
        number: '4111111111111111',
        cvv: '123',
        holderName: 'NO GATEWAY BUYER',
        expirationDate: '12/2030',
      },
    })

    response.assertStatus(503)

    const metricsResponse = await client.get('/metrics')
    metricsResponse.assertStatus(200)
    assert.include(metricsResponse.text(), 'app_gateway_no_active_total 1')
  })
})

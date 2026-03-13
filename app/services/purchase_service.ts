import Product from '#models/product'
import Client from '#models/client'
import Transaction from '#models/transaction'
import GatewayService from '#services/gateway/gateway_service'
import { observabilityLogContext } from '#services/observability_log_context'
import { withSpan } from '#services/trace_service'
import metrics from '#services/metrics_service'
import type { ChargeInput } from '#services/gateway/gateway_interface'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'

interface PurchaseInput {
  client: {
    name: string
    email: string
  }
  products: Array<{
    id: number
    quantity: number
  }>
  card: {
    number: string
    cvv: string
    holderName: string
    expirationDate: string
  }
  requestId?: string
  route?: string
}

export default class PurchaseService {
  private gatewayService = new GatewayService()

  async execute(input: PurchaseInput) {
    return withSpan(
      'purchase.execute',
      {
        attributes: {
          'app.request_id': input.requestId ?? '',
          'app.route': input.route ?? 'POST /purchases',
          'app.client_email': input.client.email,
          'app.product_count': input.products.length,
        },
      },
      async (span) => {
        // 1. Fetch and validate all products
        const productIds = input.products.map((p) => p.id)
        const products = await Product.query().whereIn('id', productIds)

        if (products.length !== productIds.length) {
          const foundIds = products.map((p) => p.id)
          const missingIds = productIds.filter((id) => !foundIds.includes(id))
          span.setAttribute('app.validation_error', 'products_not_found')
          throw new Error(`Products not found: ${missingIds.join(', ')}`)
        }

        // 2. Calculate total (server-side)
        const productMap = new Map(products.map((p) => [p.id, p]))
        let totalAmount = 0
        const lineItems: Array<{ product: Product; quantity: number }> = []

        for (const item of input.products) {
          const product = productMap.get(item.id)!
          totalAmount += product.amount * item.quantity
          lineItems.push({ product, quantity: item.quantity })
        }

        span.setAttribute('app.total_amount_cents', totalAmount)

        // 3. Find or create client by email
        const client = await Client.firstOrCreate(
          { email: input.client.email },
          { name: input.client.name, email: input.client.email }
        )

        // 4. Charge via gateway service (with fallback)
        const chargeData: ChargeInput = {
          amount: totalAmount,
          name: input.card.holderName,
          email: input.client.email,
          cardNumber: input.card.number,
          cvv: input.card.cvv,
          requestId: input.requestId,
          route: input.route,
        }

        const { result, gateway } = await this.gatewayService.charge(chargeData)

        span.setAttribute('app.gateway', gateway.name)
        span.setAttribute('app.charge_status', result.status)

        // 5. Save transaction + products in a DB transaction
        const transaction = await db.transaction(async (trx) => {
          const tx = await Transaction.create(
            {
              clientId: client.id,
              gatewayId: gateway.id,
              externalId: result.externalId,
              status: result.status === 'approved' ? 'approved' : 'rejected',
              amount: totalAmount,
              cardLastNumbers: input.card.number.slice(-4),
            },
            { client: trx }
          )

          // Attach products with pivot data
          const pivotData: Record<number, { quantity: number; price_at_time: number }> = {}
          for (const item of lineItems) {
            pivotData[item.product.id] = {
              quantity: item.quantity,
              price_at_time: item.product.amount,
            }
          }

          await tx.related('products').attach(pivotData, trx)

          return tx
        })

        span.setAttribute('app.transaction_id', transaction.id)

        logger.info(
          observabilityLogContext(
            {
              requestId: input.requestId,
              route: input.route ?? 'POST /purchases',
              gateway: gateway.name,
              transactionId: transaction.id,
              status: transaction.status,
            },
            {
              clientId: client.id,
              amount: totalAmount,
            }
          ),
          'Purchase completed'
        )

        metrics.recordPurchase(transaction.status)
        metrics.recordPurchaseAmount(totalAmount, transaction.status, gateway.name)

        // 6. Return summary
        await transaction.load('client')
        await transaction.load('gateway')
        await transaction.load('products')

        return {
          transaction: {
            id: transaction.id,
            status: transaction.status,
            amount: transaction.amount,
            cardLastNumbers: transaction.cardLastNumbers,
            createdAt: transaction.createdAt,
          },
          client: {
            id: client.id,
            name: client.name,
            email: client.email,
          },
          gateway: gateway.name,
          products: lineItems.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.amount,
            subtotal: item.product.amount * item.quantity,
          })),
          totalAmount,
        }
      }
    )
  }
}

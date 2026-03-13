import Product from '#models/product'
import Client from '#models/client'
import Transaction from '#models/transaction'
import GatewayService from '#services/gateway/gateway_service'
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
}

export default class PurchaseService {
  private gatewayService = new GatewayService()

  async execute(input: PurchaseInput) {
    // 1. Fetch and validate all products
    const productIds = input.products.map((p) => p.id)
    const products = await Product.query().whereIn('id', productIds)

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id)
      const missingIds = productIds.filter((id) => !foundIds.includes(id))
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
    }

    const { result, gateway } = await this.gatewayService.charge(chargeData)

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

    logger.info(
      {
        transactionId: transaction.id,
        clientId: client.id,
        gateway: gateway.name,
        status: transaction.status,
        amount: totalAmount,
        requestId: input.requestId,
      },
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
}

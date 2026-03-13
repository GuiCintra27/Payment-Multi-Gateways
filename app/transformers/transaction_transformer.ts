import type Transaction from '#models/transaction'
import GatewayTransformer from '#transformers/gateway_transformer'

export default class TransactionTransformer {
  static summary(transaction: Transaction) {
    return {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      cardLastNumbers: transaction.cardLastNumbers,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    }
  }

  static transform(transaction: Transaction, options?: { includeProducts?: boolean }) {
    return {
      ...this.summary(transaction),
      client: transaction.client
        ? {
            id: transaction.client.id,
            name: transaction.client.name,
            email: transaction.client.email,
          }
        : undefined,
      gateway: transaction.gateway ? GatewayTransformer.transform(transaction.gateway) : undefined,
      products: options?.includeProducts
        ? transaction.products.map((product) => ({
            id: product.id,
            name: product.name,
            amount: product.amount,
            quantity: Number(product.$extras.pivot_quantity ?? 0),
            priceAtTime: Number(product.$extras.pivot_price_at_time ?? product.amount),
          }))
        : undefined,
    }
  }
}

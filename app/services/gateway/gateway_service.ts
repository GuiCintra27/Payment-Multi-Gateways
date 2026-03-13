import Gateway from '#models/gateway'
import GatewayFactory from './gateway_factory.js'
import type { ChargeInput, ChargeOutput, RefundOutput } from './gateway_interface.js'
import metrics from '#services/metrics_service'
import logger from '@adonisjs/core/services/logger'

/**
 * GatewayService — orchestrates payment attempts with automatic fallback.
 *
 * Queries active gateways ordered by priority and tries each one.
 * If a gateway fails, logs the error and moves to the next.
 * If all gateways fail, throws an error.
 */
export default class GatewayService {
  /**
   * Attempt to charge on the highest-priority active gateway.
   * Falls back to the next gateway on failure.
   *
   * @returns The charge result + the gateway model used
   */
  async charge(data: ChargeInput): Promise<{ result: ChargeOutput; gateway: Gateway }> {
    const gateways = await Gateway.query().where('is_active', true).orderBy('priority', 'asc')

    if (gateways.length === 0) {
      metrics.recordNoActiveGateways()
      throw new Error('No active gateways available')
    }

    const errors: Array<{ gateway: string; error: string }> = []

    for (const gw of gateways) {
      metrics.recordGatewayChargeAttempt(gw.name)

      try {
        const adapter = GatewayFactory.create(gw)
        const result = await adapter.createTransaction(data)
        metrics.recordGatewayChargeSuccess(gw.name)

        logger.info(
          {
            gateway: gw.name,
            externalId: result.externalId,
            status: result.status,
            requestId: data.requestId,
          },
          'Charge completed'
        )

        return { result, gateway: gw }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        errors.push({ gateway: gw.name, error: message })
        metrics.recordGatewayChargeFailure(gw.name)

        logger.warn(
          { gateway: gw.name, error: message, requestId: data.requestId },
          'Gateway charge failed, trying next'
        )
      }
    }

    metrics.recordAllGatewaysFailed()
    logger.error({ errors, requestId: data.requestId }, 'All gateways failed')
    throw new Error(
      `All gateways failed: ${errors.map((e) => `${e.gateway}: ${e.error}`).join('; ')}`
    )
  }

  /**
   * Refund a transaction on the specific gateway it was originally charged on.
   */
  async refund(gateway: Gateway, externalId: string, requestId?: string): Promise<RefundOutput> {
    const adapter = GatewayFactory.create(gateway)
    metrics.recordGatewayRefundAttempt(gateway.name)

    logger.info({ gateway: gateway.name, externalId, requestId }, 'Attempting refund')

    try {
      const result = await adapter.refundTransaction(externalId, requestId)
      metrics.recordGatewayRefundSuccess(gateway.name)

      logger.info(
        { gateway: gateway.name, externalId, success: result.success, requestId },
        'Refund completed'
      )

      return result
    } catch (error) {
      metrics.recordGatewayRefundFailure(gateway.name)
      throw error
    }
  }
}

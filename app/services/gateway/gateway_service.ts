import Gateway from '#models/gateway'
import { observabilityLogContext } from '#services/observability_log_context'
import { withSpan } from '#services/trace_service'
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
    return withSpan(
      'gateway.charge_orchestration',
      {
        attributes: {
          'app.request_id': data.requestId ?? '',
          'app.route': data.route ?? 'POST /purchases',
        },
      },
      async (span) => {
        const gateways = await Gateway.query().where('is_active', true).orderBy('priority', 'asc')

        if (gateways.length === 0) {
          metrics.recordNoActiveGateways()
          span.setAttribute('app.failure_reason', 'no_active_gateways')
          logger.warn(
            observabilityLogContext(
              {
                requestId: data.requestId,
                route: data.route ?? 'POST /purchases',
                status: 'error',
              },
              {
                failureReason: 'no_active_gateways',
              }
            ),
            'No active gateways available'
          )
          throw new Error('No active gateways available')
        }

        const errors: Array<{ gateway: string; error: string }> = []
        let fallbackActivated = false

        for (const [index, gw] of gateways.entries()) {
          metrics.recordGatewayChargeAttempt(gw.name)

          try {
            const result = await withSpan(
              'gateway.charge_attempt',
              {
                attributes: {
                  'app.gateway': gw.name,
                  'app.gateway_priority': gw.priority,
                  'app.request_id': data.requestId ?? '',
                  'app.route': data.route ?? 'POST /purchases',
                  'app.is_fallback_attempt': fallbackActivated,
                },
              },
              async (attemptSpan) => {
                const adapter = GatewayFactory.create(gw)
                const chargeResult = await adapter.createTransaction(data)
                attemptSpan.setAttribute('app.external_id', chargeResult.externalId)
                attemptSpan.setAttribute('app.charge_status', chargeResult.status)
                return chargeResult
              }
            )

            metrics.recordGatewayChargeSuccess(gw.name)
            if (fallbackActivated) {
              metrics.recordFallbackRecovered()
            }

            logger.info(
              observabilityLogContext(
                {
                  requestId: data.requestId,
                  route: data.route ?? 'POST /purchases',
                  gateway: gw.name,
                  status: result.status,
                },
                {
                  externalId: result.externalId,
                }
              ),
              'Charge completed'
            )

            return { result, gateway: gw }
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            errors.push({ gateway: gw.name, error: message })
            metrics.recordGatewayChargeFailure(gw.name)
            if (!fallbackActivated && index < gateways.length - 1) {
              fallbackActivated = true
              metrics.recordFallbackActivated()
            }

            logger.warn(
              observabilityLogContext(
                {
                  requestId: data.requestId,
                  route: data.route ?? 'POST /purchases',
                  gateway: gw.name,
                  status: 'error',
                },
                {
                  error: message,
                }
              ),
              'Gateway charge failed, trying next'
            )
          }
        }

        metrics.recordAllGatewaysFailed()
        span.setAttribute('app.failure_reason', 'all_gateways_failed')
        logger.error(
          observabilityLogContext(
            {
              requestId: data.requestId,
              route: data.route ?? 'POST /purchases',
              status: 'error',
            },
            { errors }
          ),
          'All gateways failed'
        )
        throw new Error(
          `All gateways failed: ${errors.map((e) => `${e.gateway}: ${e.error}`).join('; ')}`
        )
      }
    )
  }

  /**
   * Refund a transaction on the specific gateway it was originally charged on.
   */
  async refund(
    gateway: Gateway,
    externalId: string,
    requestId?: string,
    route = 'POST /transactions/:id/refund'
  ): Promise<RefundOutput> {
    return withSpan(
      'gateway.refund',
      {
        attributes: {
          'app.request_id': requestId ?? '',
          'app.route': route,
          'app.gateway': gateway.name,
          'app.external_id': externalId,
        },
      },
      async () => {
        const adapter = GatewayFactory.create(gateway)
        metrics.recordGatewayRefundAttempt(gateway.name)

        logger.info(
          observabilityLogContext(
            {
              requestId,
              route,
              gateway: gateway.name,
              status: 'attempting',
            },
            { externalId }
          ),
          'Attempting refund'
        )

        try {
          const result = await adapter.refundTransaction(externalId, requestId)
          metrics.recordGatewayRefundSuccess(gateway.name)

          logger.info(
            observabilityLogContext(
              {
                requestId,
                route,
                gateway: gateway.name,
                status: result.success ? 'success' : 'failed',
              },
              {
                externalId,
                success: result.success,
              }
            ),
            'Refund completed'
          )

          return result
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          metrics.recordGatewayRefundFailure(gateway.name)
          logger.warn(
            observabilityLogContext(
              {
                requestId,
                route,
                gateway: gateway.name,
                status: 'error',
              },
              {
                externalId,
                error: message,
              }
            ),
            'Gateway refund failed'
          )
          throw error
        }
      }
    )
  }
}

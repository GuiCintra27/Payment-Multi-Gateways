import env from '#start/env'
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_SERVICE_NAME,
} from '@opentelemetry/semantic-conventions'
import { NodeSDK } from '@opentelemetry/sdk-node'

export default class TelemetryService {
  private static sdk?: NodeSDK
  private static started = false

  private static isEnabled(): boolean {
    return env.get('OTEL_TRACING_ENABLED') === true
  }

  static async start() {
    if (!this.isEnabled() || this.started) {
      return
    }

    const tracesEndpoint = env.get('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT')
    const serviceName = env.get('OTEL_SERVICE_NAME') ?? 'betalent-payment-gateway'
    const diagnosticsEnabled = env.get('OTEL_DIAGNOSTICS_ENABLED') === true

    if (diagnosticsEnabled) {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)
    }

    const traceExporter = tracesEndpoint
      ? new OTLPTraceExporter({ url: tracesEndpoint })
      : new OTLPTraceExporter()

    const resource = resourceFromAttributes({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: env.get('NODE_ENV'),
    })

    this.sdk = new NodeSDK({
      resource,
      traceExporter,
    })

    await this.sdk.start()
    this.started = true

    console.info(
      {
        tracingEnabled: true,
        serviceName,
        tracesEndpoint: tracesEndpoint ?? 'default',
      },
      'OpenTelemetry tracing started'
    )

    process.once('SIGTERM', () => void this.shutdown('SIGTERM'))
    process.once('SIGINT', () => void this.shutdown('SIGINT'))
  }

  static async shutdown(signal: string) {
    if (!this.sdk || !this.started) {
      return
    }

    try {
      await this.sdk.shutdown()
      console.info({ signal }, 'OpenTelemetry tracing stopped')
    } catch (error) {
      console.error({ signal, error }, 'Failed to shutdown OpenTelemetry tracing')
    } finally {
      this.sdk = undefined
      this.started = false
    }
  }
}

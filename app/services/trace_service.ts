import { context, trace, SpanStatusCode, type Span, type SpanOptions } from '@opentelemetry/api'

const tracer = trace.getTracer('betalent-payment-gateway')

function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export async function withSpan<T>(
  name: string,
  options: SpanOptions,
  handler: (span: Span) => Promise<T> | T
): Promise<T> {
  const span = tracer.startSpan(name, options)

  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await handler(span)
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      const normalizedError = normalizeError(error)
      span.recordException(normalizedError)
      span.setStatus({ code: SpanStatusCode.ERROR, message: normalizedError.message })
      throw error
    } finally {
      span.end()
    }
  })
}

export function currentTraceId(): string | null {
  const activeSpan = trace.getSpan(context.active())
  if (!activeSpan) {
    return null
  }

  const traceId = activeSpan.spanContext().traceId
  if (!traceId || /^0+$/.test(traceId)) {
    return null
  }

  return traceId
}

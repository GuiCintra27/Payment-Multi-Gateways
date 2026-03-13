import { currentTraceId } from '#services/trace_service'

interface ObservabilityFields {
  requestId?: string
  route?: string
  gateway?: string
  transactionId?: string | number
  status?: string
}

export function observabilityLogContext(
  fields: ObservabilityFields,
  extra: Record<string, unknown> = {}
) {
  return {
    requestId: fields.requestId ?? null,
    route: fields.route ?? null,
    gateway: fields.gateway ?? null,
    transactionId: fields.transactionId ?? null,
    status: fields.status ?? null,
    trace_id: currentTraceId(),
    ...extra,
  }
}

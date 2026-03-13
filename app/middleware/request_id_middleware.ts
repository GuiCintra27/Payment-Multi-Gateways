import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { randomUUID } from 'node:crypto'

export default class RequestIdMiddleware {
  handle(ctx: HttpContext, next: NextFn) {
    const requestId = ctx.request.header('x-request-id') ?? randomUUID()

    ctx.response.header('X-Request-Id', requestId)
    ctx.request.request.headers['x-request-id'] = requestId

    return next()
  }
}

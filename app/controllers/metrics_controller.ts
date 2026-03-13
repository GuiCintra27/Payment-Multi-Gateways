import metrics from '#services/metrics_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class MetricsController {
  async index({ response }: HttpContext) {
    response.header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
    return response.send(metrics.renderPrometheus())
  }
}

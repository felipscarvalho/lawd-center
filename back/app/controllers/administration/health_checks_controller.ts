import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import { healthChecks } from '#start/health'

export default class HealthChecksController {
  /** Liveness: o processo está de pé (não toca no banco, para o container não reiniciar à toa) */
  async live({ response }: HttpContext) {
    return response.ok({ status: 'ok' })
  }

  /**
   * Readiness: banco, memória e disco. 200 quando tudo está bem, 503 quando não. O relatório tem
   * detalhes internos: com HEALTH_SECRET definida, exige o cabeçalho x-monitoring-secret
   */
  async ready({ request, response }: HttpContext) {
    const secret = env.get('HEALTH_SECRET')

    if (secret && request.header('x-monitoring-secret') !== secret) {
      return response.unauthorized({ errors: [{ message: 'Segredo de monitoramento inválido' }] })
    }

    const report = await healthChecks.run()

    return report.isHealthy ? response.ok(report) : response.serviceUnavailable(report)
  }
}

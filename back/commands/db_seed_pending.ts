import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import SeederRegistryService from '#services/administration/seeder_registry_service'

/**
 * Roda só os seeders que ainda não rodaram neste banco e registra cada um (como migration:run).
 * Usado a cada deploy (ver Dockerfile); o `db:seed` normal continua rodando todos.
 */
export default class DbSeedPending extends BaseCommand {
  static commandName = 'db:seed:pending'
  static description = 'Roda os seeders ainda não executados neste banco e registra cada um'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const service = await this.app.container.make(SeederRegistryService)

    const results = await service.runPending()

    if (results.length === 0) {
      this.logger.info('Nenhum seeder pendente')
    }

    for (const result of results) {
      if (result.status === 'completed') this.logger.success(`${result.name}`)
      if (result.status === 'ignored') {
        this.logger.info(`${result.name} (ignorado no ambiente "${this.app.nodeEnvironment}")`)
      }
      if (result.status === 'failed') {
        this.logger.error(`${result.name}: ${(result.error as Error)?.message ?? result.error}`)
        this.exitCode = 1
      }
    }
  }
}

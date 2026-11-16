import app from '@adonisjs/core/services/app'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import DirectorateService from '#services/administration/directorate_service'

/** Diretorias da LAWD (mesmas do organograma do SimMAP). Idempotente: atualiza pela chave. */
export default class extends BaseSeeder {
  async run() {
    const directorateService = await app.container.make(DirectorateService)

    await directorateService.upsertMany([
      { key: 'corp', name: 'CORP', kind: 'core' },
      { key: 'administrative', name: 'Adm', kind: 'standard' },
      { key: 'projects', name: 'Projetos', kind: 'standard' },
      { key: 'teaching', name: 'Ensino', kind: 'standard' },
      { key: 'events', name: 'Eventos', kind: 'standard' },
      { key: 'hr', name: 'RH', kind: 'standard' },
      { key: 'marketing', name: 'Marketing', kind: 'standard' },
    ])
  }
}

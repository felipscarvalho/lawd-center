import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import SeederRegistryService from '#services/administration/seeder_registry_service'

test.group('SeederRegistryService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.timeout(10000)

  test('roda cada seeder uma vez e registra', async ({ assert }) => {
    const service = await app.container.make(SeederRegistryService)

    const first = await service.runPending()
    const second = await service.runPending()

    const completed = first.filter((result) => result.status === 'completed').map((r) => r.name)
    assert.includeMembers(completed, [
      'database/seeders/administration/1_directorate_seeder',
      'database/seeders/administration/2_admin_user_seeder',
    ])
    // Tudo já registrado: a segunda execução não roda nada
    assert.lengthOf(second, 0)

    const registered = await db.from('adonis_seeders').select('name')
    assert.sameMembers(
      registered.map((row) => row.name),
      completed
    )
  })
})

import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import SeederRegistryService from '#services/administration/seeder_registry_service'

test.group('SeederRegistryService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.timeout(10000)

  test('roda cada seeder uma vez e registra; os de outro ambiente ficam sem registro', async ({
    assert,
  }) => {
    const service = await app.container.make(SeederRegistryService)

    const first = await service.runPending()
    const second = await service.runPending()

    const completed = first.filter((result) => result.status === 'completed').map((r) => r.name)
    assert.includeMembers(completed, [
      'database/seeders/administration/1_directorate_seeder',
      'database/seeders/administration/2_admin_user_seeder',
    ])
    // Demonstração só vale em desenvolvimento: ignorada nos testes e tentada de novo depois
    assert.deepEqual(
      second.map((result) => [result.name, result.status]),
      [
        ['database/seeders/administration/3_demo_members_seeder', 'ignored'],
        ['database/seeders/projects/1_demo_projects_seeder', 'ignored'],
      ]
    )

    const registered = await db.from('adonis_seeders').select('name')
    assert.sameMembers(
      registered.map((row) => row.name),
      completed
    )
  })
})

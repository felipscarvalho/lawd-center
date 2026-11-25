import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import PermissionService from '#services/administration/permission_service'
import MembershipService from '#services/administration/membership_service'
import {
  createUser,
  createUserWithPosition,
  setupDirectorates,
} from '#tests/helpers/administration'
import Membership from '#models/administration/membership'

test.group('PermissionService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('usuário sem vínculo ativo não tem permissões', async ({ assert }) => {
    const service = await app.container.make(PermissionService)
    const user = await createUser()

    assert.deepEqual(await service.getEffectivePermissions(user.id), [])
    assert.isFalse(await service.can(user.id, 'administration.user.view'))
  })

  test('membro efetivo tem permissões de leitura globais', async ({ assert }) => {
    const service = await app.container.make(PermissionService)
    const { projects } = await setupDirectorates()
    const member = await createUserWithPosition('member', projects)

    assert.isTrue(await service.can(member.id, 'administration.membership.view'))
    assert.isFalse(await service.canAnywhere(member.id, 'administration.membership.manage'))
    assert.isFalse(await service.can(member.id, 'administration.user.create'))
  })

  test('permissão do diretor vale só na própria diretoria', async ({ assert }) => {
    const service = await app.container.make(PermissionService)
    const { projects, events } = await setupDirectorates()
    const director = await createUserWithPosition('director', projects)

    assert.isTrue(await service.can(director.id, 'administration.membership.manage', projects.id))
    assert.isFalse(await service.can(director.id, 'administration.membership.manage', events.id))
    assert.isFalse(await service.canGlobally(director.id, 'administration.membership.manage'))
    assert.isTrue(await service.canAnywhere(director.id, 'administration.membership.manage'))
  })

  test('presidente, vice, secretário-geral e conselheiro administram tudo globalmente', async ({
    assert,
  }) => {
    const service = await app.container.make(PermissionService)
    const { corp, events } = await setupDirectorates()

    for (const position of [
      'president',
      'vice_president',
      'general_secretary',
      'counselor',
    ] as const) {
      const admin = await createUserWithPosition(position, corp)
      assert.isTrue(await service.can(admin.id, 'administration.user.create'), position)
      assert.isTrue(
        await service.can(admin.id, 'administration.membership.manage', events.id),
        position
      )
    }
  })

  test('vínculo encerrado deixa de conceder permissões', async ({ assert }) => {
    const service = await app.container.make(PermissionService)
    const membershipService = await app.container.make(MembershipService)
    const { projects } = await setupDirectorates()
    const director = await createUserWithPosition('director', projects)

    const membership = await Membership.query().where('user_id', director.id).firstOrFail()
    await membershipService.register({
      userId: director.id,
      directorateId: projects.id,
      position: 'member',
    })
    await membership.refresh()

    assert.isNotNull(membership.endsAt)
    assert.isFalse(await service.can(director.id, 'administration.membership.manage', projects.id))
    assert.isTrue(await service.can(director.id, 'administration.membership.view'))
  })
})

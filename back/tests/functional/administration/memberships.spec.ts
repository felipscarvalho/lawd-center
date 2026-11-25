import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { responseData } from '#tests/helpers/http'
import {
  createUser,
  createUserWithPosition,
  setupDirectorates,
} from '#tests/helpers/administration'

const assign = '/api/v1/administration/memberships'

test.group('Memberships', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('administrador nomeia diretor', async ({ client, assert }) => {
    const { corp, events } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    const user = await createUser()

    const response = await client
      .post(assign)
      .json({ userId: user.id, directorateId: events.id, position: 'director' })
      .loginAs(admin)

    response.assertStatus(201)
    assert.equal(response.body().data.position, 'director')
    assert.equal(responseData<{ directorate: { key: string } }>(response).directorate.key, 'events')
  })

  test('diretor adiciona membro na própria diretoria', async ({ client }) => {
    const { projects } = await setupDirectorates()
    const director = await createUserWithPosition('director', projects)
    const user = await createUser()

    const response = await client
      .post(assign)
      .json({ userId: user.id, directorateId: projects.id, position: 'member' })
      .loginAs(director)

    response.assertStatus(201)
  })

  test('diretor não gerencia outra diretoria nem nomeia diretores (403)', async ({ client }) => {
    const { projects, events } = await setupDirectorates()
    const director = await createUserWithPosition('director', projects)
    const user = await createUser()

    const otherDirectorate = await client
      .post(assign)
      .json({ userId: user.id, directorateId: events.id, position: 'member' })
      .loginAs(director)
    otherDirectorate.assertStatus(403)

    const appointDirector = await client
      .post(assign)
      .json({ userId: user.id, directorateId: projects.id, position: 'director' })
      .loginAs(director)
    appointDirector.assertStatus(403)
  })

  test('cargo único já ocupado devolve 422', async ({ client }) => {
    const { corp, projects } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    await createUserWithPosition('director', projects)
    const user = await createUser()

    const response = await client
      .post(assign)
      .json({ userId: user.id, directorateId: projects.id, position: 'director' })
      .loginAs(admin)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ code: 'E_POSITION_TAKEN' }] })
  })

  test('CORP aceita vários conselheiros ativos ao mesmo tempo', async ({ client, assert }) => {
    const { corp } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    const first = await createUser()
    const second = await createUser()

    for (const user of [first, second]) {
      const response = await client
        .post(assign)
        .json({ userId: user.id, directorateId: corp.id, position: 'counselor' })
        .loginAs(admin)

      response.assertStatus(201)
      assert.equal(responseData<{ positionLabel: string }>(response).positionLabel, 'Conselheiro')
    }
  })

  test('conselheiro só existe no CORP', async ({ client }) => {
    const { corp, projects } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    const user = await createUser()

    const response = await client
      .post(assign)
      .json({ userId: user.id, directorateId: projects.id, position: 'counselor' })
      .loginAs(admin)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ code: 'E_POSITION_NOT_ALLOWED' }] })
  })

  test('cargo do núcleo fora do CORP devolve 422', async ({ client }) => {
    const { corp, projects } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    const user = await createUser()

    const response = await client
      .post(assign)
      .json({ userId: user.id, directorateId: projects.id, position: 'vice_president' })
      .loginAs(admin)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ code: 'E_POSITION_NOT_ALLOWED' }] })
  })

  test('troca de cargo encerra o vínculo anterior e mantém o histórico', async ({
    client,
    assert,
  }) => {
    const { corp, projects } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    const member = await createUserWithPosition('member', projects)

    const response = await client
      .post(assign)
      .json({ userId: member.id, directorateId: projects.id, position: 'director' })
      .loginAs(admin)
    response.assertStatus(201)

    const history = await client
      .get(`/api/v1/administration/users/${member.id}/memberships`)
      .loginAs(admin)
    const positions = history
      .body()
      .data.map((m: { position: string; isActive: boolean }) => [m.position, m.isActive])
    assert.sameDeepMembers(positions, [
      ['director', true],
      ['member', false],
    ])
  })

  test('histórico vem do mais recente ao mais antigo, inclusive no mesmo dia', async ({
    client,
    assert,
  }) => {
    const { corp, projects, events } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    const member = await createUserWithPosition('member', projects)

    // Dois vínculos começando hoje: o cadastrado por último vem primeiro
    await client
      .post(assign)
      .json({ userId: member.id, directorateId: events.id, position: 'member' })
      .loginAs(admin)
    await client
      .post(assign)
      .json({ userId: member.id, directorateId: events.id, position: 'director' })
      .loginAs(admin)

    const history = await client
      .get(`/api/v1/administration/users/${member.id}/memberships`)
      .loginAs(admin)
    const items = responseData<{ position: string; directorateId: number }[]>(history).map(
      (item) => [item.position, item.directorateId]
    )

    assert.deepEqual(items, [
      ['director', events.id],
      ['member', events.id],
      ['member', projects.id],
    ])
  })

  test('encerrar vínculo', async ({ client, assert }) => {
    const { corp, projects } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    const user = await createUser()

    const created = await client
      .post(assign)
      .json({ userId: user.id, directorateId: projects.id, position: 'member' })
      .loginAs(admin)

    const response = await client
      .post(`${assign}/${created.body().data.id}/end`)
      .json({})
      .loginAs(admin)
    response.assertStatus(200)
    assert.isFalse(response.body().data.isActive)

    const again = await client
      .post(`${assign}/${created.body().data.id}/end`)
      .json({})
      .loginAs(admin)
    again.assertStatus(422)
  })

  test('organograma lista diretorias com os vínculos ativos', async ({ client, assert }) => {
    const { projects } = await setupDirectorates()
    const director = await createUserWithPosition('director', projects)
    const member = await createUserWithPosition('member', projects)

    const response = await client.get('/api/v1/administration/organization-chart').loginAs(member)
    response.assertStatus(200)

    const chart = responseData<{ key: string; memberships: { user: { id: number } }[] }[]>(response)
    const projectsNode = chart.find((d) => d.key === 'projects')!
    const ids = projectsNode.memberships.map((m) => m.user.id)
    assert.includeMembers(ids, [director.id, member.id])
    // Diretor aparece antes dos membros
    assert.isBelow(ids.indexOf(director.id), ids.indexOf(member.id))
  })
})

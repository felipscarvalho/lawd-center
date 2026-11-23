import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { responseData, responsePage } from '#tests/helpers/http'
import {
  createUser,
  createUserWithPosition,
  setupDirectorates,
  TEST_PASSWORD,
} from '#tests/helpers/administration'

test.group('Users', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('administrador cadastra usuário', async ({ client, assert }) => {
    const { corp } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)

    const response = await client
      .post('/api/v1/administration/users')
      .json({ fullName: 'Novo Membro', email: 'Novo.Membro@Test.Lawd', password: 'senha12345' })
      .loginAs(admin)

    response.assertStatus(201)
    const created = responseData<Record<string, unknown>>(response)
    assert.equal(created.email, 'novo.membro@test.lawd')
    assert.notProperty(created, 'password')
  })

  test('lista traz resumo do perfil e cargos ativos com a diretoria', async ({
    client,
    assert,
  }) => {
    const { projects } = await setupDirectorates()
    const member = await createUserWithPosition('member', projects)
    await client
      .put(`/api/v1/administration/users/${member.id}/profile`)
      .json({ course: 'design', maturity: 'mentor', birthDate: '2001-01-01' })
      .loginAs(member)

    const response = await client
      .get('/api/v1/administration/users')
      .qs({ search: member.email })
      .loginAs(member)

    response.assertStatus(200)
    type ListedUser = {
      id: number
      profile: Record<string, unknown> | null
      memberships: { position: string; directorate: { name: string } }[]
    }
    const listed = responseData<ListedUser[]>(response).find((user) => user.id === member.id)!
    assert.deepEqual(listed.profile, {
      course: 'design',
      universityEntryPeriod: null,
      weeklyAvailability: null,
      maturity: 'mentor',
    })
    assert.equal(listed.memberships[0].position, 'member')
    assert.equal(listed.memberships[0].directorate.name, 'Projetos')
  })

  test('lista é paginada e filtra no banco', async ({ client, assert }) => {
    const { projects, events } = await setupDirectorates()
    const viewer = await createUserWithPosition('member', projects)
    const token = `zpag${Date.now()}`
    for (const name of ['Ana', 'Bruno', 'Carla']) {
      const user = await createUserWithPosition('member', projects)
      await user.merge({ fullName: `${name} ${token}` }).save()
    }
    const other = await createUserWithPosition('member', events)
    await other.merge({ fullName: `Diego ${token}` }).save()

    const list = async (qs: Record<string, unknown>) => {
      const response = await client.get('/api/v1/administration/users').qs(qs).loginAs(viewer)
      response.assertStatus(200)
      return responsePage<{ fullName: string }>(response)
    }

    const second = await list({ search: token.toUpperCase(), perPage: 2, page: 2 })
    assert.deepEqual(
      second.data.map((user) => user.fullName),
      [`Carla ${token}`, `Diego ${token}`]
    )
    assert.include(second.metadata, { total: 4, perPage: 2, currentPage: 2, lastPage: 2 })

    const fromEvents = await list({ search: token, directorateId: events.id })
    assert.deepEqual(
      fromEvents.data.map((user) => user.fullName),
      [`Diego ${token}`]
    )

    // Curinga do LIKE na busca é tratado como texto
    const wildcard = await list({ search: '%' })
    assert.lengthOf(wildcard.data, 0)
  })

  test('lista recusa página grande demais (422)', async ({ client }) => {
    const { projects } = await setupDirectorates()
    const viewer = await createUserWithPosition('member', projects)

    const response = await client
      .get('/api/v1/administration/users')
      .qs({ perPage: 1000 })
      .loginAs(viewer)

    response.assertStatus(422)
  })

  test('membro efetivo não cadastra usuários (403)', async ({ client }) => {
    const { projects } = await setupDirectorates()
    const member = await createUserWithPosition('member', projects)

    const response = await client
      .post('/api/v1/administration/users')
      .json({ fullName: 'Outro', email: 'outro@test.lawd', password: 'senha12345' })
      .loginAs(member)

    response.assertStatus(403)
  })

  test('sem login devolve 401', async ({ client }) => {
    const response = await client.get('/api/v1/administration/users')
    response.assertStatus(401)
  })

  test('e-mail duplicado devolve 422', async ({ client }) => {
    const { corp } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    const existing = await createUser()

    const response = await client
      .post('/api/v1/administration/users')
      .json({ fullName: 'Duplicado', email: existing.email.toUpperCase(), password: 'senha12345' })
      .loginAs(admin)

    response.assertStatus(422)
  })

  test('desativar encerra vínculos e bloqueia o login', async ({ client, assert }) => {
    const { corp, projects } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    const member = await createUserWithPosition('member', projects)

    const response = await client
      .post(`/api/v1/administration/users/${member.id}/deactivate`)
      .loginAs(admin)
    response.assertStatus(200)
    assert.isFalse(response.body().data.isActive)

    const history = await client
      .get(`/api/v1/administration/users/${member.id}/memberships`)
      .loginAs(admin)
    assert.isTrue(history.body().data.every((m: { isActive: boolean }) => !m.isActive))

    const login = await client
      .post('/api/v1/administration/auth/login')
      .json({ email: member.email, password: TEST_PASSWORD })
    login.assertStatus(400)
  })

  test('não é possível desativar o próprio usuário', async ({ client }) => {
    const { corp } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)

    const response = await client
      .post(`/api/v1/administration/users/${admin.id}/deactivate`)
      .loginAs(admin)
    response.assertStatus(422)
  })
})

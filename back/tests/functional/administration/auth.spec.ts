import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import {
  createUser,
  createUserWithPosition,
  setupDirectorates,
  TEST_PASSWORD,
} from '#tests/helpers/administration'

test.group('Auth', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('login devolve token e o token autentica /auth/me', async ({ client, assert }) => {
    const { projects } = await setupDirectorates()
    const member = await createUserWithPosition('member', projects)

    const login = await client
      .post('/api/v1/administration/auth/login')
      .json({ email: member.email, password: TEST_PASSWORD })
    login.assertStatus(200)
    const token = login.body().data.token
    assert.isString(token)

    const me = await client.get('/api/v1/administration/auth/me').bearerToken(token)
    me.assertStatus(200)
    assert.equal(me.body().data.user.email, member.email)
    assert.includeDeepMembers(me.body().data.permissions, [
      { permission: 'administration.membership.view', scope: 'global', directorateId: null },
    ])
  })

  test('senha errada devolve 400 sem dizer qual campo falhou', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/api/v1/administration/auth/login')
      .json({ email: user.email, password: 'errada123' })
    response.assertStatus(400)
    response.assertBodyContains({ errors: [{ code: 'E_INVALID_CREDENTIALS' }] })
  })

  test('/auth/me sem token devolve 401', async ({ client }) => {
    const response = await client.get('/api/v1/administration/auth/me')
    response.assertStatus(401)
  })

  test('logout revoga o token', async ({ client }) => {
    const user = await createUser()
    const login = await client
      .post('/api/v1/administration/auth/login')
      .json({ email: user.email, password: TEST_PASSWORD })
    const token = login.body().data.token

    const logout = await client.post('/api/v1/administration/auth/logout').bearerToken(token)
    logout.assertStatus(204)

    const me = await client.get('/api/v1/administration/auth/me').bearerToken(token)
    me.assertStatus(401)
  })
})

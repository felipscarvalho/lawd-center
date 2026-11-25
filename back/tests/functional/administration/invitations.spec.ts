import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import type { ApiClient } from '@japa/api-client'
import User from '#models/administration/user'
import UserInvitationMail from '#mails/administration/user_invitation_mail'
import MailService from '#services/administration/mail_service'
import MailDeliveryException from '#exceptions/administration/mail_delivery_exception'
import { responseData, responseErrors } from '#tests/helpers/http'
import {
  createUser,
  createUserWithPosition,
  fakeMail,
  sentInvitationToken,
  sentMails,
  setupDirectorates,
} from '#tests/helpers/administration'

/** Cadastra um convite pela rota, como a tela faz, e devolve o token enviado por e-mail */
async function inviteByRoute(client: ApiClient, email: string) {
  const { corp } = await setupDirectorates()
  const admin = await createUserWithPosition('president', corp)

  const response = await client.post('/api/v1/administration/users').json({ email }).loginAs(admin)
  response.assertStatus(201)

  return {
    admin,
    userId: responseData<{ id: number }>(response).id,
    token: sentInvitationToken(email),
  }
}

test.group('Invitations', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(fakeMail)

  test('cadastro envia o convite com o link de criar a senha', async ({ client }) => {
    await inviteByRoute(client, 'convidado@test.lawd')

    sentMails().assertSent(UserInvitationMail, ({ message }) => {
      message.assertTo('convidado@test.lawd')
      message.assertSubject('Crie sua senha do Lawd Center')
      message.assertHtmlIncludes(/\/invitation\/inv_/)
      return true
    })
  })

  test('página do convite mostra o e-mail e aceitar já abre a sessão', async ({
    client,
    assert,
  }) => {
    const { token } = await inviteByRoute(client, 'aceita@test.lawd')

    const show = await client.get(`/api/v1/administration/auth/invitations/${token}`)
    show.assertStatus(200)
    assert.deepEqual(responseData(show), { email: 'aceita@test.lawd', fullName: null })

    const accept = await client
      .post(`/api/v1/administration/auth/invitations/${token}/accept`)
      .json({ fullName: 'Pessoa Convidada', password: 'senha12345' })
    accept.assertStatus(200)
    const session = responseData<{ token: string; user: { fullName: string; isPending: boolean } }>(
      accept
    )
    assert.isString(session.token)
    assert.equal(session.user.fullName, 'Pessoa Convidada')
    assert.isFalse(session.user.isPending)

    const login = await client
      .post('/api/v1/administration/auth/login')
      .json({ email: 'aceita@test.lawd', password: 'senha12345' })
    login.assertStatus(200)
  })

  test('link usado não vale de novo', async ({ client }) => {
    const { token } = await inviteByRoute(client, 'reuso@test.lawd')

    await client
      .post(`/api/v1/administration/auth/invitations/${token}/accept`)
      .json({ fullName: 'Pessoa Convidada', password: 'senha12345' })

    const again = await client.get(`/api/v1/administration/auth/invitations/${token}`)
    again.assertStatus(404)
  })

  test('token inválido devolve 404', async ({ client }) => {
    const response = await client.get('/api/v1/administration/auth/invitations/inv_abc.def')
    response.assertStatus(404)
  })

  test('convite expirado não vale', async ({ client }) => {
    const { userId, token } = await inviteByRoute(client, 'expirado@test.lawd')

    await db
      .from('user_invitation_tokens')
      .where('tokenable_id', userId)
      .update({ expires_at: new Date(Date.now() - 1000) })

    const response = await client.get(`/api/v1/administration/auth/invitations/${token}`)
    response.assertStatus(404)
  })

  test('quem ainda não aceitou não faz login', async ({ client }) => {
    await inviteByRoute(client, 'pendente@test.lawd')

    const login = await client
      .post('/api/v1/administration/auth/login')
      .json({ email: 'pendente@test.lawd', password: 'qualquer123' })
    login.assertStatus(400)
  })

  test('reenviar troca o link: o anterior deixa de valer', async ({ client }) => {
    const { admin, userId, token } = await inviteByRoute(client, 'reenvio@test.lawd')

    const resend = await client
      .post(`/api/v1/administration/users/${userId}/invitation`)
      .loginAs(admin)
    resend.assertStatus(200)

    const newToken = sentInvitationToken('reenvio@test.lawd')
    const old = await client.get(`/api/v1/administration/auth/invitations/${token}`)
    const current = await client.get(`/api/v1/administration/auth/invitations/${newToken}`)
    old.assertStatus(404)
    current.assertStatus(200)
  })

  test('não reenvia para quem já criou a senha', async ({ client }) => {
    const { corp } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    const user = await createUser()

    const response = await client
      .post(`/api/v1/administration/users/${user.id}/invitation`)
      .loginAs(admin)

    response.assertStatus(422)
  })

  test('gestão não define senha de quem ainda não aceitou', async ({ client, assert }) => {
    const { admin, userId } = await inviteByRoute(client, 'semsenha@test.lawd')

    const response = await client
      .put(`/api/v1/administration/users/${userId}`)
      .json({ password: 'senha12345' })
      .loginAs(admin)

    response.assertStatus(422)
    assert.equal(responseErrors(response)[0].field, 'password')
  })

  test('aceitar valida nome e senha', async ({ client }) => {
    const { token } = await inviteByRoute(client, 'valida@test.lawd')

    const response = await client
      .post(`/api/v1/administration/auth/invitations/${token}/accept`)
      .json({ fullName: 'A', password: '123' })

    response.assertStatus(422)
  })

  test('se o e-mail não sai, o cadastro é desfeito', async ({ client, assert }) => {
    const { corp } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)

    app.container.swap(MailService, () => {
      const service = new MailService()
      service.send = async () => {
        throw new MailDeliveryException()
      }
      return service
    })

    try {
      const response = await client
        .post('/api/v1/administration/users')
        .json({ email: 'falha@test.lawd' })
        .loginAs(admin)

      response.assertStatus(503)
      assert.isNull(await User.findBy('email', 'falha@test.lawd'))
    } finally {
      app.container.restore(MailService)
    }
  })
})

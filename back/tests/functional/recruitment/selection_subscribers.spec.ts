import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import SelectionSubscriber from '#models/recruitment/selection_subscriber'
import { SELECTION_SUBSCRIPTIONS_PER_WINDOW } from '#start/limiter'
import { responseData, responseErrors } from '#tests/helpers/http'

const SELECTION_SUBSCRIBERS_API = '/api/v1/recruitment/selection-subscribers'

test.group('Selection subscribers', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  // Os contadores do limite ficam na memória do processo: zera para um teste não gastar a cota do outro
  group.each.setup(() => limiter.clear())

  test('visitante se inscreve no aviso sem estar autenticado', async ({ client, assert }) => {
    const response = await client
      .post(SELECTION_SUBSCRIBERS_API)
      .json({ email: '  Maria.Souza@Test.Lawd ' })

    response.assertStatus(201)
    assert.deepEqual(responseData(response), { email: 'maria.souza@test.lawd' })

    const subscribers = await SelectionSubscriber.query().where('email', 'maria.souza@test.lawd')
    assert.lengthOf(subscribers, 1)
  })

  test('repetir a inscrição não duplica nem dá erro', async ({ client, assert }) => {
    await client.post(SELECTION_SUBSCRIBERS_API).json({ email: 'maria@test.lawd' })

    const response = await client.post(SELECTION_SUBSCRIBERS_API).json({ email: 'MARIA@test.lawd' })

    response.assertStatus(201)
    assert.deepEqual(responseData(response), { email: 'maria@test.lawd' })

    const subscribers = await SelectionSubscriber.query().where('email', 'maria@test.lawd')
    assert.lengthOf(subscribers, 1)
  })

  test('recusa e-mail inválido', async ({ client, assert }) => {
    const response = await client.post(SELECTION_SUBSCRIBERS_API).json({ email: 'sem-arroba' })

    response.assertStatus(422)
    assert.deepEqual(
      responseErrors(response).map((error) => error.field),
      ['email']
    )

    const subscribers = await SelectionSubscriber.query()
    assert.lengthOf(subscribers, 0)
  })

  test('barra o mesmo IP depois do limite de inscrições', async ({ client, assert }) => {
    for (let index = 0; index < SELECTION_SUBSCRIPTIONS_PER_WINDOW; index++) {
      const accepted = await client
        .post(SELECTION_SUBSCRIBERS_API)
        .json({ email: `pessoa${index}@test.lawd` })

      accepted.assertStatus(201)
    }

    const response = await client
      .post(SELECTION_SUBSCRIBERS_API)
      .json({ email: 'excedente@test.lawd' })

    response.assertStatus(429)
    assert.include(responseErrors(response)[0].message, 'Muitas inscrições')
    assert.isNull(await SelectionSubscriber.findBy('email', 'excedente@test.lawd'))
  })
})

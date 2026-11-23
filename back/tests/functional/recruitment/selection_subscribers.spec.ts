import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import SelectionSubscriber from '#models/recruitment/selection_subscriber'
import { responseData } from '#tests/helpers/http'

const SELECTION_SUBSCRIBERS_API = '/api/v1/recruitment/selection-subscribers'

test.group('Selection subscribers', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

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
    const errors = (response.body() as { errors: { field: string }[] }).errors
    assert.deepEqual(
      errors.map((error) => error.field),
      ['email']
    )

    const subscribers = await SelectionSubscriber.query()
    assert.lengthOf(subscribers, 0)
  })
})

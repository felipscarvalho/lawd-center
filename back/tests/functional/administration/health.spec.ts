import { test } from '@japa/runner'

test.group('Health checks', () => {
  test('live responde sem tocar no banco', async ({ client }) => {
    const response = await client.get('/api/v1/health/live')

    response.assertStatus(200)
    response.assertBody({ status: 'ok' })
  })

  test('ready confere banco, memória e disco', async ({ client, assert }) => {
    const response = await client.get('/api/v1/health/ready')

    response.assertStatus(200)
    const report = response.body() as { isHealthy: boolean; checks: { name: string }[] }
    assert.isTrue(report.isHealthy)
    assert.isTrue(report.checks.some((check) => check.name.toLowerCase().includes('database')))
  })

  test('não há rotas fora de /api/v1', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(404)
  })
})

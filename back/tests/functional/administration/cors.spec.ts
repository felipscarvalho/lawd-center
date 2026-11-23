import { test } from '@japa/runner'

// Fora do desenvolvimento (inclusive nos testes) só as origens de CORS_ORIGIN são aceitas
test.group('CORS', () => {
  test('aceita o front de produção e recusa outras origens', async ({ client, assert }) => {
    const preflight = (origin: string) =>
      client
        .options('/api/v1/administration/auth/login')
        .header('Origin', origin)
        .header('Access-Control-Request-Method', 'POST')

    const allowed = await preflight('https://lawd.felipscarvalho.com.br')
    const blocked = await preflight('https://outro-site.com')

    assert.equal(
      allowed.header('access-control-allow-origin'),
      'https://lawd.felipscarvalho.com.br'
    )
    assert.isUndefined(blocked.header('access-control-allow-origin'))
  })
})

import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import app from '@adonisjs/core/services/app'
import ProfileService from '#services/administration/profile_service'
import { responseData } from '#tests/helpers/http'
import { createUserWithPosition, setupDirectorates } from '#tests/helpers/administration'
import { addToTeam, createProject, PROJECTS_API } from '#tests/helpers/projects'

type RadarBody = { user: { id: number }; technicalScore: number | null }[]

test.group('Project interests and analytics', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('pessoa marca e desmarca o próprio interesse', async ({ client, assert }) => {
    const { projects } = await setupDirectorates()
    const member = await createUserWithPosition('member', projects)
    const project = await createProject(projects)

    const marked = await client
      .post(`${PROJECTS_API}/projects/${project.id}/interest`)
      .loginAs(member)
    marked.assertStatus(204)
    // Repetir não duplica
    await client.post(`${PROJECTS_API}/projects/${project.id}/interest`).loginAs(member)

    const detail = await client.get(`${PROJECTS_API}/projects/${project.id}`).loginAs(member)
    detail.assertBodyContains({ data: { isInterested: true, interestCount: 1 } })

    await client.delete(`${PROJECTS_API}/projects/${project.id}/interest`).loginAs(member)

    const interests = await client
      .get(`${PROJECTS_API}/projects/${project.id}/interests`)
      .loginAs(member)
    assert.lengthOf(responseData<unknown[]>(interests), 0)
  })

  test('projeto finalizado não recebe interessados (422)', async ({ client }) => {
    const { projects } = await setupDirectorates()
    const member = await createUserWithPosition('member', projects)
    const project = await createProject(projects, { status: 'finished' })

    const response = await client
      .post(`${PROJECTS_API}/projects/${project.id}/interest`)
      .loginAs(member)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ code: 'E_PROJECT_FINISHED' }] })
  })

  test('análise conta projetos, alocados e interessados', async ({ client, assert }) => {
    const { projects } = await setupDirectorates()
    const member = await createUserWithPosition('member', projects)
    const free = await createUserWithPosition('member', projects)
    const running = await createProject(projects, { name: 'Rodando' })
    const planned = await createProject(projects, { name: 'Planejado', status: 'not_started' })
    await addToTeam(running, member)
    await client.post(`${PROJECTS_API}/projects/${planned.id}/interest`).loginAs(free)

    const response = await client.get(`${PROJECTS_API}/analytics`).loginAs(member)

    response.assertStatus(200)
    const body = responseData<{
      byStatus: Record<string, number>
      allocatedPeople: number
      teamSizes: { project: { name: string }; value: number }[]
      interests: { project: { name: string }; value: number }[]
    }>(response)
    assert.isAtLeast(body.byStatus.in_progress, 1)
    assert.isAtLeast(body.allocatedPeople, 1)
    assert.deepInclude(
      body.teamSizes.map((item) => [item.project.name, item.value]),
      ['Rodando', 1]
    )
    assert.deepInclude(
      body.interests.map((item) => [item.project.name, item.value]),
      ['Planejado', 1]
    )
  })

  test('radar mostra a nota só para quem pode vê-la', async ({ client, assert }) => {
    const { corp, projects, events } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    const eventsDirector = await createUserWithPosition('director', events)
    const free = await createUserWithPosition('member', projects)
    const profileService = await app.container.make(ProfileService)
    await profileService.updateTechnicalScore(admin.id, free.id, 8.5)

    const scoreFor = async (viewerResponse: Awaited<ReturnType<typeof client.get>>) =>
      responseData<RadarBody>(viewerResponse).find((entry) => entry.user.id === free.id)
        ?.technicalScore

    const asAdmin = await client.get(`${PROJECTS_API}/radar`).loginAs(admin)
    asAdmin.assertStatus(200)
    assert.equal(await scoreFor(asAdmin), 8.5)

    // Diretor de Eventos gerencia projetos (vê o radar), mas não os dados privados de Projetos
    const asDirector = await client.get(`${PROJECTS_API}/radar`).loginAs(eventsDirector)
    asDirector.assertStatus(200)
    assert.isNull(await scoreFor(asDirector))
  })

  test('membro efetivo não vê o radar (403)', async ({ client }) => {
    const { projects } = await setupDirectorates()
    const member = await createUserWithPosition('member', projects)

    const response = await client.get(`${PROJECTS_API}/radar`).loginAs(member)

    response.assertStatus(403)
  })
})

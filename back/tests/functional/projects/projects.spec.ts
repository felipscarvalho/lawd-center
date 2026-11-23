import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import ProjectMember from '#models/projects/project_member'
import { responseData, responsePage } from '#tests/helpers/http'
import { createUserWithPosition, setupDirectorates } from '#tests/helpers/administration'
import { addToTeam, createProject, PROJECTS_API } from '#tests/helpers/projects'

type ProjectBody = {
  id: number
  name: string
  status: string
  endedAt: string | null
  teamSize: number
  coordinator: { id: number } | null
  abilities: { canEdit: boolean; canManageTeam: boolean }
}

test.group('Projects', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('lista é paginada e a busca acha pelo nome de quem está na equipe', async ({
    client,
    assert,
  }) => {
    const { projects, events } = await setupDirectorates()
    const viewer = await createUserWithPosition('member', events)
    const coordinator = await createUserWithPosition('member', projects)
    await coordinator.merge({ fullName: 'Zuleica Projetista' }).save()

    const site = await createProject(projects, { name: 'Site da liga' })
    await addToTeam(site, coordinator, 'coordinator')
    await createProject(events, { name: 'Semana de tecnologia' })

    const response = await client
      .get(`${PROJECTS_API}/projects`)
      .qs({ search: 'zuleica', perPage: 10 })
      .loginAs(viewer)

    response.assertStatus(200)
    const page = responsePage<ProjectBody>(response)
    assert.deepEqual(
      page.data.map((project) => project.name),
      ['Site da liga']
    )
    assert.equal(page.data[0].coordinator?.id, coordinator.id)
    assert.equal(page.data[0].teamSize, 1)
    assert.include(page.metadata, { total: 1, currentPage: 1 })
  })

  test('diretor cria projeto na própria diretoria, mas não em outra', async ({ client }) => {
    const { events, corp } = await setupDirectorates()
    const director = await createUserWithPosition('director', events)

    const own = await client
      .post(`${PROJECTS_API}/projects`)
      .json({ name: 'Semana de tecnologia', directorateId: events.id, priority: 'high' })
      .loginAs(director)
    own.assertStatus(201)
    own.assertBodyContains({ data: { status: 'not_started', priority: 'high' } })

    const other = await client
      .post(`${PROJECTS_API}/projects`)
      .json({ name: 'Outro', directorateId: corp.id })
      .loginAs(director)
    other.assertStatus(403)
  })

  test('diretor de Projetos edita projetos de outras diretorias', async ({ client, assert }) => {
    const { projects, events } = await setupDirectorates()
    const projectsDirector = await createUserWithPosition('director', projects)
    const eventsProject = await createProject(events)

    const response = await client
      .put(`${PROJECTS_API}/projects/${eventsProject.id}`)
      .json({ name: 'Landing page do evento' })
      .loginAs(projectsDirector)

    response.assertStatus(200)
    const body = responseData<ProjectBody>(response)
    assert.equal(body.name, 'Landing page do evento')
    assert.isTrue(body.abilities.canEdit)
  })

  test('membro efetivo não cria nem edita projetos (403)', async ({ client }) => {
    const { projects } = await setupDirectorates()
    const member = await createUserWithPosition('member', projects)
    const project = await createProject(projects)

    const create = await client
      .post(`${PROJECTS_API}/projects`)
      .json({ name: 'Novo', directorateId: projects.id })
      .loginAs(member)
    create.assertStatus(403)

    const update = await client
      .put(`${PROJECTS_API}/projects/${project.id}`)
      .json({ name: 'Outro' })
      .loginAs(member)
    update.assertStatus(403)
  })

  test('finalizar encerra a equipe e reabrir limpa o término', async ({ client, assert }) => {
    const { corp, projects } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    const member = await createUserWithPosition('member', projects)
    const project = await createProject(projects)
    await addToTeam(project, member)

    const finished = await client
      .put(`${PROJECTS_API}/projects/${project.id}`)
      .json({ status: 'finished' })
      .loginAs(admin)
    finished.assertStatus(200)
    const body = responseData<ProjectBody>(finished)
    assert.isNotNull(body.endedAt)
    assert.equal(body.teamSize, 0)

    const active = await ProjectMember.query().where('project_id', project.id).whereNull('ends_at')
    assert.lengthOf(active, 0)

    const reopened = await client
      .put(`${PROJECTS_API}/projects/${project.id}`)
      .json({ status: 'in_progress' })
      .loginAs(admin)
    assert.isNull(responseData<ProjectBody>(reopened).endedAt)
  })

  test('previsão de término antes do início devolve 422 no campo', async ({ client }) => {
    const { corp, projects } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)

    const response = await client
      .post(`${PROJECTS_API}/projects`)
      .json({
        name: 'Datas trocadas',
        directorateId: projects.id,
        startsAt: '2026-05-10',
        expectedEndAt: '2026-05-01',
      })
      .loginAs(admin)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ code: 'E_INVALID_DATES', field: 'expectedEndAt' }] })
  })
})

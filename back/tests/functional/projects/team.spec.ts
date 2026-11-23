import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import ProjectInterest from '#models/projects/project_interest'
import { responseData } from '#tests/helpers/http'
import { createUserWithPosition, setupDirectorates } from '#tests/helpers/administration'
import { addToTeam, createProject, PROJECTS_API } from '#tests/helpers/projects'

type MemberBody = { id: number; role: string; isActive: boolean; user: { id: number } }

test.group('Project team', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('coordenador adiciona integrantes, mas não define coordenador', async ({ client }) => {
    const { projects, events } = await setupDirectorates()
    const coordinator = await createUserWithPosition('member', projects)
    const newcomer = await createUserWithPosition('member', events)
    const project = await createProject(projects)
    await addToTeam(project, coordinator, 'coordinator')

    const asMember = await client
      .post(`${PROJECTS_API}/projects/${project.id}/members`)
      .json({ userId: newcomer.id, role: 'member' })
      .loginAs(coordinator)
    asMember.assertStatus(201)

    const asCoordinator = await client
      .post(`${PROJECTS_API}/projects/${project.id}/members`)
      .json({ userId: newcomer.id, role: 'coordinator' })
      .loginAs(coordinator)
    asCoordinator.assertStatus(403)
  })

  test('integrante comum não mexe na equipe (403)', async ({ client }) => {
    const { projects } = await setupDirectorates()
    const member = await createUserWithPosition('member', projects)
    const other = await createUserWithPosition('member', projects)
    const project = await createProject(projects)
    await addToTeam(project, member)

    const response = await client
      .post(`${PROJECTS_API}/projects/${project.id}/members`)
      .json({ userId: other.id, role: 'member' })
      .loginAs(member)

    response.assertStatus(403)
  })

  test('um coordenador por projeto; trocar de papel mantém o histórico', async ({
    client,
    assert,
  }) => {
    const { projects } = await setupDirectorates()
    const director = await createUserWithPosition('director', projects)
    const first = await createUserWithPosition('member', projects)
    const second = await createUserWithPosition('member', projects)
    const project = await createProject(projects)
    await addToTeam(project, first, 'coordinator')
    await addToTeam(project, second)

    const taken = await client
      .post(`${PROJECTS_API}/projects/${project.id}/members`)
      .json({ userId: second.id, role: 'coordinator' })
      .loginAs(director)
    taken.assertStatus(422)
    taken.assertBodyContains({ errors: [{ code: 'E_COORDINATOR_TAKEN' }] })

    const demoted = await client
      .post(`${PROJECTS_API}/projects/${project.id}/members`)
      .json({ userId: first.id, role: 'member' })
      .loginAs(director)
    demoted.assertStatus(201)

    const promoted = await client
      .post(`${PROJECTS_API}/projects/${project.id}/members`)
      .json({ userId: second.id, role: 'coordinator' })
      .loginAs(director)
    promoted.assertStatus(201)

    const history = await client
      .get(`${PROJECTS_API}/projects/${project.id}/members`)
      .loginAs(director)
    const rows = responseData<MemberBody[]>(history).map((row) => [
      row.user.id,
      row.role,
      row.isActive,
    ])
    assert.deepEqual(rows, [
      [second.id, 'coordinator', true],
      [first.id, 'member', true],
      [second.id, 'member', false],
      [first.id, 'coordinator', false],
    ])
  })

  test('entrar na equipe tira a pessoa dos interessados', async ({ client, assert }) => {
    const { projects } = await setupDirectorates()
    const director = await createUserWithPosition('director', projects)
    const member = await createUserWithPosition('member', projects)
    const project = await createProject(projects)

    await client.post(`${PROJECTS_API}/projects/${project.id}/interest`).loginAs(member)
    await client
      .post(`${PROJECTS_API}/projects/${project.id}/members`)
      .json({ userId: member.id, role: 'member' })
      .loginAs(director)

    const interests = await ProjectInterest.query().where('project_id', project.id)
    assert.lengthOf(interests, 0)
  })

  test('sair da equipe guarda a data e não pode ser antes da entrada', async ({ client }) => {
    const { projects } = await setupDirectorates()
    const director = await createUserWithPosition('director', projects)
    const member = await createUserWithPosition('member', projects)
    const project = await createProject(projects)
    const participation = await addToTeam(project, member)

    const tooEarly = await client
      .post(`${PROJECTS_API}/project-members/${participation.id}/end`)
      .json({ endsAt: '2000-01-01' })
      .loginAs(director)
    tooEarly.assertStatus(422)

    const ended = await client
      .post(`${PROJECTS_API}/project-members/${participation.id}/end`)
      .json({})
      .loginAs(director)
    ended.assertStatus(200)
    ended.assertBodyContains({ data: { isActive: false } })
  })

  test('projetos de uma pessoa trazem participações e interesses', async ({ client, assert }) => {
    const { projects } = await setupDirectorates()
    const member = await createUserWithPosition('member', projects)
    const current = await createProject(projects, { name: 'Atual' })
    const wanted = await createProject(projects, { name: 'Desejado' })
    await addToTeam(current, member, 'coordinator')
    await client.post(`${PROJECTS_API}/projects/${wanted.id}/interest`).loginAs(member)

    const response = await client.get(`${PROJECTS_API}/users/${member.id}/projects`).loginAs(member)

    response.assertStatus(200)
    const body = responseData<{
      participations: { role: string; project: { name: string } }[]
      interests: { name: string }[]
    }>(response)
    assert.equal(body.participations[0].project.name, 'Atual')
    assert.equal(body.participations[0].role, 'coordinator')
    assert.deepEqual(
      body.interests.map((project) => project.name),
      ['Desejado']
    )
  })
})

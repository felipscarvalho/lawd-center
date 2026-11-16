import { test } from '@japa/runner'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import drive from '@adonisjs/drive/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import {
  createUser,
  createUserWithPosition,
  setupDirectorates,
} from '#tests/helpers/administration'

const profileUrl = (id: number) => `/api/v1/administration/users/${id}/profile`

test.group('Profiles', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('a própria pessoa preenche o perfil e os catálogos são padronizados', async ({
    client,
    assert,
  }) => {
    const { projects } = await setupDirectorates()
    const member = await createUserWithPosition('member', projects)

    const response = await client
      .put(profileUrl(member.id))
      .json({
        birthDate: '2002-05-10',
        course: 'advertising',
        universityEntryPeriod: '2022.1',
        weeklyAvailability: 'from_6_to_8h',
        maturity: 'developing',
        careerPaths: ['frontend', 'ui_ux'],
        softSkills: ['autonomy', 'teamwork'],
        goal: 'Aprender React',
        technologies: ['React', 'react', 'TypeScript'],
        interestAreas: ['Design de interfaces'],
      })
      .loginAs(member)

    response.assertStatus(200)
    const data = (response.body() as { data: Record<string, unknown> }).data
    assert.equal(data.course, 'advertising')
    assert.equal(data.birthDate, '2002-05-10')
    assert.deepEqual(data.careerPaths, ['frontend', 'ui_ux'])
    // "React" e "react" viram o mesmo item do catálogo
    assert.deepEqual(data.technologies, ['React', 'TypeScript'])
    assert.isTrue((data.abilities as { canUpdate: boolean }).canUpdate)
  })

  test('quem não tem vínculo vê o próprio perfil, mas não o de outras pessoas', async ({
    client,
  }) => {
    const user = await createUser()
    const other = await createUser()

    const own = await client.get(profileUrl(user.id)).loginAs(user)
    own.assertStatus(200)

    const foreign = await client.get(profileUrl(other.id)).loginAs(user)
    foreign.assertStatus(403)
  })

  test('período de entrada inválido devolve 422', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .put(profileUrl(user.id))
      .json({ universityEntryPeriod: '2022.3' })
      .loginAs(user)

    response.assertStatus(422)
  })

  test('membro não edita o perfil de outra pessoa', async ({ client }) => {
    const { projects } = await setupDirectorates()
    const member = await createUserWithPosition('member', projects)
    const other = await createUserWithPosition('member', projects)

    const response = await client.put(profileUrl(other.id)).json({ goal: 'x' }).loginAs(member)

    response.assertStatus(403)
  })

  test('diretor edita o perfil de membros da própria diretoria, mas não de outras', async ({
    client,
  }) => {
    const { projects, events } = await setupDirectorates()
    const director = await createUserWithPosition('director', projects)
    const ownMember = await createUserWithPosition('member', projects)
    const otherMember = await createUserWithPosition('member', events)

    const own = await client
      .put(profileUrl(ownMember.id))
      .json({ course: 'design' })
      .loginAs(director)
    own.assertStatus(200)

    const other = await client
      .put(profileUrl(otherMember.id))
      .json({ course: 'design' })
      .loginAs(director)
    other.assertStatus(403)
  })

  test('dados privados e nota técnica só aparecem para quem pode ver', async ({
    client,
    assert,
  }) => {
    const { projects } = await setupDirectorates()
    const director = await createUserWithPosition('director', projects)
    const member = await createUserWithPosition('member', projects)
    const colleague = await createUserWithPosition('member', projects)

    await client
      .put(profileUrl(member.id))
      .json({ birthDate: '2001-01-01', goal: 'Liderar um projeto' })
      .loginAs(member)
    await client
      .put(`/api/v1/administration/users/${member.id}/technical-score`)
      .json({ technicalScore: 8.5 })
      .loginAs(director)

    type ProfileBody = { data: Record<string, unknown> }
    const viewAs = async (viewer: typeof member) => {
      const response = await client.get(profileUrl(member.id)).loginAs(viewer)

      return (response.body() as ProfileBody).data
    }

    const asColleague = await viewAs(colleague)
    assert.isNull(asColleague.birthDate)
    assert.isNull(asColleague.goal)
    assert.isNull(asColleague.technicalScore)

    const asSelf = await viewAs(member)
    assert.equal(asSelf.goal, 'Liderar um projeto')
    assert.isNull(asSelf.technicalScore)

    const asDirector = await viewAs(director)
    assert.equal(asDirector.birthDate, '2001-01-01')
    assert.equal(asDirector.technicalScore, 8.5)
  })

  test('ninguém define a própria nota técnica e membro não avalia', async ({ client }) => {
    const { corp, projects } = await setupDirectorates()
    const admin = await createUserWithPosition('president', corp)
    const member = await createUserWithPosition('member', projects)

    const self = await client
      .put(`/api/v1/administration/users/${admin.id}/technical-score`)
      .json({ technicalScore: 10 })
      .loginAs(admin)
    self.assertStatus(422)

    const byMember = await client
      .put(`/api/v1/administration/users/${admin.id}/technical-score`)
      .json({ technicalScore: 10 })
      .loginAs(member)
    byMember.assertStatus(403)
  })

  test('foto é comprimida para WebP 512x512 e a anterior é apagada', async ({ client, assert }) => {
    const fakeDisk = drive.fake('fs')
    const user = await createUser()

    // Imagem PNG grande e retangular, gerada para o teste
    const dir = await mkdtemp(join(tmpdir(), 'lawd-photo-'))
    const photoPath = join(dir, 'photo.png')
    await writeFile(
      photoPath,
      await sharp({
        create: { width: 1600, height: 900, channels: 3, background: '#9f5fff' },
      })
        .png()
        .toBuffer()
    )

    const first = await client
      .post(`${profileUrl(user.id)}/photo`)
      .file('photo', photoPath)
      .loginAs(user)
    first.assertStatus(200)
    const firstUrl = (first.body() as { data: { photoUrl: string } }).data.photoUrl
    const firstKey = firstUrl.split('/uploads/')[1]

    const stored = await fakeDisk.getBytes(firstKey)
    const metadata = await sharp(Buffer.from(stored)).metadata()
    assert.equal(metadata.format, 'webp')
    assert.equal(metadata.width, 512)
    assert.equal(metadata.height, 512)

    const second = await client
      .post(`${profileUrl(user.id)}/photo`)
      .file('photo', photoPath)
      .loginAs(user)
    second.assertStatus(200)
    assert.isFalse(await fakeDisk.exists(firstKey))

    drive.restore('fs')
  })

  test('remover a foto apaga o arquivo', async ({ client, assert }) => {
    const fakeDisk = drive.fake('fs')
    const user = await createUser()
    const dir = await mkdtemp(join(tmpdir(), 'lawd-photo-'))
    const photoPath = join(dir, 'photo.png')
    await writeFile(
      photoPath,
      await sharp({ create: { width: 64, height: 64, channels: 3, background: '#000' } })
        .png()
        .toBuffer()
    )

    const upload = await client
      .post(`${profileUrl(user.id)}/photo`)
      .file('photo', photoPath)
      .loginAs(user)
    const key = (upload.body() as { data: { photoUrl: string } }).data.photoUrl.split(
      '/uploads/'
    )[1]

    const response = await client.delete(`${profileUrl(user.id)}/photo`).loginAs(user)

    response.assertStatus(200)
    assert.isNull((response.body() as { data: { photoUrl: null } }).data.photoUrl)
    assert.isFalse(await fakeDisk.exists(key))
    drive.restore('fs')
  })

  test('arquivo que não é imagem devolve 422', async ({ client }) => {
    drive.fake('fs')
    const user = await createUser()
    const dir = await mkdtemp(join(tmpdir(), 'lawd-photo-'))
    const fakePath = join(dir, 'fake.png')
    await writeFile(fakePath, 'não sou uma imagem')

    const response = await client
      .post(`${profileUrl(user.id)}/photo`)
      .file('photo', fakePath)
      .loginAs(user)

    response.assertStatus(422)
    drive.restore('fs')
  })

  test('catálogo de tecnologias busca por trecho do nome', async ({ client, assert }) => {
    const user = await createUser()
    await client
      .put(profileUrl(user.id))
      .json({ technologies: ['PostgreSQL', 'Python'] })
      .loginAs(user)

    const response = await client
      .get('/api/v1/administration/technologies?search=post')
      .loginAs(user)

    response.assertStatus(200)
    assert.include((response.body() as { data: string[] }).data, 'PostgreSQL')
  })
})

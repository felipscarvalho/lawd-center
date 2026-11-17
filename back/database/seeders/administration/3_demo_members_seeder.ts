import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import env from '#start/env'
import UserService from '#services/administration/user_service'
import DirectorateService from '#services/administration/directorate_service'
import MembershipService from '#services/administration/membership_service'
import ProfileService from '#services/administration/profile_service'
import {
  careerPaths,
  courses,
  maturityLevels,
  softSkills,
  weeklyAvailabilities,
} from '#models/administration/profile'
import type { Position } from '#permissions/positions'
import type { UpdateProfileInput } from '#dtos/administration/profile'

/** Senha de todas as pessoas de demonstração */
export const DEMO_PASSWORD = 'lawd-demo-123'

/** Domínio dos e-mails de demonstração: facilita achar e apagar esses dados */
export const DEMO_EMAIL_DOMAIN = 'demo.lawd'

/** Membros efetivos criados em cada diretoria comum */
const MEMBERS_PER_DIRECTORATE = 4

const firstNames = [
  'Ana',
  'Bruno',
  'Carla',
  'Diego',
  'Elisa',
  'Fábio',
  'Gabriela',
  'Heitor',
  'Isabela',
  'João',
  'Larissa',
  'Marcos',
  'Natália',
  'Otávio',
  'Paula',
  'Rafael',
  'Sofia',
  'Tiago',
  'Úrsula',
  'Vinícius',
]

const lastNames = [
  'Almeida',
  'Barbosa',
  'Cardoso',
  'Duarte',
  'Esteves',
  'Ferreira',
  'Gomes',
  'Holanda',
]

const technologies = [
  'React',
  'TypeScript',
  'Node.js',
  'AdonisJS',
  'Next.js',
  'PostgreSQL',
  'Python',
  'Docker',
  'Figma',
  'Git',
]

const interestAreas = [
  'Desenvolvimento web',
  'Design de interfaces',
  'Inteligência artificial',
  'Dados',
  'Gestão de projetos',
  'Empreendedorismo',
  'Educação',
]

const goals = [
  'Aprender a trabalhar em equipe num projeto com cliente real.',
  'Ganhar experiência para conseguir o primeiro estágio.',
  'Liderar um projeto da liga até o fim.',
  'Aprofundar em back-end e banco de dados.',
]

/** Item da lista escolhido pela posição, para os dados saírem sempre iguais a cada execução */
const pick = <T>(list: readonly T[], index: number) => list[index % list.length]

/** Alguns itens distintos da lista, a partir da posição */
const pickMany = <T>(list: readonly T[], index: number, count: number) =>
  Array.from({ length: count }, (_, offset) => list[(index + offset * 3) % list.length]).filter(
    (item, position, all) => all.indexOf(item) === position
  )

const slug = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Perfil preenchido de forma variada, mas determinística, para a pessoa de número `index` */
const demoProfile = (index: number): UpdateProfileInput => {
  const entryYear = 2021 + (index % 4)

  return {
    birthDate: DateTime.fromObject({
      year: 1999 + (index % 6),
      month: 1 + (index % 12),
      day: 1 + (index % 28),
    }),
    registrationNumber: `${entryYear}${String(index + 1).padStart(8, '0')}`,
    course: pick(courses, index),
    universityEntryPeriod: `${entryYear}.${1 + (index % 2)}`,
    weeklyAvailability: pick(weeklyAvailabilities, index),
    maturity: pick(maturityLevels, index),
    careerPaths: pickMany(careerPaths, index, 1 + (index % 3)),
    softSkills: pickMany(softSkills, index + 1, 1 + ((index + 1) % 3)),
    goal: pick(goals, index),
    technologies: pickMany(technologies, index, 2 + (index % 3)),
    interestAreas: pickMany(interestAreas, index, 1 + (index % 2)),
  }
}

/**
 * Dados de demonstração para desenvolvimento: vice-presidente e secretário-geral no CORP e, em cada
 * diretoria comum, um diretor e membros efetivos, todos com perfil preenchido e nota técnica.
 * Só roda em desenvolvimento e é idempotente: e-mails que já existem são pulados, e cargos únicos já
 * ocupados não são substituídos.
 */
export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    const userService = await app.container.make(UserService)
    const directorateService = await app.container.make(DirectorateService)
    const membershipService = await app.container.make(MembershipService)
    const profileService = await app.container.make(ProfileService)

    const directorates = await directorateService.list()
    const corp = directorates.find((directorate) => directorate.kind === 'core')
    const standards = directorates.filter((directorate) => directorate.kind === 'standard')

    if (!corp || standards.length === 0) {
      logger.warn('Diretorias não encontradas; rode o seeder de diretorias antes')
      return
    }

    const chart = await membershipService.organizationChart()
    const occupied = (directorateId: number, position: Position) =>
      chart.some(
        (directorate) =>
          directorate.id === directorateId &&
          directorate.memberships.some((membership) => membership.position === position)
      )

    // Cargos a preencher, na ordem em que as pessoas são criadas
    const slots: { directorateId: number; position: Position }[] = []

    for (const position of ['vice_president', 'general_secretary'] as const) {
      if (!occupied(corp.id, position)) slots.push({ directorateId: corp.id, position })
    }

    for (const directorate of standards) {
      if (!occupied(directorate.id, 'director')) {
        slots.push({ directorateId: directorate.id, position: 'director' })
      }

      for (let count = 0; count < MEMBERS_PER_DIRECTORATE; count++) {
        slots.push({ directorateId: directorate.id, position: 'member' })
      }
    }

    // Quem avalia: o primeiro administrador (presidente), se existir
    const adminEmail = env.get('ADMIN_EMAIL')
    const evaluator = adminEmail ? await userService.findByEmail(adminEmail) : null

    let created = 0

    for (const [index, slot] of slots.entries()) {
      const firstName = pick(firstNames, index)
      const lastName = pick(lastNames, index + Math.floor(index / firstNames.length))
      const email = `${slug(firstName)}.${slug(lastName)}@${DEMO_EMAIL_DOMAIN}`

      if (await userService.findByEmail(email)) continue

      const user = await userService.create({
        fullName: `${firstName} ${lastName}`,
        email,
        password: DEMO_PASSWORD,
      })

      await membershipService.register({
        userId: user.id,
        directorateId: slot.directorateId,
        position: slot.position,
        startsAt: DateTime.now().minus({ months: index % 18 }),
      })

      // A própria pessoa preenche o perfil (ela sempre pode editar o seu)
      await profileService.update(user.id, user.id, demoProfile(index))

      if (evaluator) {
        const score = 5 + (index % 5) + (index % 2 ? 0.5 : 0)
        await profileService.updateTechnicalScore(evaluator.id, user.id, score)
      }

      created++
    }

    logger.info(
      `${created} pessoas de demonstração criadas (e-mails @${DEMO_EMAIL_DOMAIN}, senha ${DEMO_PASSWORD})`
    )
  }
}

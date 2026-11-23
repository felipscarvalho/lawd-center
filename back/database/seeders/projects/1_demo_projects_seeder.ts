import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import env from '#start/env'
import UserService from '#services/administration/user_service'
import MembershipService from '#services/administration/membership_service'
import ProjectService from '#services/projects/project_service'
import ProjectTeamService from '#services/projects/project_team_service'
import ProjectInterestService from '#services/projects/project_interest_service'
import { DEMO_EMAIL_DOMAIN } from '#database/seeders/administration/3_demo_members_seeder'
import type User from '#models/administration/user'
import type { ProjectPriority, ProjectStatus } from '#models/projects/project'

interface DemoProject {
  name: string
  description: string
  /** key da diretoria dona do projeto */
  directorate: string
  status: ProjectStatus
  priority: ProjectPriority | null
  /** Há quantos meses começou (nulo: ainda sem data) */
  startedMonthsAgo: number | null
  /** Pessoas na equipe além do coordenador (0: sem equipe) */
  teamSize: number
}

const demoProjects: DemoProject[] = [
  {
    name: 'Site da liga',
    description: 'Novo site institucional com projetos, membros e processo seletivo.',
    directorate: 'projects',
    status: 'in_progress',
    priority: 'high',
    startedMonthsAgo: 4,
    teamSize: 4,
  },
  {
    name: 'Calculadora de horas complementares',
    description: 'Ferramenta para os alunos acompanharem as horas complementares do curso.',
    directorate: 'projects',
    status: 'in_progress',
    priority: 'medium',
    startedMonthsAgo: 2,
    teamSize: 2,
  },
  {
    name: 'Landing page da semana de tecnologia',
    description: 'Página de inscrição e programação do evento.',
    directorate: 'events',
    status: 'in_progress',
    priority: 'low',
    startedMonthsAgo: 1,
    teamSize: 1,
  },
  {
    name: 'Identidade visual',
    description: 'Revisão da marca, paleta e modelos de posts.',
    directorate: 'marketing',
    status: 'finished',
    priority: null,
    startedMonthsAgo: 8,
    teamSize: 2,
  },
  {
    name: 'Painel de indicadores do RH',
    description: 'Acompanhamento de engajamento e permanência dos membros.',
    directorate: 'hr',
    status: 'suspended',
    priority: 'medium',
    startedMonthsAgo: 5,
    teamSize: 1,
  },
  {
    name: 'Plataforma de mentorias',
    description: 'Encontros entre membros experientes e iniciantes, com trilhas de estudo.',
    directorate: 'teaching',
    status: 'not_started',
    priority: 'high',
    startedMonthsAgo: null,
    teamSize: 0,
  },
  {
    name: 'Portal de documentos',
    description: 'Atas, regimento e modelos de documentos da liga num só lugar.',
    directorate: 'administrative',
    status: 'not_started',
    priority: null,
    startedMonthsAgo: null,
    teamSize: 0,
  },
]

/**
 * Projetos de demonstração para desenvolvimento, com equipes e interessados formados pelas pessoas
 * de demonstração (rode antes o seeder de pessoas). Só roda em desenvolvimento e só quando ainda
 * não há nenhum projeto (o nome não é único, então não dá para reconhecer um projeto já criado).
 */
export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    const userService = await app.container.make(UserService)
    const membershipService = await app.container.make(MembershipService)
    const projectService = await app.container.make(ProjectService)
    const teamService = await app.container.make(ProjectTeamService)
    const interestService = await app.container.make(ProjectInterestService)

    const existing = await projectService.list({ perPage: 1 })

    if (existing.items.length > 0) {
      logger.info('Já existem projetos; projetos de demonstração não criados')
      return
    }

    const adminEmail = env.get('ADMIN_EMAIL')
    const admin = adminEmail ? await userService.findByEmail(adminEmail) : null

    if (!admin) {
      logger.warn(
        'Administrador (ADMIN_EMAIL) não encontrado; rode os seeders de administração antes'
      )
      return
    }

    // Pessoas de demonstração de cada diretoria, na ordem do organograma
    const chart = await membershipService.organizationChart()
    const peopleOf = (key: string) =>
      (chart.find((directorate) => directorate.key === key)?.memberships ?? [])
        .map((membership) => membership.user)
        .filter((user) => user.email.endsWith(`@${DEMO_EMAIL_DOMAIN}`))
    const allPeople = [
      ...new Map(chart.flatMap((d) => peopleOf(d.key)).map((u) => [u.id, u])).values(),
    ]

    if (allPeople.length === 0) {
      logger.warn('Pessoas de demonstração não encontradas; rode o seeder de pessoas antes')
      return
    }

    const allocated = new Set<number>()
    // Próximas pessoas livres, preferindo as da diretoria do projeto
    const takeFree = (key: string, count: number): User[] => {
      const pool = [...peopleOf(key), ...allPeople].filter((user) => !allocated.has(user.id))
      const unique = [...new Map(pool.map((user) => [user.id, user])).values()].slice(0, count)

      unique.forEach((user) => allocated.add(user.id))

      return unique
    }

    for (const demo of demoProjects) {
      const directorate = chart.find((item) => item.key === demo.directorate)
      if (!directorate) continue

      const startsAt =
        demo.startedMonthsAgo === null
          ? null
          : DateTime.now().minus({ months: demo.startedMonthsAgo }).startOf('day')

      // Finalizado é criado em andamento e finalizado depois, para a equipe ficar no histórico
      const created = await projectService.create(admin.id, {
        name: demo.name,
        description: demo.description,
        directorateId: directorate.id,
        status: demo.status === 'finished' ? 'in_progress' : demo.status,
        priority: demo.priority,
        startsAt,
        expectedEndAt: startsAt?.plus({ months: 6 }) ?? null,
      })

      const team = demo.teamSize > 0 ? takeFree(demo.directorate, demo.teamSize + 1) : []

      if (team.length > 0) {
        const [coordinator, ...members] = team

        await teamService.add(admin.id, created.project.id, {
          userId: coordinator.id,
          role: 'coordinator',
          startsAt: startsAt ?? undefined,
        })

        for (const member of members) {
          await teamService.add(admin.id, created.project.id, {
            userId: member.id,
            role: 'member',
            startsAt: startsAt ?? undefined,
          })
        }
      }

      if (demo.status === 'finished') {
        await projectService.update(admin.id, created.project.id, {
          status: 'finished',
          endedAt: DateTime.now().minus({ months: 1 }).startOf('day'),
        })

        // Quem estava no projeto finalizado volta a ficar livre para outros projetos
        team.forEach((user) => allocated.delete(user.id))
      }
    }

    // Parte de quem ficou sem projeto marca interesse nos projetos ainda abertos
    const openProjects = await projectService.list({ perPage: 100 })
    const wanted = openProjects.items.filter((view) => view.project.status !== 'finished')
    const free = allPeople.filter((user) => !allocated.has(user.id))

    for (const [index, user] of free.entries()) {
      if (index % 3 === 2) continue

      const project = wanted[index % wanted.length].project
      await interestService.mark(user.id, project.id)
    }

    logger.info(`${demoProjects.length} projetos de demonstração criados`)
  }
}

import { inject } from '@adonisjs/core'
import Project, { projectPriorities, projectStatuses } from '#models/projects/project'
import ProjectMember from '#models/projects/project_member'
import ProjectInterest from '#models/projects/project_interest'
import UserService from '#services/administration/user_service'
import PermissionService from '#services/administration/permission_service'
import type { ProjectsAnalytics, RadarEntry } from '#dtos/projects/analytics'

/** Números da análise de projetos e radar de alocação (quem está fora das equipes) */
@inject()
export default class ProjectAnalyticsService {
  constructor(
    protected userService: UserService,
    protected permissionService: PermissionService
  ) {}

  async summary(): Promise<ProjectsAnalytics> {
    const [projects, activeMembers, allocatedIds] = await Promise.all([
      Project.query()
        .withCount('members', (members) =>
          members.withScopes((scopes) => scopes.active()).as('team_size')
        )
        .withCount('interests', (interests) => interests.as('interest_count'))
        .orderBy('name', 'asc'),
      this.userService.listActiveMembers(),
      this.allocatedUserIds(),
    ])

    const byStatus = Object.fromEntries(projectStatuses.map((status) => [status, 0])) as Record<
      (typeof projectStatuses)[number],
      number
    >
    const byPriority = Object.fromEntries(
      [...projectPriorities, 'none'].map((priority) => [priority, 0])
    ) as ProjectsAnalytics['byPriority']

    for (const project of projects) {
      byStatus[project.status]++
      if (!project.isFinished) byPriority[project.priority ?? 'none']++
    }

    const count = (project: Project, key: string) => Number(project.$extras[key] ?? 0)

    const teamSizes = projects
      .filter((project) => project.status === 'in_progress')
      .map((project) => ({ project, value: count(project, 'team_size') }))
      .sort((a, b) => b.value - a.value)

    const interests = projects
      .filter((project) => !project.isFinished && count(project, 'interest_count') > 0)
      .map((project) => ({ project, value: count(project, 'interest_count') }))
      .sort((a, b) => b.value - a.value)

    const allocatedPeople = activeMembers.filter((user) => allocatedIds.has(user.id)).length

    return {
      total: projects.length,
      byStatus,
      byPriority,
      allocatedPeople,
      unallocatedPeople: activeMembers.length - allocatedPeople,
      teamSizes,
      interests,
    }
  }

  /**
   * Pessoas ativas na liga fora de qualquer equipe, das mais disponíveis e maduras para as menos.
   * A nota técnica só vem para quem pode ver os dados privados da pessoa, e não entra na ordem
   * (para a posição na lista não revelar a nota de quem não pode vê-la).
   */
  async radar(actorId: number): Promise<RadarEntry[]> {
    const [activeMembers, allocatedIds] = await Promise.all([
      this.userService.listActiveMembers(),
      this.allocatedUserIds(),
    ])

    // A lista já vem das pessoas mais disponíveis e maduras para as menos
    const candidates = activeMembers.filter((user) => !allocatedIds.has(user.id))

    const candidateIds = candidates.map((user) => user.id)

    const [reachable, interests] = await Promise.all([
      this.permissionService.usersReachable(
        actorId,
        'administration.profile.view_private',
        candidateIds
      ),
      ProjectInterest.query()
        .whereIn('user_id', candidateIds)
        .whereHas('project', (project) => project.withScopes((scopes) => scopes.open()))
        .preload('project'),
    ])

    return candidates.map((user) => ({
      user,
      technicalScore: reachable.has(user.id) ? (user.profile?.technicalScore ?? null) : null,
      interestedProjects: interests
        .filter((interest) => interest.userId === user.id)
        .map((interest) => interest.project),
    }))
  }

  /** Quem está em alguma equipe agora */
  private async allocatedUserIds(): Promise<Set<number>> {
    const members = await ProjectMember.query()
      .withScopes((scopes) => scopes.active())
      .distinct('user_id')

    return new Set(members.map((member) => member.userId))
  }
}

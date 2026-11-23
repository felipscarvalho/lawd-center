import { inject } from '@adonisjs/core'
import ProjectInterest from '#models/projects/project_interest'
import ProjectMember from '#models/projects/project_member'
import ProjectService from '#services/projects/project_service'
import UserService from '#services/administration/user_service'
import BusinessRuleException from '#exceptions/administration/business_rule_exception'
import type { ProjectInterestView } from '#dtos/projects/project'

/** Interesse em participar de projetos: cada pessoa marca e desmarca o próprio */
@inject()
export default class ProjectInterestService {
  constructor(
    protected projectService: ProjectService,
    protected userService: UserService
  ) {}

  /** Interessados no projeto, do interesse mais antigo ao mais recente */
  async list(projectId: number): Promise<ProjectInterestView[]> {
    await this.projectService.find(projectId)

    const interests = await ProjectInterest.query()
      .where('project_id', projectId)
      .orderBy('created_at', 'asc')
      .orderBy('id', 'asc')

    const users = await this.userService.findMany(interests.map((interest) => interest.userId))
    const usersById = new Map(users.map((user) => [user.id, user]))

    return interests.map((interest) => ({ interest, user: usersById.get(interest.userId)! }))
  }

  /** Marca o interesse de quem está logado (repetir não duplica) */
  async mark(userId: number, projectId: number): Promise<void> {
    const project = await this.projectService.find(projectId)

    if (project.isFinished) {
      throw new BusinessRuleException(
        'Projetos finalizados não recebem interessados',
        'E_PROJECT_FINISHED'
      )
    }

    const membership = await ProjectMember.query()
      .withScopes((scopes) => scopes.active())
      .where('project_id', projectId)
      .where('user_id', userId)
      .first()

    if (membership) {
      throw new BusinessRuleException(
        'Você já está na equipe deste projeto',
        'E_ALREADY_IN_PROJECT'
      )
    }

    await ProjectInterest.firstOrCreate({ projectId, userId })
  }

  async unmark(userId: number, projectId: number): Promise<void> {
    await this.projectService.find(projectId)

    await ProjectInterest.query().where('project_id', projectId).where('user_id', userId).delete()
  }
}

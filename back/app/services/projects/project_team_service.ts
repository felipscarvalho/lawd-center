import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import ProjectMember from '#models/projects/project_member'
import ProjectInterest from '#models/projects/project_interest'
import type Project from '#models/projects/project'
import ProjectService from '#services/projects/project_service'
import UserService from '#services/administration/user_service'
import BusinessRuleException from '#exceptions/administration/business_rule_exception'
import ForbiddenException from '#exceptions/administration/forbidden_exception'
import type {
  AddProjectMemberInput,
  EndProjectMemberInput,
  ProjectMemberView,
  UserProjects,
} from '#dtos/projects/project'

const today = () => DateTime.now().startOf('day')

/**
 * Equipe dos projetos. Quem gerencia equipes do projeto adiciona e remove qualquer pessoa e define o
 * coordenador; o coordenador ativo adiciona e remove integrantes, mas não troca a coordenação.
 */
@inject()
export default class ProjectTeamService {
  constructor(
    protected projectService: ProjectService,
    protected userService: UserService
  ) {}

  /** Equipe com o histórico: ativos primeiro (coordenador antes), depois quem saiu, da saída mais recente */
  async history(projectId: number): Promise<ProjectMemberView[]> {
    await this.projectService.find(projectId)

    const members = await ProjectMember.query()
      .where('project_id', projectId)
      .orderByRaw(
        "CASE WHEN ends_at IS NULL AND role = 'coordinator' THEN 0 WHEN ends_at IS NULL THEN 1 ELSE 2 END"
      )
      .orderBy('ends_at', 'desc')
      .orderBy('starts_at', 'desc')
      .orderBy('id', 'desc')

    return this.toViews(members)
  }

  /**
   * Coloca a pessoa na equipe. Se ela já está no projeto com outro papel, a participação atual é
   * encerrada e outra é aberta (histórico preservado). Quem entra deixa de constar como interessado.
   */
  async add(
    actorId: number,
    projectId: number,
    input: AddProjectMemberInput
  ): Promise<ProjectMemberView> {
    const project = await this.projectService.find(projectId)

    await this.authorize(actorId, project, input.role)
    this.ensureTeamIsEditable(project)

    const user = await this.userService.find(input.userId)

    if (!user.isActive) {
      throw new BusinessRuleException(
        'Usuários desativados não podem entrar em projetos',
        'E_USER_INACTIVE',
        'userId'
      )
    }

    const startsAt = input.startsAt?.startOf('day') ?? today()

    const member = await db.transaction(async (trx) => {
      const current = await ProjectMember.query({ client: trx })
        .withScopes((scopes) => scopes.active())
        .where('project_id', project.id)
        .where('user_id', user.id)
        .first()

      if (current?.role === input.role) {
        throw new BusinessRuleException(
          'A pessoa já está na equipe com este papel',
          'E_ALREADY_IN_PROJECT',
          'userId'
        )
      }

      if (input.role === 'coordinator') {
        const coordinator = await ProjectMember.query({ client: trx })
          .withScopes((scopes) => scopes.active())
          .where('project_id', project.id)
          .where('role', 'coordinator')
          .first()

        if (coordinator) {
          throw new BusinessRuleException(
            'O projeto já tem um coordenador; tire-o da coordenação antes',
            'E_COORDINATOR_TAKEN',
            'role'
          )
        }
      }

      // Troca de papel: encerra a participação atual em vez de editá-la
      if (current) {
        if (startsAt < current.startsAt) {
          throw new BusinessRuleException(
            'O novo papel não pode começar antes da participação atual',
            'E_INVALID_DATES',
            'startsAt'
          )
        }

        current.endsAt = startsAt
        await current.useTransaction(trx).save()
      }

      await ProjectInterest.query({ client: trx })
        .where('project_id', project.id)
        .where('user_id', user.id)
        .delete()

      return ProjectMember.create(
        { projectId: project.id, userId: user.id, role: input.role, startsAt, endsAt: null },
        { client: trx }
      )
    })

    return { member, user }
  }

  /** Tira a pessoa da equipe (encerra a participação, que continua no histórico) */
  async end(
    actorId: number,
    projectMemberId: number,
    input: EndProjectMemberInput
  ): Promise<ProjectMemberView> {
    const member = await ProjectMember.findOrFail(projectMemberId)
    const project = await this.projectService.find(member.projectId)

    await this.authorize(actorId, project, member.role)
    this.ensureTeamIsEditable(project)

    if (!member.isActive) {
      throw new BusinessRuleException(
        'Esta pessoa já saiu da equipe',
        'E_PROJECT_MEMBER_ALREADY_ENDED'
      )
    }

    const endsAt = input.endsAt?.startOf('day') ?? today()

    if (endsAt < member.startsAt) {
      throw new BusinessRuleException(
        'A saída não pode ser anterior à entrada na equipe',
        'E_INVALID_DATES',
        'endsAt'
      )
    }

    member.endsAt = endsAt
    await member.save()

    const user = await this.userService.find(member.userId)

    return { member, user }
  }

  /** Projetos de uma pessoa: participações (ativas primeiro) e interesses em projetos abertos */
  async forUser(userId: number): Promise<UserProjects> {
    const user = await this.userService.find(userId)

    const [participations, interests] = await Promise.all([
      ProjectMember.query()
        .where('user_id', userId)
        .preload('project')
        .orderByRaw('CASE WHEN ends_at IS NULL THEN 0 ELSE 1 END')
        .orderBy('starts_at', 'desc')
        .orderBy('id', 'desc'),
      ProjectInterest.query()
        .where('user_id', userId)
        .whereHas('project', (project) => project.withScopes((scopes) => scopes.open()))
        .preload('project')
        .orderBy('created_at', 'desc'),
    ])

    return {
      participations: participations.map((member) => ({ member, user, project: member.project })),
      interests: interests.map((interest) => interest.project),
    }
  }

  /** Só projetos não iniciados ou em andamento mexem na equipe */
  private ensureTeamIsEditable(project: Project) {
    if (project.isTeamLocked) {
      throw new BusinessRuleException(
        'A equipe de projetos suspensos ou finalizados não pode ser alterada',
        'E_PROJECT_TEAM_LOCKED'
      )
    }
  }

  /** Definir ou tirar o coordenador é da gestão de equipes; integrantes, também do coordenador */
  private async authorize(actorId: number, project: Project, role: ProjectMember['role']) {
    if (role === 'member') {
      return this.projectService.authorize(actorId, project, 'canManageTeam')
    }

    if (!(await this.projectService.canManageTeams(actorId, project))) {
      throw new ForbiddenException()
    }
  }

  private async toViews(members: ProjectMember[]): Promise<ProjectMemberView[]> {
    const users = await this.userService.findMany(members.map((member) => member.userId))
    const usersById = new Map(users.map((user) => [user.id, user]))

    return members.map((member) => ({ member, user: usersById.get(member.userId)! }))
  }
}

import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { likeTerm } from '#helpers/search'
import Project from '#models/projects/project'
import ProjectMember from '#models/projects/project_member'
import ProjectInterest from '#models/projects/project_interest'
import DirectorateService from '#services/administration/directorate_service'
import PermissionService from '#services/administration/permission_service'
import UserService from '#services/administration/user_service'
import BusinessRuleException from '#exceptions/administration/business_rule_exception'
import ForbiddenException from '#exceptions/administration/forbidden_exception'
import type {
  CreateProjectInput,
  ListProjectsInput,
  ProjectAbilities,
  ProjectDetail,
  ProjectPage,
  ProjectView,
  UpdateProjectInput,
} from '#dtos/projects/project'

/** Projetos por página quando a lista não informa */
const defaultProjectsPerPage = 20

const today = () => DateTime.now().startOf('day')

/** Ordem de "atividade": em andamento, não iniciado, suspenso e finalizado */
const activityOrder =
  "CASE status WHEN 'in_progress' THEN 0 WHEN 'not_started' THEN 1 WHEN 'suspended' THEN 2 ELSE 3 END"

@inject()
export default class ProjectService {
  constructor(
    protected permissionService: PermissionService,
    protected userService: UserService,
    protected directorateService: DirectorateService
  ) {}

  /**
   * Página da lista de projetos, com filtros e ordem aplicados no banco. A busca procura no nome do
   * projeto e no nome/e-mail de quem está na equipe (as pessoas são buscadas via UserService).
   */
  async list(input: ListProjectsInput = {}): Promise<ProjectPage> {
    const query = this.query()

    if (input.status) query.where('status', input.status)
    if (input.priority) query.where('priority', input.priority)
    if (input.directorateId) query.where('directorate_id', input.directorateId)

    if (input.search) {
      const search = input.search
      const userIds = await this.userService.searchIds(search)
      const term = likeTerm(search)

      query.where((builder) => {
        builder.whereILike('name', term)

        if (userIds.length > 0) {
          builder.orWhereHas('members', (members) =>
            members.withScopes((scopes) => scopes.active()).whereIn('user_id', userIds)
          )
        }
      })
    }

    const sort = input.sort ?? 'activity'

    if (sort === 'activity') query.orderByRaw(activityOrder).orderBy('team_size', 'desc')
    if (sort === 'team') query.orderBy('team_size', 'desc')
    query.orderBy('name', 'asc').orderBy('id', 'asc')

    const page = await query.paginate(input.page ?? 1, input.perPage ?? defaultProjectsPerPage)
    const items = await this.toViews(page.all())

    return { items, meta: page.getMeta() }
  }

  /** Detalhe do projeto para quem consulta: dados, permissões e relação da pessoa com o projeto */
  async show(actorId: number, id: number): Promise<ProjectDetail> {
    const project = await this.query().where('id', id).firstOrFail()

    return this.toDetail(actorId, project)
  }

  async create(actorId: number, input: CreateProjectInput): Promise<ProjectDetail> {
    await this.directorateService.find(input.directorateId)
    await this.permissionService.authorize(actorId, 'projects.project.manage', input.directorateId)

    const status = input.status ?? 'not_started'
    const project = new Project()

    project.merge({
      name: input.name,
      description: input.description ?? null,
      status,
      priority: input.priority ?? null,
      directorateId: input.directorateId,
      startsAt: input.startsAt ?? null,
      expectedEndAt: input.expectedEndAt ?? null,
      endedAt: status === 'finished' ? (input.endedAt ?? today()) : null,
    })

    this.ensureValidDates(project)
    await project.save()

    return this.show(actorId, project.id)
  }

  /**
   * Edita o projeto. Mudar de diretoria exige permissão nas duas. Finalizar preenche a data de
   * término e encerra a equipe ativa nessa data; reabrir limpa a data de término.
   */
  async update(actorId: number, id: number, input: UpdateProjectInput): Promise<ProjectDetail> {
    const project = await Project.findOrFail(id)

    await this.permissionService.authorize(
      actorId,
      'projects.project.manage',
      project.directorateId
    )

    if (input.directorateId !== undefined && input.directorateId !== project.directorateId) {
      await this.directorateService.find(input.directorateId)
      await this.permissionService.authorize(
        actorId,
        'projects.project.manage',
        input.directorateId
      )
    }

    const wasFinished = project.isFinished

    project.merge({ ...input, endedAt: project.endedAt })

    if (project.isFinished) {
      project.endedAt = input.endedAt ?? (wasFinished ? project.endedAt : null) ?? today()
    } else {
      project.endedAt = null
    }

    this.ensureValidDates(project)

    await db.transaction(async (trx) => {
      await project.useTransaction(trx).save()

      // Ao finalizar, ninguém continua na equipe (a saída nunca fica antes da entrada)
      if (project.isFinished && !wasFinished) {
        await ProjectMember.query({ client: trx })
          .withScopes((scopes) => scopes.active())
          .where('project_id', project.id)
          .update({
            ends_at: db.raw('GREATEST(starts_at, ?::date)', [project.endedAt!.toSQLDate()]),
            updated_at: DateTime.now().toSQL(),
          })
      }
    })

    return this.show(actorId, project.id)
  }

  /** Projeto pelo id (404 se não existir), para os outros services do módulo */
  async find(id: number): Promise<Project> {
    return Project.findOrFail(id)
  }

  /**
   * O que a pessoa pode fazer no projeto: editar (gestão de projetos na diretoria do projeto ou
   * global) e gerenciar a equipe (o mesmo, a gestão de equipes, ou ser o coordenador ativo)
   */
  async abilities(actorId: number, project: Project): Promise<ProjectAbilities> {
    const [canEdit, canManageTeams, isCoordinator] = await Promise.all([
      this.permissionService.can(actorId, 'projects.project.manage', project.directorateId),
      this.canManageTeams(actorId, project),
      this.isActiveCoordinator(actorId, project.id),
    ])

    return { canEdit, canManageTeam: canEdit || canManageTeams || isCoordinator }
  }

  /** Gestão de equipes na diretoria do projeto (ou global): inclui definir o coordenador */
  async canManageTeams(actorId: number, project: Project): Promise<boolean> {
    return this.permissionService.can(actorId, 'projects.team.manage', project.directorateId)
  }

  /** Lança ForbiddenException quando a pessoa não tem a permissão no projeto */
  async authorize(actorId: number, project: Project, ability: keyof ProjectAbilities) {
    const abilities = await this.abilities(actorId, project)

    if (!abilities[ability]) {
      throw new ForbiddenException()
    }
  }

  /** Monta diretoria, coordenador e contagens de vários projetos (consultas em lote) */
  async toViews(projects: Project[]): Promise<ProjectView[]> {
    // `members` traz só o coordenador ativo (ver query()); pode não estar carregado
    const coordinatorOf = (project: Project) =>
      (project.$preloaded.members as ProjectMember[] | undefined)?.[0]?.userId
    const coordinatorIds = projects
      .map(coordinatorOf)
      .filter((id): id is number => id !== undefined)

    const [directorates, coordinators] = await Promise.all([
      this.directorateService.list(),
      this.userService.findMany(coordinatorIds),
    ])

    const directoratesById = new Map(directorates.map((item) => [item.id, item]))
    const usersById = new Map(coordinators.map((user) => [user.id, user]))

    return projects.map((project) => {
      const coordinatorId = coordinatorOf(project)

      return {
        project,
        directorate: directoratesById.get(project.directorateId)!,
        coordinator: coordinatorId ? (usersById.get(coordinatorId) ?? null) : null,
        teamSize: Number(project.$extras.team_size ?? 0),
        interestCount: Number(project.$extras.interest_count ?? 0),
      }
    })
  }

  private async toDetail(actorId: number, project: Project): Promise<ProjectDetail> {
    const [[view], abilities, membership, interest] = await Promise.all([
      this.toViews([project]),
      this.abilities(actorId, project),
      ProjectMember.query()
        .withScopes((scopes) => scopes.active())
        .where('project_id', project.id)
        .where('user_id', actorId)
        .first(),
      ProjectInterest.query().where('project_id', project.id).where('user_id', actorId).first(),
    ])

    return { ...view, abilities, isMember: membership !== null, isInterested: interest !== null }
  }

  /**
   * Consulta base: tamanho do time e interessados contados no banco, e o coordenador ativo
   * carregado em `members` (só ele, para montar a resposta)
   */
  private query() {
    return Project.query()
      .withCount('members', (members) =>
        members.withScopes((scopes) => scopes.active()).as('team_size')
      )
      .withCount('interests', (interests) => interests.as('interest_count'))
      .preload('members', (members) =>
        members.withScopes((scopes) => scopes.active()).where('role', 'coordinator')
      )
  }

  private async isActiveCoordinator(userId: number, projectId: number) {
    const coordinator = await ProjectMember.query()
      .withScopes((scopes) => scopes.active())
      .where('project_id', projectId)
      .where('user_id', userId)
      .where('role', 'coordinator')
      .first()

    return coordinator !== null
  }

  /** Previsão e término nunca antes do início */
  private ensureValidDates(project: Project) {
    const { startsAt, expectedEndAt, endedAt } = project

    if (startsAt && expectedEndAt && expectedEndAt < startsAt) {
      throw new BusinessRuleException(
        'A previsão de término não pode ser anterior ao início',
        'E_INVALID_DATES',
        'expectedEndAt'
      )
    }

    if (startsAt && endedAt && endedAt < startsAt) {
      throw new BusinessRuleException(
        'O término não pode ser anterior ao início',
        'E_INVALID_DATES',
        'endedAt'
      )
    }
  }
}

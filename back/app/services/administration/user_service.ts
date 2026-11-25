import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import User from '#models/administration/user'
import { maturityLevels, weeklyAvailabilities } from '#models/administration/profile'
import { likeTerm } from '#helpers/search'
import MembershipService from '#services/administration/membership_service'
import BusinessRuleException from '#exceptions/administration/business_rule_exception'
import type { CreateUserInput, ListUsersInput, UpdateUserInput } from '#dtos/administration/user'

/** Usuários por página quando a lista não informa */
const defaultUsersPerPage = 20

@inject()
export default class UserService {
  constructor(protected membershipService: MembershipService) {}

  /**
   * Página da lista de usuários, com o resumo do perfil e os cargos ativos (com a diretoria).
   * Os filtros são aplicados no banco, para a contagem de páginas bater com o que foi filtrado.
   */
  async list(input: ListUsersInput = {}): Promise<ModelPaginatorContract<User>> {
    const query = User.query()
      .preload('profile')
      .preload('memberships', (memberships) =>
        memberships
          .withScopes((scopes) => scopes.active())
          .preload('directorate')
          .orderBy('starts_at', 'asc')
      )
      .orderBy('full_name', 'asc')
      .orderBy('id', 'asc')

    if (input.active === true) query.whereNull('deactivated_at')
    if (input.active === false) query.whereNotNull('deactivated_at')

    if (input.search) {
      const term = likeTerm(input.search)
      query.where((search) => search.whereILike('full_name', term).orWhereILike('email', term))
    }

    if (input.directorateId) {
      const directorateId = input.directorateId
      query.whereHas('memberships', (memberships) =>
        memberships.withScopes((scopes) => scopes.active()).where('directorate_id', directorateId)
      )
    }

    if (input.course) {
      const course = input.course
      query.whereHas('profile', (profile) => profile.where('course', course))
    }

    return query.paginate(input.page ?? 1, input.perPage ?? defaultUsersPerPage)
  }

  /** Usuários pelos ids, com o perfil (para outros módulos montarem pessoas nas respostas) */
  async findMany(ids: number[]): Promise<User[]> {
    if (ids.length === 0) return []

    return User.query()
      .whereIn('id', [...new Set(ids)])
      .preload('profile')
  }

  /** Ids dos usuários cujo nome ou e-mail contém o termo (busca de outros módulos) */
  async searchIds(search: string): Promise<number[]> {
    const term = likeTerm(search)

    const users = await User.query()
      .select('id')
      .where((query) => query.whereILike('full_name', term).orWhereILike('email', term))

    return users.map((user) => user.id)
  }

  /**
   * Pessoas ativas na liga (usuário ativo com algum cargo ativo), com perfil, tecnologias, áreas de
   * interesse e cargos ativos. Base de levantamentos como o radar de alocação em projetos: vêm das
   * mais disponíveis e maduras para as menos (perfil não preenchido por último), depois por nome.
   */
  async listActiveMembers(): Promise<User[]> {
    const users = await User.query()
      .whereNull('deactivated_at')
      .whereHas('memberships', (memberships) => memberships.withScopes((scopes) => scopes.active()))
      .preload('profile')
      .preload('technologies', (query) => query.orderBy('name', 'asc'))
      .preload('interestAreas', (query) => query.orderBy('name', 'asc'))
      .preload('memberships', (memberships) =>
        memberships.withScopes((scopes) => scopes.active()).preload('directorate')
      )
      .orderBy('full_name', 'asc')

    const rank = <T>(list: readonly T[], value: T | null | undefined) =>
      value ? list.indexOf(value) : -1

    // Ordenação estável: empates mantêm a ordem por nome da consulta
    return users.sort(
      (a, b) =>
        rank(weeklyAvailabilities, b.profile?.weeklyAvailability) -
          rank(weeklyAvailabilities, a.profile?.weeklyAvailability) ||
        rank(maturityLevels, b.profile?.maturity) - rank(maturityLevels, a.profile?.maturity)
    )
  }

  async find(id: number): Promise<User> {
    return User.query().where('id', id).preload('profile').firstOrFail()
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findBy('email', email.toLowerCase())
  }

  /** Usuário já com senha, sem convite (seeder do primeiro administrador); a tela usa o convite */
  async create(input: CreateUserInput): Promise<User> {
    return User.create({ ...input, email: input.email.toLowerCase() })
  }

  async update(id: number, input: UpdateUserInput): Promise<User> {
    const user = await User.findOrFail(id)

    // Senha de quem ainda não aceitou o convite é criada pela própria pessoa, pelo link do e-mail
    if (input.password && user.isPending) {
      throw new BusinessRuleException(
        'Esta pessoa ainda não aceitou o convite. Reenvie o convite para ela criar a senha.',
        'E_USER_PENDING',
        'password'
      )
    }

    user.merge({ ...input, ...(input.email ? { email: input.email.toLowerCase() } : {}) })
    await user.save()

    return user
  }

  /**
   * Desativa o usuário: bloqueia o login, encerra todos os vínculos ativos e revoga os tokens.
   * O usuário e o histórico permanecem no banco.
   */
  async deactivate(actorId: number, id: number): Promise<User> {
    if (actorId === id) {
      throw new BusinessRuleException(
        'Você não pode desativar o próprio usuário',
        'E_SELF_DEACTIVATION'
      )
    }

    const user = await User.findOrFail(id)

    if (!user.isActive) {
      throw new BusinessRuleException('Este usuário já está desativado', 'E_USER_ALREADY_INACTIVE')
    }

    await db.transaction(async (trx) => {
      user.deactivatedAt = DateTime.now()
      await user.useTransaction(trx).save()
      await this.membershipService.endAllActiveForUser(user.id, trx)
    })

    for (const token of await User.accessTokens.all(user)) {
      await User.accessTokens.delete(user, token.identifier)
    }

    return user
  }
}

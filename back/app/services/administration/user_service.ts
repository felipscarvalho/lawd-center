import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import User from '#models/administration/user'
import MembershipService from '#services/administration/membership_service'
import BusinessRuleException from '#exceptions/administration/business_rule_exception'
import type { CreateUserInput, ListUsersInput, UpdateUserInput } from '#dtos/administration/user'

@inject()
export default class UserService {
  constructor(protected membershipService: MembershipService) {}

  /** Lista com o resumo do perfil e os cargos ativos (com a diretoria), para a tabela de usuários */
  async list(input: ListUsersInput = {}): Promise<User[]> {
    const query = User.query()
      .preload('profile')
      .preload('memberships', (memberships) =>
        memberships
          .withScopes((scopes) => scopes.active())
          .preload('directorate')
          .orderBy('starts_at', 'asc')
      )
      .orderBy('full_name', 'asc')

    if (input.active === true) query.whereNull('deactivated_at')
    if (input.active === false) query.whereNotNull('deactivated_at')

    return query
  }

  async find(id: number): Promise<User> {
    return User.query().where('id', id).preload('profile').firstOrFail()
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findBy('email', email.toLowerCase())
  }

  async create(input: CreateUserInput): Promise<User> {
    return User.create({ ...input, email: input.email.toLowerCase() })
  }

  async update(id: number, input: UpdateUserInput): Promise<User> {
    const user = await User.findOrFail(id)

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

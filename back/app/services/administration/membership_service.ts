import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Membership from '#models/administration/membership'
import Directorate from '#models/administration/directorate'
import User from '#models/administration/user'
import PermissionService from '#services/administration/permission_service'
import BusinessRuleException from '#exceptions/administration/business_rule_exception'
import ForbiddenException from '#exceptions/administration/forbidden_exception'
import {
  corePositions,
  directoratePositions,
  positionLabels,
  positionRank,
  type Position,
} from '#permissions/positions'
import type { AssignMembershipInput, EndMembershipInput } from '#dtos/administration/membership'

const today = () => DateTime.now().startOf('day')

@inject()
export default class MembershipService {
  constructor(protected permissionService: PermissionService) {}

  /**
   * Organograma atual: diretorias (núcleo primeiro) com os vínculos ativos,
   * ordenados pela hierarquia do cargo e pelo nome.
   */
  async organizationChart(): Promise<Directorate[]> {
    const directorates = await Directorate.query()
      .preload('memberships', (query) =>
        query
          .withScopes((scopes) => scopes.active())
          .preload('user', (user) => user.preload('profile'))
      )
      .orderByRaw("CASE WHEN kind = 'core' THEN 0 ELSE 1 END")
      .orderBy('name', 'asc')

    for (const directorate of directorates) {
      directorate.memberships.sort(
        (a, b) =>
          positionRank[a.position] - positionRank[b.position] ||
          a.user.fullName.localeCompare(b.user.fullName)
      )
    }

    return directorates
  }

  /** Histórico completo de vínculos do usuário, do mais recente para o mais antigo */
  /** Do mais recente ao mais antigo; no mesmo dia, o vínculo cadastrado por último vem primeiro */
  async historyForUser(userId: number): Promise<Membership[]> {
    await User.findOrFail(userId)

    return Membership.query()
      .where('user_id', userId)
      .preload('directorate')
      .orderBy('starts_at', 'desc')
      .orderBy('id', 'desc')
  }

  /**
   * Atribui um cargo, verificando a permissão de quem atribui:
   * - permissão global de gestão: qualquer cargo em qualquer diretoria
   * - permissão de gestão na diretoria (diretor): apenas membros efetivos da própria diretoria
   */
  async assign(actorId: number, input: AssignMembershipInput): Promise<Membership> {
    await this.authorizeManagement(actorId, input.directorateId, input.position)

    const membership = await this.register(input)
    await membership.load('directorate')

    return membership
  }

  /**
   * Cria o vínculo sem verificar permissão de quem atribui (uso interno e seeders).
   * Se o usuário já tem vínculo ativo na mesma diretoria, ele é encerrado e substituído (troca de cargo).
   */
  async register(input: AssignMembershipInput): Promise<Membership> {
    const user = await User.findOrFail(input.userId)

    if (!user.isActive) {
      throw new BusinessRuleException(
        'Usuários desativados não podem receber cargos',
        'E_USER_INACTIVE'
      )
    }

    const directorate = await Directorate.findOrFail(input.directorateId)

    this.ensurePositionFitsDirectorate(input.position, directorate)

    const startsAt = input.startsAt?.startOf('day') ?? today()

    return db.transaction(async (trx) => {
      const current = await Membership.query({ client: trx })
        .withScopes((scopes) => scopes.active())
        .where('user_id', user.id)
        .where('directorate_id', directorate.id)
        .first()

      if (current?.position === input.position) {
        throw new BusinessRuleException(
          `O usuário já é ${positionLabels[input.position].toLowerCase()} nesta diretoria`,
          'E_ALREADY_IN_POSITION'
        )
      }

      await this.ensurePositionIsAvailable(input.position, directorate, current?.id ?? null, trx)

      // Troca de cargo: encerra o vínculo atual em vez de editá-lo, preservando o histórico
      if (current) {
        if (startsAt < current.startsAt) {
          throw new BusinessRuleException(
            'O novo cargo não pode começar antes do cargo atual',
            'E_INVALID_DATES'
          )
        }

        current.endsAt = startsAt
        await current.useTransaction(trx).save()
      }

      return Membership.create(
        {
          userId: user.id,
          directorateId: directorate.id,
          position: input.position,
          startsAt,
          endsAt: null,
        },
        { client: trx }
      )
    })
  }

  /** Encerra um vínculo, com as mesmas regras de permissão da atribuição */
  async end(actorId: number, membershipId: number, input: EndMembershipInput): Promise<Membership> {
    const membership = await Membership.findOrFail(membershipId)

    await this.authorizeManagement(actorId, membership.directorateId, membership.position)

    if (!membership.isActive) {
      throw new BusinessRuleException('Este vínculo já foi encerrado', 'E_MEMBERSHIP_ALREADY_ENDED')
    }

    const endsAt = input.endsAt?.startOf('day') ?? today()

    if (endsAt < membership.startsAt) {
      throw new BusinessRuleException(
        'O término não pode ser anterior ao início do vínculo',
        'E_INVALID_DATES'
      )
    }

    membership.endsAt = endsAt
    await membership.save()
    await membership.load('directorate')

    return membership
  }

  /** Encerra todos os vínculos ativos do usuário (usado na desativação) */
  async endAllActiveForUser(userId: number, trx?: TransactionClientContract): Promise<void> {
    await Membership.query({ client: trx })
      .withScopes((scopes) => scopes.active())
      .where('user_id', userId)
      .update({ ends_at: today().toSQLDate(), updated_at: DateTime.now().toSQL() })
  }

  private async authorizeManagement(actorId: number, directorateId: number, position: Position) {
    if (await this.permissionService.canGlobally(actorId, 'administration.membership.manage')) {
      return
    }

    // Permissão restrita à diretoria (diretor): só gerencia membros efetivos da própria diretoria
    const canInDirectorate = await this.permissionService.can(
      actorId,
      'administration.membership.manage',
      directorateId
    )

    if (!canInDirectorate || position !== 'member') {
      throw new ForbiddenException()
    }
  }

  /** Cargos do núcleo só no núcleo institucional; diretor e membro só nas diretorias comuns */
  private ensurePositionFitsDirectorate(position: Position, directorate: Directorate) {
    const allowed = directorate.kind === 'core' ? corePositions : directoratePositions

    if (!allowed.includes(position)) {
      throw new BusinessRuleException(
        `O cargo ${positionLabels[position].toLowerCase()} não existe em ${directorate.name}`,
        'E_POSITION_NOT_ALLOWED'
      )
    }
  }

  /** Cargos únicos: presidente, vice e secretário-geral (um no total) e diretor (um por diretoria) */
  private async ensurePositionIsAvailable(
    position: Position,
    directorate: Directorate,
    replacingMembershipId: number | null,
    trx: TransactionClientContract
  ) {
    if (position === 'member') return

    const query = Membership.query({ client: trx })
      .withScopes((scopes) => scopes.active())
      .where('position', position)

    if (position === 'director') query.where('directorate_id', directorate.id)
    if (replacingMembershipId) query.whereNot('id', replacingMembershipId)

    if (await query.first()) {
      throw new BusinessRuleException(
        position === 'director'
          ? `${directorate.name} já tem um diretor ativo; encerre o vínculo atual antes`
          : `Já existe um ${positionLabels[position].toLowerCase()} ativo; encerre o vínculo atual antes`,
        'E_POSITION_TAKEN'
      )
    }
  }
}

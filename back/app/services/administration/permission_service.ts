import Membership from '#models/administration/membership'
import ForbiddenException from '#exceptions/administration/forbidden_exception'
import { directoratePositionPermissions, positionPermissions } from '#permissions/positions'
import type { PermissionKey } from '#permissions/index'
import type { EffectivePermission } from '#dtos/administration/permission'

/**
 * Resolve as permissões de um usuário a partir dos vínculos ativos:
 * vínculo ativo → cargo → permissões do mapa em app/permissions/positions.ts, mais as extras do cargo
 * naquela diretoria (directoratePositionPermissions). Permissões com escopo "directorate" valem só na
 * diretoria do vínculo.
 */
export default class PermissionService {
  async getEffectivePermissions(userId: number): Promise<EffectivePermission[]> {
    const memberships = await Membership.query()
      .withScopes((scopes) => scopes.active())
      .where('user_id', userId)
      .preload('directorate')

    const result = new Map<string, EffectivePermission>()

    for (const membership of memberships) {
      const grants = [
        ...(positionPermissions[membership.position] ?? []),
        ...(directoratePositionPermissions[membership.directorate.key]?.[membership.position] ??
          []),
      ]

      for (const grant of grants) {
        const directorateId = grant.scope === 'directorate' ? membership.directorateId : null
        // Evita duplicar a mesma permissão no mesmo escopo vinda de vínculos diferentes
        result.set(`${grant.permission}:${directorateId ?? 'global'}`, {
          permission: grant.permission,
          scope: grant.scope,
          directorateId,
        })
      }
    }

    return [...result.values()]
  }

  /**
   * Verifica se o usuário tem a permissão.
   * - Sem directorateId: só aceita a permissão em escopo global
   * - Com directorateId: aceita global ou concedida naquela diretoria
   */
  async can(userId: number, permission: PermissionKey, directorateId?: number): Promise<boolean> {
    const effective = await this.getEffectivePermissions(userId)

    return effective.some(
      (item) =>
        item.permission === permission &&
        (item.scope === 'global' ||
          (directorateId !== undefined && item.directorateId === directorateId))
    )
  }

  /** Verifica se o usuário tem a permissão em algum escopo (global ou em qualquer diretoria) */
  async canAnywhere(userId: number, permission: PermissionKey): Promise<boolean> {
    const effective = await this.getEffectivePermissions(userId)

    return effective.some((item) => item.permission === permission)
  }

  /** Verifica se o usuário tem a permissão em escopo global */
  async canGlobally(userId: number, permission: PermissionKey): Promise<boolean> {
    return this.can(userId, permission)
  }

  /**
   * Verifica a permissão sobre outra pessoa: vale se for global ou se tiver sido concedida
   * numa diretoria onde a pessoa alvo tem vínculo ativo (ex.: diretor sobre os membros da diretoria).
   */
  async canOnUser(
    actorId: number,
    permission: PermissionKey,
    targetUserId: number
  ): Promise<boolean> {
    const allPermissions = await this.getEffectivePermissions(actorId)
    const effective = allPermissions.filter((item) => item.permission === permission)

    if (effective.some((item) => item.scope === 'global')) return true

    const scopedDirectorateIds = effective
      .map((item) => item.directorateId)
      .filter((id): id is number => id !== null)

    if (scopedDirectorateIds.length === 0) return false

    const targetMembership = await Membership.query()
      .withScopes((scopes) => scopes.active())
      .where('user_id', targetUserId)
      .whereIn('directorate_id', scopedDirectorateIds)
      .first()

    return targetMembership !== null
  }

  /**
   * Mesma regra de `canOnUser`, em lote: entre as pessoas informadas, as que o usuário alcança com a
   * permissão (evita uma consulta por pessoa em listas)
   */
  async usersReachable(
    actorId: number,
    permission: PermissionKey,
    targetUserIds: number[]
  ): Promise<Set<number>> {
    const allPermissions = await this.getEffectivePermissions(actorId)
    const effective = allPermissions.filter((item) => item.permission === permission)

    if (effective.some((item) => item.scope === 'global')) return new Set(targetUserIds)

    const scopedDirectorateIds = effective
      .map((item) => item.directorateId)
      .filter((id): id is number => id !== null)

    if (scopedDirectorateIds.length === 0 || targetUserIds.length === 0) return new Set()

    const memberships = await Membership.query()
      .withScopes((scopes) => scopes.active())
      .whereIn('user_id', targetUserIds)
      .whereIn('directorate_id', scopedDirectorateIds)

    return new Set(memberships.map((membership) => membership.userId))
  }

  /** Igual a `can`, mas lança ForbiddenException quando não pode */
  async authorize(
    userId: number,
    permission: PermissionKey,
    directorateId?: number
  ): Promise<void> {
    if (!(await this.can(userId, permission, directorateId))) {
      throw new ForbiddenException()
    }
  }
}

import Membership from '#models/administration/membership'
import ForbiddenException from '#exceptions/administration/forbidden_exception'
import { positionPermissions } from '#permissions/positions'
import type { PermissionKey } from '#permissions/index'
import type { EffectivePermission } from '#dtos/administration/permission'

/**
 * Resolve as permissões de um usuário a partir dos vínculos ativos:
 * vínculo ativo → cargo → permissões do mapa em app/permissions/positions.ts.
 * Permissões com escopo "directorate" valem só na diretoria do vínculo.
 */
export default class PermissionService {
  async getEffectivePermissions(userId: number): Promise<EffectivePermission[]> {
    const memberships = await Membership.query()
      .withScopes((scopes) => scopes.active())
      .where('user_id', userId)

    const result = new Map<string, EffectivePermission>()

    for (const membership of memberships) {
      for (const grant of positionPermissions[membership.position] ?? []) {
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

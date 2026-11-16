import type { PermissionKey, PermissionScope } from '#permissions/index'

/** Permissão que um usuário possui, derivada de um vínculo ativo */
export interface EffectivePermission {
  permission: PermissionKey
  scope: PermissionScope
  /** Diretoria onde a permissão vale; nulo quando o escopo é global */
  directorateId: number | null
}

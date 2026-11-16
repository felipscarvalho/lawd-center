import { administrationPermissions } from '#permissions/administration'
import type { PermissionKey, PermissionScope } from '#permissions/index'

/**
 * Cargos da liga. Ficam no código (e não no banco) porque o mapa de permissões depende deles.
 * A coluna memberships.position guarda um destes valores.
 */
export const positions = [
  'president',
  'vice_president',
  'general_secretary',
  'director',
  'member',
] as const

export type Position = (typeof positions)[number]

export const positionLabels: Record<Position, string> = {
  president: 'Presidente',
  vice_president: 'Vice-presidente',
  general_secretary: 'Secretário-geral',
  director: 'Diretor',
  member: 'Membro efetivo',
}

/** Ordem hierárquica (menor = mais alto), usada para ordenar o organograma */
export const positionRank: Record<Position, number> = {
  president: 1,
  vice_president: 2,
  general_secretary: 3,
  director: 4,
  member: 5,
}

/** Cargos do núcleo institucional: só existem no CORP e têm um único ocupante ativo */
export const corePositions: readonly Position[] = [
  'president',
  'vice_president',
  'general_secretary',
]

/** Cargos das diretorias comuns */
export const directoratePositions: readonly Position[] = ['director', 'member']

export interface PermissionGrant {
  permission: PermissionKey
  scope: PermissionScope
}

const global = (...keys: PermissionKey[]): PermissionGrant[] =>
  keys.map((permission) => ({ permission, scope: 'global' }))

const inDirectorate = (...keys: PermissionKey[]): PermissionGrant[] =>
  keys.map((permission) => ({ permission, scope: 'directorate' }))

/** Leitura comum a todos os membros: usuários, diretorias e organograma */
const baseView = global(
  'administration.user.view',
  'administration.directorate.view',
  'administration.membership.view'
)

/** Administradores gerais (presidente, vice e secretário-geral): todo o módulo administration */
const administrationAdmin = global(...(Object.keys(administrationPermissions) as PermissionKey[]))

/**
 * Mapa cargo → permissões. As permissões efetivas de um usuário são a soma das concedidas
 * pelos cargos dos seus vínculos ativos.
 */
export const positionPermissions: Record<Position, PermissionGrant[]> = {
  president: administrationAdmin,
  vice_president: administrationAdmin,
  general_secretary: administrationAdmin,
  // Diretor gerencia os membros da própria diretoria
  director: [...baseView, ...inDirectorate('administration.membership.manage')],
  member: baseView,
}

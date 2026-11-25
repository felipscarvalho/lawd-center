import { administrationPermissions } from '#permissions/administration'
import { projectsPermissions } from '#permissions/projects'
import type { PermissionKey, PermissionScope } from '#permissions/index'

/**
 * Cargos da liga. Ficam no código (e não no banco) porque o mapa de permissões depende deles.
 * A coluna memberships.position guarda um destes valores.
 */
export const positions = [
  'president',
  'vice_president',
  'general_secretary',
  'counselor',
  'director',
  'member',
] as const

export type Position = (typeof positions)[number]

export const positionLabels: Record<Position, string> = {
  president: 'Presidente',
  vice_president: 'Vice-presidente',
  general_secretary: 'Secretário-geral',
  counselor: 'Conselheiro',
  director: 'Diretor',
  member: 'Membro efetivo',
}

/** Ordem hierárquica (menor = mais alto), usada para ordenar o organograma */
export const positionRank: Record<Position, number> = {
  president: 1,
  vice_president: 2,
  general_secretary: 3,
  counselor: 4,
  director: 5,
  member: 6,
}

/** Cargos do núcleo institucional: só existem no CORP */
export const corePositions: readonly Position[] = [
  'president',
  'vice_president',
  'general_secretary',
  'counselor',
]

/**
 * Cargos com vários ocupantes ativos ao mesmo tempo. Os demais são únicos: presidente, vice e
 * secretário-geral (um no total) e diretor (um por diretoria)
 */
export const sharedPositions: readonly Position[] = ['counselor', 'member']

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

/** Leitura comum a todos os membros: usuários, diretorias, organograma e projetos */
const baseView = global(
  'administration.user.view',
  'administration.directorate.view',
  'administration.membership.view',
  'administration.profile.view',
  'projects.project.view'
)

/** Administradores gerais (presidente, vice, secretário-geral e conselheiros): todos os módulos */
const generalAdmin = global(
  ...(Object.keys(administrationPermissions) as PermissionKey[]),
  ...(Object.keys(projectsPermissions) as PermissionKey[])
)

/**
 * Mapa cargo → permissões. As permissões efetivas de um usuário são a soma das concedidas
 * pelos cargos dos seus vínculos ativos.
 */
export const positionPermissions: Record<Position, PermissionGrant[]> = {
  president: generalAdmin,
  vice_president: generalAdmin,
  general_secretary: generalAdmin,
  // Conselheiro tem as mesmas permissões do restante do CORP
  counselor: generalAdmin,
  // Diretor gerencia os membros e os projetos da própria diretoria
  director: [
    ...baseView,
    ...inDirectorate(
      'administration.membership.manage',
      'administration.profile.view_private',
      'administration.profile.update',
      'administration.profile.evaluate',
      'projects.project.manage',
      'projects.team.manage'
    ),
  ],
  member: baseView,
}

/**
 * Permissões extras de um cargo numa diretoria específica, pela `key` da diretoria. Somam-se às do
 * mapa acima quando a pessoa ocupa aquele cargo naquela diretoria.
 */
export const directoratePositionPermissions: Partial<
  Record<string, Partial<Record<Position, PermissionGrant[]>>>
> = {
  // O diretor de Projetos gerencia os projetos de todas as diretorias
  projects: { director: global('projects.project.manage', 'projects.team.manage') },
  // O diretor de RH cadastra usuários (convite por e-mail) e reenvia convites pendentes
  hr: { director: global('administration.user.create') },
}

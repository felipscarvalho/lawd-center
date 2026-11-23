import { administrationPermissions } from '#permissions/administration'
import { projectsPermissions } from '#permissions/projects'

/**
 * Catálogo completo de permissões da aplicação: único lugar onde permissões existem.
 * Cada módulo define o próprio catálogo em app/permissions/<module>.ts e é registrado aqui.
 */
export const permissions = {
  ...administrationPermissions,
  ...projectsPermissions,
} as const

export type PermissionKey = keyof typeof permissions

export const permissionKeys = Object.keys(permissions) as PermissionKey[]

/**
 * Alcance de uma permissão concedida por um cargo:
 * - global: vale para o sistema todo
 * - directorate: vale apenas dentro da diretoria do vínculo que a concedeu
 */
export type PermissionScope = 'global' | 'directorate'

import { ProjectMemberSchema } from '#database/schema'
import { belongsTo, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Project from '#models/projects/project'

export const projectRoles = ['coordinator', 'member'] as const

export type ProjectRole = (typeof projectRoles)[number]

export const projectRoleLabels: Record<ProjectRole, string> = {
  coordinator: 'Coordenador',
  member: 'Integrante',
}

/**
 * Participação de uma pessoa na equipe de um projeto, por um período (ends_at nulo = ativa).
 * Trocar o papel encerra a participação e abre outra, preservando o histórico.
 */
export default class ProjectMember extends ProjectMemberSchema {
  declare role: ProjectRole

  @belongsTo(() => Project)
  declare project: BelongsTo<typeof Project>

  get isActive() {
    return this.endsAt === null
  }

  /** Apenas participações ativas */
  static active = scope((query) => {
    query.whereNull('ends_at')
  })
}

import { ProjectSchema } from '#database/schema'
import { hasMany, scope } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ProjectMember from '#models/projects/project_member'
import ProjectInterest from '#models/projects/project_interest'

export const projectStatuses = ['not_started', 'in_progress', 'suspended', 'finished'] as const

export type ProjectStatus = (typeof projectStatuses)[number]

export const projectPriorities = ['high', 'medium', 'low'] as const

export type ProjectPriority = (typeof projectPriorities)[number]

/**
 * Projeto da liga, sempre de uma diretoria (directorate_id). A equipe e os interessados ficam em
 * project_members e project_interests; pessoas e diretorias são lidas pelos services de administration.
 */
export default class Project extends ProjectSchema {
  declare status: ProjectStatus
  declare priority: ProjectPriority | null

  @hasMany(() => ProjectMember)
  declare members: HasMany<typeof ProjectMember>

  @hasMany(() => ProjectInterest)
  declare interests: HasMany<typeof ProjectInterest>

  get isFinished() {
    return this.status === 'finished'
  }

  /** Equipe travada: projetos suspensos ou finalizados não recebem nem perdem integrantes */
  get isTeamLocked() {
    return this.status === 'suspended' || this.status === 'finished'
  }

  /** Projetos que ainda podem receber pessoas e interessados */
  static open = scope((query) => {
    query.whereNot('status', 'finished')
  })
}

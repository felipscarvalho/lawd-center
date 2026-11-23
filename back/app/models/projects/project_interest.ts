import { ProjectInterestSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Project from '#models/projects/project'

/** Interesse de uma pessoa em participar de um projeto, marcado por ela mesma */
export default class ProjectInterest extends ProjectInterestSchema {
  @belongsTo(() => Project)
  declare project: BelongsTo<typeof Project>
}

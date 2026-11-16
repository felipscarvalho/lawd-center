import { DirectorateSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Membership from '#models/administration/membership'

export const directorateKinds = ['core', 'standard'] as const

/** core: núcleo institucional (CORP); standard: diretorias comuns */
export type DirectorateKind = (typeof directorateKinds)[number]

export default class Directorate extends DirectorateSchema {
  declare kind: DirectorateKind

  @hasMany(() => Membership)
  declare memberships: HasMany<typeof Membership>
}

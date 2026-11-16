import type { DateTime } from 'luxon'
import type { Position } from '#permissions/positions'

export interface AssignMembershipInput {
  userId: number
  directorateId: number
  position: Position
  /** Data de início; padrão: hoje */
  startsAt?: DateTime
}

export interface EndMembershipInput {
  /** Data de término; padrão: hoje */
  endsAt?: DateTime
}

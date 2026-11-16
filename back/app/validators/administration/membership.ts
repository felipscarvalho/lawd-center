import vine from '@vinejs/vine'
import { positions } from '#permissions/positions'

export const assignMembershipValidator = vine.create({
  userId: vine.number().withoutDecimals().positive(),
  directorateId: vine.number().withoutDecimals().positive(),
  position: vine.enum(positions),
  startsAt: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
})

export const endMembershipValidator = vine.create({
  endsAt: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
})

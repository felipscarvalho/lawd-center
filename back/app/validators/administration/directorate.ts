import vine from '@vinejs/vine'
import { directorateKinds } from '#models/administration/directorate'

export const createDirectorateValidator = vine.create({
  // Chave estável em snake_case, usada pelo código (ex.: projects, hr)
  key: vine
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]*$/)
    .maxLength(50)
    .unique({ table: 'directorates', column: 'key' }),
  name: vine.string().trim().minLength(2).maxLength(255),
  kind: vine.enum(directorateKinds),
})

export const updateDirectorateValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(255).optional(),
})

import vine from '@vinejs/vine'
import { courses } from '#models/administration/profile'

const email = () => vine.string().trim().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(72)

/** Máximo de usuários por página */
export const maxUsersPerPage = 100

/** Filtros e página da lista; a busca procura no nome e no e-mail */
export const listUsersValidator = vine.create({
  active: vine.boolean().optional(),
  search: vine.string().trim().maxLength(100).optional(),
  directorateId: vine.number().positive().withoutDecimals().optional(),
  course: vine.enum(courses).optional(),
  page: vine.number().positive().withoutDecimals().optional(),
  perPage: vine.number().positive().withoutDecimals().max(maxUsersPerPage).optional(),
})

export const createUserValidator = vine.create({
  fullName: vine.string().trim().minLength(3).maxLength(255),
  email: email().unique({ table: 'users', column: 'email', caseInsensitive: true }),
  password: password(),
})

/** O e-mail precisa ser único, ignorando o próprio usuário que está sendo editado */
export const updateUserValidator = vine.withMetaData<{ userId: number }>().create({
  fullName: vine.string().trim().minLength(3).maxLength(255).optional(),
  email: email()
    .unique({
      table: 'users',
      column: 'email',
      caseInsensitive: true,
      filter: (query, _, field) => {
        query.whereNot('id', field.meta.userId)
      },
    })
    .optional(),
  password: password().optional(),
})

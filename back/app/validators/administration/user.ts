import vine from '@vinejs/vine'

const email = () => vine.string().trim().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(72)

export const listUsersValidator = vine.create({
  active: vine.boolean().optional(),
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

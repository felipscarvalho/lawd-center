import vine from '@vinejs/vine'

export const loginValidator = vine.create({
  email: vine.string().trim().email(),
  password: vine.string(),
})

export const changePasswordValidator = vine.create({
  currentPassword: vine.string(),
  newPassword: vine.string().minLength(8).maxLength(72).notSameAs('currentPassword'),
})

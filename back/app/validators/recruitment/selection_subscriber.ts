import vine from '@vinejs/vine'

/** Sem regra de e-mail único: repetir a inscrição não é erro (o service devolve a que já existe) */
export const subscribeToSelectionValidator = vine.create({
  email: vine.string().trim().email().maxLength(254),
})

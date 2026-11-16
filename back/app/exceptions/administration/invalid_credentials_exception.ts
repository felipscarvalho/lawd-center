import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/** E-mail/senha inválidos ou usuário desativado (HTTP 400, mensagem genérica para não revelar qual) */
export default class InvalidCredentialsException extends Exception {
  static status = 400
  static code = 'E_INVALID_CREDENTIALS'

  constructor() {
    super('E-mail ou senha inválidos')
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response
      .status(error.status)
      .send({ errors: [{ message: error.message, code: error.code }] })
  }
}

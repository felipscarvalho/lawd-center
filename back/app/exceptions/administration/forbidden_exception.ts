import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/** Usuário autenticado sem permissão para a ação (HTTP 403) */
export default class ForbiddenException extends Exception {
  static status = 403
  static code = 'E_FORBIDDEN'

  constructor(message = 'Você não tem permissão para realizar esta ação') {
    super(message)
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response
      .status(error.status)
      .send({ errors: [{ message: error.message, code: error.code }] })
  }
}

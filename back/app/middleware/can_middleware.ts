import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import PermissionService from '#services/administration/permission_service'
import ForbiddenException from '#exceptions/administration/forbidden_exception'
import type { PermissionKey } from '#permissions/index'

/**
 * Exige que o usuário autenticado tenha a permissão em algum escopo (global ou em alguma diretoria).
 * Usar depois do middleware `auth`. Permissões com escopo de diretoria são verificadas
 * novamente no service, contra a diretoria do registro sendo alterado.
 *
 * Ex.: router.post('users', ...).use([middleware.auth(), middleware.can('administration.user.create')])
 */
@inject()
export default class CanMiddleware {
  constructor(protected permissionService: PermissionService) {}

  async handle(ctx: HttpContext, next: NextFn, permission: PermissionKey) {
    const user = ctx.auth.getUserOrFail()

    if (!(await this.permissionService.canAnywhere(user.id, permission))) {
      throw new ForbiddenException()
    }

    return next()
  }
}

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import MembershipService from '#services/administration/membership_service'
import MembershipTransformer from '#transformers/administration/membership_transformer'
import DirectorateTransformer from '#transformers/administration/directorate_transformer'
import {
  assignMembershipValidator,
  endMembershipValidator,
} from '#validators/administration/membership'

@inject()
export default class MembershipsController {
  constructor(protected membershipService: MembershipService) {}

  /** Organograma atual: diretorias com os vínculos ativos */
  async organizationChart({ serialize }: HttpContext) {
    const directorates = await this.membershipService.organizationChart()

    return serialize(DirectorateTransformer.transform(directorates))
  }

  /** Histórico de vínculos de um usuário */
  async history({ params, serialize }: HttpContext) {
    const memberships = await this.membershipService.historyForUser(Number(params.id))

    return serialize(MembershipTransformer.transform(memberships))
  }

  async store({ auth, request, response, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id
    const payload = await request.validateUsing(assignMembershipValidator)

    const membership = await this.membershipService.assign(actorId, payload)

    return response.created(await serialize(MembershipTransformer.transform(membership)))
  }

  async end({ auth, params, request, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id
    const payload = await request.validateUsing(endMembershipValidator)

    const membership = await this.membershipService.end(actorId, Number(params.id), payload)

    return serialize(MembershipTransformer.transform(membership))
  }
}

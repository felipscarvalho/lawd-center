import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProjectInterestService from '#services/projects/project_interest_service'
import ProjectInterestTransformer from '#transformers/projects/project_interest_transformer'

@inject()
export default class ProjectInterestsController {
  constructor(protected projectInterestService: ProjectInterestService) {}

  async index({ params, serialize }: HttpContext) {
    const interests = await this.projectInterestService.list(Number(params.id))

    return serialize(ProjectInterestTransformer.transform(interests))
  }

  /** Marca o interesse de quem está logado */
  async store({ auth, params, response }: HttpContext) {
    const userId = auth.getUserOrFail().id

    await this.projectInterestService.mark(userId, Number(params.id))

    return response.noContent()
  }

  /** Desmarca o interesse de quem está logado */
  async destroy({ auth, params, response }: HttpContext) {
    const userId = auth.getUserOrFail().id

    await this.projectInterestService.unmark(userId, Number(params.id))

    return response.noContent()
  }
}

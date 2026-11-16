import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import DirectorateService from '#services/administration/directorate_service'
import DirectorateTransformer from '#transformers/administration/directorate_transformer'
import {
  createDirectorateValidator,
  updateDirectorateValidator,
} from '#validators/administration/directorate'

@inject()
export default class DirectoratesController {
  constructor(protected directorateService: DirectorateService) {}

  async index({ serialize }: HttpContext) {
    const directorates = await this.directorateService.list()

    return serialize(DirectorateTransformer.transform(directorates))
  }

  async store({ request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createDirectorateValidator)

    const directorate = await this.directorateService.create(payload)

    return response.created(await serialize(DirectorateTransformer.transform(directorate)))
  }

  async update({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateDirectorateValidator)

    const directorate = await this.directorateService.update(Number(params.id), payload)

    return serialize(DirectorateTransformer.transform(directorate))
  }
}

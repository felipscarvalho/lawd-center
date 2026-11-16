import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProfileService from '#services/administration/profile_service'
import ProfileTransformer from '#transformers/administration/profile_transformer'
import {
  updatePhotoValidator,
  updateProfileValidator,
  updateTechnicalScoreValidator,
} from '#validators/administration/profile'

@inject()
export default class ProfilesController {
  constructor(protected profileService: ProfileService) {}

  async show({ auth, params, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id

    const profile = await this.profileService.getForUser(actorId, Number(params.id))

    return serialize(ProfileTransformer.transform(profile))
  }

  async update({ auth, params, request, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id
    const userId = Number(params.id)
    const payload = await request.validateUsing(updateProfileValidator, { meta: { userId } })

    const profile = await this.profileService.update(actorId, userId, payload)

    return serialize(ProfileTransformer.transform(profile))
  }

  async updatePhoto({ auth, params, request, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id
    const { photo } = await request.validateUsing(updatePhotoValidator)

    // O service recebe só o caminho do arquivo temporário, sem depender do objeto da requisição
    const profile = await this.profileService.updatePhoto(
      actorId,
      Number(params.id),
      photo.tmpPath!
    )

    return serialize(ProfileTransformer.transform(profile))
  }

  async removePhoto({ auth, params, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id

    const profile = await this.profileService.removePhoto(actorId, Number(params.id))

    return serialize(ProfileTransformer.transform(profile))
  }

  async updateTechnicalScore({ auth, params, request, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id
    const { technicalScore } = await request.validateUsing(updateTechnicalScoreValidator)

    const profile = await this.profileService.updateTechnicalScore(
      actorId,
      Number(params.id),
      technicalScore
    )

    return serialize(ProfileTransformer.transform(profile))
  }
}

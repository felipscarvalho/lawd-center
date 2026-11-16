import { BaseTransformer } from '@adonisjs/core/transformers'
import type Membership from '#models/administration/membership'
import { positionLabels } from '#permissions/positions'
import UserTransformer from '#transformers/administration/user_transformer'
import DirectorateTransformer from '#transformers/administration/directorate_transformer'

export default class MembershipTransformer extends BaseTransformer<Membership> {
  toObject() {
    return {
      id: this.resource.id,
      position: this.resource.position,
      positionLabel: positionLabels[this.resource.position],
      startsAt: this.resource.startsAt.toISODate(),
      endsAt: this.resource.endsAt?.toISODate() ?? null,
      isActive: this.resource.isActive,
      userId: this.resource.userId,
      directorateId: this.resource.directorateId,
      // Relações só aparecem quando carregadas (preload)
      user: UserTransformer.transform(this.whenLoaded(this.resource.user)),
      directorate: DirectorateTransformer.transform(this.whenLoaded(this.resource.directorate)),
    }
  }
}

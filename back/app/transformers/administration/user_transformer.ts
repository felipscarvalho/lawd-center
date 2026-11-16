import { BaseTransformer } from '@adonisjs/core/transformers'
import type User from '#models/administration/user'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      id: this.resource.id,
      fullName: this.resource.fullName,
      email: this.resource.email,
      isActive: this.resource.isActive,
      deactivatedAt: this.resource.deactivatedAt?.toISO() ?? null,
      createdAt: this.resource.createdAt.toISO(),
    }
  }
}

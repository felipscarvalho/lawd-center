import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from '#transformers/administration/user_transformer'
import type { ProjectInterestView } from '#dtos/projects/project'

/** Pessoa interessada no projeto, com a data em que marcou o interesse */
export default class ProjectInterestTransformer extends BaseTransformer<ProjectInterestView> {
  toObject() {
    return {
      id: this.resource.interest.id,
      createdAt: this.resource.interest.createdAt.toISO(),
      user: UserTransformer.transform(this.resource.user),
    }
  }
}

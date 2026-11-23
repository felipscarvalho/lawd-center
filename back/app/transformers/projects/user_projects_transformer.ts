import { BaseTransformer } from '@adonisjs/core/transformers'
import ProjectMemberTransformer from '#transformers/projects/project_member_transformer'
import ProjectSummaryTransformer from '#transformers/projects/project_summary_transformer'
import type { UserProjects } from '#dtos/projects/project'

/** Projetos de uma pessoa: participações (com o projeto) e interesses */
export default class UserProjectsTransformer extends BaseTransformer<UserProjects> {
  toObject() {
    return {
      participations: ProjectMemberTransformer.transform(this.resource.participations).depth(3),
      interests: ProjectSummaryTransformer.transform(this.resource.interests),
    }
  }
}

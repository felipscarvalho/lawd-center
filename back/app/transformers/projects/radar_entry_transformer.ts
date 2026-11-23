import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from '#transformers/administration/user_transformer'
import ProjectSummaryTransformer from '#transformers/projects/project_summary_transformer'
import type { RadarEntry } from '#dtos/projects/analytics'

/** Pessoa fora das equipes, com o que ajuda a decidir onde alocá-la */
export default class RadarEntryTransformer extends BaseTransformer<RadarEntry> {
  toObject() {
    const { user, technicalScore, interestedProjects } = this.resource

    return {
      // depth 3: pessoa → cargos ativos → diretoria
      user: UserTransformer.transform(user).depth(3),
      technicalScore,
      technologies: user.technologies.map((technology) => technology.name),
      interestAreas: user.interestAreas.map((area) => area.name),
      interestedProjects: ProjectSummaryTransformer.transform(interestedProjects),
    }
  }
}

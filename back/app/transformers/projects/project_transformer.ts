import { BaseTransformer } from '@adonisjs/core/transformers'
import DirectorateTransformer from '#transformers/administration/directorate_transformer'
import UserTransformer from '#transformers/administration/user_transformer'
import ProjectSummaryTransformer from '#transformers/projects/project_summary_transformer'
import type { ProjectDetail, ProjectView } from '#dtos/projects/project'

/**
 * Projeto da lista (ProjectView) ou do detalhe (ProjectDetail). No detalhe vêm também o que quem
 * consulta pode fazer e se essa pessoa está na equipe ou marcou interesse.
 */
export default class ProjectTransformer extends BaseTransformer<ProjectView | ProjectDetail> {
  toObject() {
    const view = this.resource
    const detail = 'abilities' in view ? view : null

    return {
      ...new ProjectSummaryTransformer(view.project).toObject(),
      directorate: DirectorateTransformer.transform(view.directorate),
      coordinator: view.coordinator ? UserTransformer.transform(view.coordinator) : null,
      teamSize: view.teamSize,
      interestCount: view.interestCount,
      abilities: detail?.abilities,
      isMember: detail?.isMember,
      isInterested: detail?.isInterested,
    }
  }
}

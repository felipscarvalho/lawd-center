import { BaseTransformer } from '@adonisjs/core/transformers'
import { projectRoleLabels } from '#models/projects/project_member'
import UserTransformer from '#transformers/administration/user_transformer'
import ProjectSummaryTransformer from '#transformers/projects/project_summary_transformer'
import type { ProjectMemberView } from '#dtos/projects/project'

/** Participação na equipe, com a pessoa e (nos projetos de uma pessoa) o projeto */
export default class ProjectMemberTransformer extends BaseTransformer<ProjectMemberView> {
  toObject() {
    const { member, user, project } = this.resource

    return {
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      role: member.role,
      roleLabel: projectRoleLabels[member.role],
      startsAt: member.startsAt.toISODate(),
      endsAt: member.endsAt?.toISODate() ?? null,
      isActive: member.isActive,
      user: UserTransformer.transform(user),
      project: project ? ProjectSummaryTransformer.transform(project) : undefined,
    }
  }
}

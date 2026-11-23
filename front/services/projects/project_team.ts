import { apiGet, apiPost } from "@/lib/api";
import type {
  AddProjectMemberPayload,
  EndProjectMemberPayload,
  ProjectMember,
  UserProjects,
} from "@/types/projects";

/** Equipe com o histórico: ativos (coordenador primeiro) e depois quem saiu */
export async function getProjectMembers(projectId: number): Promise<ProjectMember[]> {
  return apiGet<ProjectMember[]>(`/projects/projects/${projectId}/members`);
}

export async function addProjectMember(projectId: number, payload: AddProjectMemberPayload): Promise<ProjectMember> {
  return apiPost<ProjectMember>(`/projects/projects/${projectId}/members`, payload);
}

export async function endProjectMember(id: number, payload: EndProjectMemberPayload = {}): Promise<ProjectMember> {
  return apiPost<ProjectMember>(`/projects/project-members/${id}/end`, payload);
}

/** Participações e interesses de uma pessoa */
export async function getUserProjects(userId: number): Promise<UserProjects> {
  return apiGet<UserProjects>(`/projects/users/${userId}/projects`);
}

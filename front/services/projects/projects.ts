import { apiGet, apiGetPage, apiPost, apiPut } from "@/lib/api";
import type { Project, ProjectPayload, ProjectPriority, ProjectSort, ProjectStatus } from "@/types/projects";

export interface ProjectFilters {
  /** Trecho do nome do projeto ou do nome/e-mail de alguém da equipe */
  search?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  directorateId?: number;
  sort?: ProjectSort;
  page?: number;
  perPage?: number;
}

/** Uma página da lista de projetos, já filtrada e ordenada pelo backend */
export async function getProjects(filters: ProjectFilters = {}) {
  return apiGetPage<Project>("/projects/projects", { params: filters });
}

/** Detalhe, com o que quem consulta pode fazer (abilities) */
export async function getProject(id: number): Promise<Project> {
  return apiGet<Project>(`/projects/projects/${id}`);
}

export async function createProject(payload: ProjectPayload): Promise<Project> {
  return apiPost<Project>("/projects/projects", payload);
}

export async function updateProject(id: number, payload: Partial<ProjectPayload>): Promise<Project> {
  return apiPut<Project>(`/projects/projects/${id}`, payload);
}

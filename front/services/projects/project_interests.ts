import { api, apiGet } from "@/lib/api";
import type { ProjectInterest } from "@/types/projects";

export async function getProjectInterests(projectId: number): Promise<ProjectInterest[]> {
  return apiGet<ProjectInterest[]>(`/projects/projects/${projectId}/interests`);
}

// Marcar e desmarcar respondem 204 (sem corpo a desembrulhar)

/** Marca o interesse de quem está logado */
export async function markProjectInterest(projectId: number): Promise<void> {
  await api.post(`/projects/projects/${projectId}/interest`);
}

/** Desmarca o interesse de quem está logado */
export async function unmarkProjectInterest(projectId: number): Promise<void> {
  await api.delete(`/projects/projects/${projectId}/interest`);
}

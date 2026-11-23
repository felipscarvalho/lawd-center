import { apiGet } from "@/lib/api";
import type { ProjectsAnalytics, RadarEntry } from "@/types/projects";

export async function getProjectsAnalytics(): Promise<ProjectsAnalytics> {
  return apiGet<ProjectsAnalytics>("/projects/analytics");
}

/** Pessoas fora das equipes (só para quem gerencia projetos) */
export async function getProjectsRadar(): Promise<RadarEntry[]> {
  return apiGet<RadarEntry[]>("/projects/radar");
}

import { useQuery } from "@tanstack/react-query";
import { projectKeys } from "@/hooks/projects/use_projects";
import { getProjectsAnalytics, getProjectsRadar } from "@/services/projects/project_analytics";

export function useProjectsAnalytics() {
  return useQuery({
    queryKey: projectKeys.analytics(),
    queryFn: getProjectsAnalytics,
  });
}

/** Radar de alocação (só para quem gerencia projetos: renderizar só com a permissão) */
export function useProjectsRadar() {
  return useQuery({
    queryKey: projectKeys.radar(),
    queryFn: getProjectsRadar,
  });
}

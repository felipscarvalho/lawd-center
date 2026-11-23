import { useMutation, useQuery } from "@tanstack/react-query";
import { projectKeys, useInvalidateProjects } from "@/hooks/projects/use_projects";
import {
  getProjectInterests,
  markProjectInterest,
  unmarkProjectInterest,
} from "@/services/projects/project_interests";

export function useProjectInterests(projectId: number) {
  return useQuery({
    queryKey: projectKeys.interests(projectId),
    queryFn: () => getProjectInterests(projectId),
  });
}

/** Marca (true) ou desmarca (false) o interesse de quem está logado */
export function useToggleProjectInterest(projectId: number) {
  const invalidate = useInvalidateProjects();

  return useMutation({
    mutationFn: (interested: boolean) =>
      interested ? markProjectInterest(projectId) : unmarkProjectInterest(projectId),
    onSuccess: invalidate,
  });
}

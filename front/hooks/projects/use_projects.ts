import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProject, getProject, getProjects, updateProject, type ProjectFilters } from "@/services/projects/projects";
import type { ProjectPayload } from "@/types/projects";

/** Keys de todo o módulo: equipe e interesse mudam contagens da lista, do detalhe e da análise */
export const projectKeys = {
  all: ["projects"] as const,
  list: (filters: ProjectFilters = {}) => [...projectKeys.all, "list", filters] as const,
  detail: (id: number) => [...projectKeys.all, "detail", id] as const,
  members: (id: number) => [...projectKeys.all, "members", id] as const,
  interests: (id: number) => [...projectKeys.all, "interests", id] as const,
  user: (userId: number) => [...projectKeys.all, "user", userId] as const,
  analytics: () => [...projectKeys.all, "analytics"] as const,
  radar: () => [...projectKeys.all, "radar"] as const,
};

/** Qualquer mudança em projetos invalida o módulo inteiro (as telas são pequenas e se relacionam) */
export function useInvalidateProjects() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: projectKeys.all });
}

/** Página da lista; ao trocar de página ou filtro, a anterior continua na tela até a nova chegar */
export function useProjects(filters: ProjectFilters = {}, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => getProjects(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
  });
}

export function useCreateProject() {
  const invalidate = useInvalidateProjects();

  return useMutation({
    mutationFn: createProject,
    onSuccess: invalidate,
  });
}

export function useUpdateProject(id: number) {
  const invalidate = useInvalidateProjects();

  return useMutation({
    mutationFn: (payload: Partial<ProjectPayload>) => updateProject(id, payload),
    onSuccess: invalidate,
  });
}

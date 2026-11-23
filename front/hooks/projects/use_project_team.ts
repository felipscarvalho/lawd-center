import { useMutation, useQuery } from "@tanstack/react-query";
import { projectKeys, useInvalidateProjects } from "@/hooks/projects/use_projects";
import {
  addProjectMember,
  endProjectMember,
  getProjectMembers,
  getUserProjects,
} from "@/services/projects/project_team";
import type { AddProjectMemberPayload, EndProjectMemberPayload } from "@/types/projects";

export function useProjectMembers(projectId: number) {
  return useQuery({
    queryKey: projectKeys.members(projectId),
    queryFn: () => getProjectMembers(projectId),
  });
}

export function useUserProjects(userId: number) {
  return useQuery({
    queryKey: projectKeys.user(userId),
    queryFn: () => getUserProjects(userId),
  });
}

/** Coloca alguém na equipe; o projeto vai na chamada (o modal pode escolher o projeto na hora) */
export function useAddProjectMember() {
  const invalidate = useInvalidateProjects();

  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: number; payload: AddProjectMemberPayload }) =>
      addProjectMember(projectId, payload),
    onSuccess: invalidate,
  });
}

export function useEndProjectMember() {
  const invalidate = useInvalidateProjects();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: EndProjectMemberPayload }) => endProjectMember(id, payload),
    onSuccess: invalidate,
  });
}

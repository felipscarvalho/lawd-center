import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDirectorate, getDirectorates, updateDirectorate } from "@/services/administration/directorates";
import { membershipKeys } from "@/hooks/administration/use_memberships";
import type { UpdateDirectoratePayload } from "@/types/administration";

export const directorateKeys = {
  all: ["administration", "directorates"] as const,
  list: () => [...directorateKeys.all, "list"] as const,
};

export function useDirectorates() {
  return useQuery({
    queryKey: directorateKeys.list(),
    queryFn: getDirectorates,
  });
}

/** Diretorias aparecem no organograma, que também é revalidado */
function useInvalidateDirectorates() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: directorateKeys.all });
    queryClient.invalidateQueries({ queryKey: membershipKeys.all });
  };
}

export function useCreateDirectorate() {
  const invalidate = useInvalidateDirectorates();

  return useMutation({
    mutationFn: createDirectorate,
    onSuccess: invalidate,
  });
}

export function useUpdateDirectorate(id: number) {
  const invalidate = useInvalidateDirectorates();

  return useMutation({
    mutationFn: (payload: UpdateDirectoratePayload) => updateDirectorate(id, payload),
    onSuccess: invalidate,
  });
}

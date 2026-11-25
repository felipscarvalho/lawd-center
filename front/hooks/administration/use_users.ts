import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  deactivateUser,
  getUser,
  getUsers,
  resendInvitation,
  updateUser,
  type UserFilters,
} from "@/services/administration/users";
import { membershipKeys } from "@/hooks/administration/use_memberships";
import { useUserStore } from "@/stores/user_store";
import type { UpdateUserPayload } from "@/types/administration";

export const userKeys = {
  all: ["administration", "users"] as const,
  list: (filters: UserFilters = {}) => [...userKeys.all, "list", filters] as const,
  detail: (id: number) => [...userKeys.all, "detail", id] as const,
};

/** Página da lista; ao trocar de página ou filtro, a página anterior continua na tela até a nova chegar */
export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => getUsers(filters),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser(id: number) {
  const queryClient = useQueryClient();
  const revalidateUser = useUserStore((state) => state.revalidate);

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: membershipKeys.all });
      // Se editou o próprio cadastro, o nome/e-mail exibidos também mudam
      revalidateUser();
    },
  });
}

/** Desativar encerra os vínculos no backend, então o organograma e os históricos também mudam */
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: membershipKeys.all });
    },
  });
}

/** Novo link de convite para quem ainda não criou a senha (o anterior deixa de valer) */
export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resendInvitation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

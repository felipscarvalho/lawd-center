import { useMutation, useQuery } from "@tanstack/react-query";
import { acceptInvitation, getInvitation } from "@/services/administration/auth";
import { useUserStore } from "@/stores/user_store";
import type { AcceptInvitationPayload } from "@/types/administration";

export const invitationKeys = {
  all: ["administration", "invitations"] as const,
  detail: (token: string) => [...invitationKeys.all, "detail", token] as const,
};

/** Convite do link do e-mail; link inválido ou expirado responde 404, sem tentar de novo */
export function useInvitation(token: string) {
  return useQuery({
    queryKey: invitationKeys.detail(token),
    queryFn: () => getInvitation(token),
    retry: false,
  });
}

/**
 * Cria nome e senha e já guarda a sessão devolvida pelo backend. A query do convite não é
 * invalidada: ele deixa de valer (buscar de novo daria 404) e a página sai para a área logada.
 */
export function useAcceptInvitation(token: string) {
  const startSession = useUserStore((state) => state.startSession);

  return useMutation({
    mutationFn: (payload: AcceptInvitationPayload) => acceptInvitation(token, payload),
    onSuccess: (session) => startSession(session),
  });
}

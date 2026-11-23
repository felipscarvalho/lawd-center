import { useMutation } from "@tanstack/react-query";
import { subscribeToSelection } from "@/services/recruitment/selection_subscribers";

/** Inscrição no aviso do processo seletivo (nenhuma tela lista as inscrições: nada a invalidar) */
export function useSubscribeToSelection() {
  return useMutation({ mutationFn: subscribeToSelection });
}

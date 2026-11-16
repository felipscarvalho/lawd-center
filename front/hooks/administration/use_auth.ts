import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { changePassword } from "@/services/administration/auth";
import { useUserStore } from "@/stores/user_store";

/**
 * Verificação de permissões do usuário autenticado (dados do user_store).
 * Re-renderiza quando as permissões mudam, por exemplo após uma revalidação.
 */
export function usePermissions() {
  return useUserStore(useShallow((state) => ({ permissions: state.permissions, can: state.can, canAnywhere: state.canAnywhere })));
}

/** Troca da própria senha (não altera dados em cache: nada a invalidar) */
export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}

import { useShallow } from "zustand/react/shallow";
import { useUserStore } from "@/stores/user_store";

/**
 * Verificação de permissões do usuário autenticado (dados do user_store).
 * Re-renderiza quando as permissões mudam, por exemplo após uma revalidação.
 */
export function usePermissions() {
  return useUserStore(useShallow((state) => ({ permissions: state.permissions, can: state.can, canAnywhere: state.canAnywhere })));
}

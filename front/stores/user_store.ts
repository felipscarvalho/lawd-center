import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from "@/services/administration/auth";
import type { EffectivePermission, LoginPayload, LoginResponse, PermissionKey, User } from "@/types/administration";

type UserStatus = "idle" | "loading" | "ready" | "error";

interface UserState {
  /** Access token do backend; nulo quando não há sessão */
  token: string | null;
  /** Usuário autenticado (nome, e-mail...) para exibir em qualquer tela */
  user: User | null;
  /** Permissões efetivas, derivadas dos cargos ativos do usuário */
  permissions: EffectivePermission[];
  /** Situação da última revalidação com o backend */
  status: UserStatus;
  error: string | null;

  /** Faz login, guarda o token e carrega os dados do usuário */
  login: (payload: LoginPayload) => Promise<void>;
  /** Guarda uma sessão já aberta pelo backend (ex.: convite aceito) e carrega as permissões */
  startSession: (session: LoginResponse) => Promise<void>;
  /** Revoga o token no backend e limpa a sessão local */
  logout: () => Promise<void>;
  /**
   * Busca de novo o usuário e as permissões no backend (/auth/me).
   * Chamar ao abrir a área logada e depois de ações que mudam cargos.
   */
  revalidate: () => Promise<void>;
  /** Limpa a sessão local sem chamar o backend (ex.: token expirado) */
  clear: () => void;

  /** Permissão global, ou global/da diretoria quando directorateId é informado (mesma regra do backend) */
  can: (permission: PermissionKey, directorateId?: number) => boolean;
  /** Permissão em qualquer escopo */
  canAnywhere: (permission: PermissionKey) => boolean;
}

const emptySession = { token: null, user: null, permissions: [], status: "idle" as const, error: null };

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...emptySession,

      login: async (payload) => {
        const result = await loginRequest(payload);

        await get().startSession(result);
      },

      startSession: async (session) => {
        set({ token: session.token, user: session.user });

        await get().revalidate();
      },

      logout: async () => {
        try {
          await logoutRequest();
        } finally {
          get().clear();
        }
      },

      revalidate: async () => {
        if (!get().token) return;

        set({ status: "loading", error: null });

        try {
          const { user, permissions } = await getCurrentUser();

          set({ user, permissions, status: "ready" });
        } catch (error) {
          set({ status: "error", error: error instanceof Error ? error.message : "Erro ao carregar o usuário" });
        }
      },

      clear: () => set(emptySession),

      can: (permission, directorateId) =>
        get().permissions.some(
          (item) =>
            item.permission === permission &&
            (item.scope === "global" || (directorateId !== undefined && item.directorateId === directorateId)),
        ),

      canAnywhere: (permission) => get().permissions.some((item) => item.permission === permission),
    }),
    {
      name: "lawd-user",
      // Persiste só os dados; status e erro são da sessão atual do navegador
      partialize: (state) => ({ token: state.token, user: state.user, permissions: state.permissions }),
    },
  ),
);

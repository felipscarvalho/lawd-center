import { api, apiGet, apiPost } from "@/lib/api";
import type {
  AcceptInvitationPayload,
  ChangePasswordPayload,
  CurrentUser,
  Invitation,
  LoginPayload,
  LoginResponse,
} from "@/types/administration";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/administration/auth/login", payload);
}

export async function logout(): Promise<void> {
  await api.post("/administration/auth/logout");
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return apiGet<CurrentUser>("/administration/auth/me");
}

/** Troca a própria senha; o backend encerra as outras sessões e mantém a atual */
export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await api.put("/administration/auth/password", payload);
}

/** Convite aberto pelo link do e-mail (falha com 404 se o link não vale mais) */
export async function getInvitation(token: string): Promise<Invitation> {
  return apiGet<Invitation>(`/administration/auth/invitations/${encodeURIComponent(token)}`);
}

/** Cria nome e senha pelo convite; devolve a sessão, como o login */
export async function acceptInvitation(token: string, payload: AcceptInvitationPayload): Promise<LoginResponse> {
  return apiPost<LoginResponse>(`/administration/auth/invitations/${encodeURIComponent(token)}/accept`, payload);
}

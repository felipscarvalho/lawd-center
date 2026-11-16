import { api, apiGet, apiPost } from "@/lib/api";
import type { ChangePasswordPayload, CurrentUser, LoginPayload, LoginResponse } from "@/types/administration";

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

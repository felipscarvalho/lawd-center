import { api } from "@/lib/api";
import type { ChangePasswordPayload, CurrentUser, LoginPayload, LoginResponse } from "@/types/administration";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<{ data: LoginResponse }>("/administration/auth/login", payload);

  return data.data;
}

export async function logout(): Promise<void> {
  await api.post("/administration/auth/logout");
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await api.get<{ data: CurrentUser }>("/administration/auth/me");

  return data.data;
}

/** Troca a própria senha; o backend encerra as outras sessões e mantém a atual */
export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await api.put("/administration/auth/password", payload);
}

import { apiGet, apiPost, apiPut } from "@/lib/api";
import type { CreateUserPayload, UpdateUserPayload, User } from "@/types/administration";

export interface UserFilters {
  /** true: só ativos; false: só desativados; omitido: todos */
  active?: boolean;
}

export async function getUsers(filters: UserFilters = {}): Promise<User[]> {
  return apiGet<User[]>("/administration/users", { params: filters });
}

export async function getUser(id: number): Promise<User> {
  return apiGet<User>(`/administration/users/${id}`);
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  return apiPost<User>("/administration/users", payload);
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  return apiPut<User>(`/administration/users/${id}`, payload);
}

export async function deactivateUser(id: number): Promise<User> {
  return apiPost<User>(`/administration/users/${id}/deactivate`);
}

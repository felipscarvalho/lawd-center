import { api } from "@/lib/api";
import type { CreateUserPayload, UpdateUserPayload, User } from "@/types/administration";

export interface UserFilters {
  /** true: só ativos; false: só desativados; omitido: todos */
  active?: boolean;
}

export async function getUsers(filters: UserFilters = {}): Promise<User[]> {
  const { data } = await api.get<{ data: User[] }>("/administration/users", { params: filters });

  return data.data;
}

export async function getUser(id: number): Promise<User> {
  const { data } = await api.get<{ data: User }>(`/administration/users/${id}`);

  return data.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await api.post<{ data: User }>("/administration/users", payload);

  return data.data;
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  const { data } = await api.put<{ data: User }>(`/administration/users/${id}`, payload);

  return data.data;
}

export async function deactivateUser(id: number): Promise<User> {
  const { data } = await api.post<{ data: User }>(`/administration/users/${id}/deactivate`);

  return data.data;
}

import { apiGet, apiGetPage, apiPost, apiPut } from "@/lib/api";
import type { CreateUserPayload, Course, UpdateUserPayload, User } from "@/types/administration";

export interface UserFilters {
  /** true: só ativos; false: só desativados; omitido: todos */
  active?: boolean;
  /** Trecho do nome ou do e-mail */
  search?: string;
  /** Só quem tem cargo ativo nesta diretoria */
  directorateId?: number;
  course?: Course;
  /** Página, a partir de 1 */
  page?: number;
  /** Itens por página (máximo 100; padrão do backend 20) */
  perPage?: number;
}

/** Uma página da lista de usuários, já filtrada pelo backend */
export async function getUsers(filters: UserFilters = {}) {
  return apiGetPage<User>("/administration/users", { params: filters });
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

/** Reenvia o convite por e-mail para quem ainda não criou a senha */
export async function resendInvitation(id: number): Promise<User> {
  return apiPost<User>(`/administration/users/${id}/invitation`);
}

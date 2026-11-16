import { api } from "@/lib/api";
import type { CreateDirectoratePayload, Directorate, UpdateDirectoratePayload } from "@/types/administration";

export async function getDirectorates(): Promise<Directorate[]> {
  const { data } = await api.get<{ data: Directorate[] }>("/administration/directorates");

  return data.data;
}

export async function createDirectorate(payload: CreateDirectoratePayload): Promise<Directorate> {
  const { data } = await api.post<{ data: Directorate }>("/administration/directorates", payload);

  return data.data;
}

export async function updateDirectorate(id: number, payload: UpdateDirectoratePayload): Promise<Directorate> {
  const { data } = await api.put<{ data: Directorate }>(`/administration/directorates/${id}`, payload);

  return data.data;
}

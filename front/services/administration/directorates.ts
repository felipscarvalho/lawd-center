import { apiGet, apiPost, apiPut } from "@/lib/api";
import type { CreateDirectoratePayload, Directorate, UpdateDirectoratePayload } from "@/types/administration";

export async function getDirectorates(): Promise<Directorate[]> {
  return apiGet<Directorate[]>("/administration/directorates");
}

export async function createDirectorate(payload: CreateDirectoratePayload): Promise<Directorate> {
  return apiPost<Directorate>("/administration/directorates", payload);
}

export async function updateDirectorate(id: number, payload: UpdateDirectoratePayload): Promise<Directorate> {
  return apiPut<Directorate>(`/administration/directorates/${id}`, payload);
}

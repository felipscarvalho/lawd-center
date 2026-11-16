import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import type { Profile, UpdateProfilePayload } from "@/types/administration";

export async function getProfile(userId: number): Promise<Profile> {
  return apiGet<Profile>(`/administration/users/${userId}/profile`);
}

export async function updateProfile(userId: number, payload: UpdateProfilePayload): Promise<Profile> {
  return apiPut<Profile>(`/administration/users/${userId}/profile`, payload);
}

/** Envia a foto; o backend comprime para WebP 512×512 */
export async function uploadProfilePhoto(userId: number, photo: File): Promise<Profile> {
  const form = new FormData();
  form.append("photo", photo);

  return apiPost<Profile>(`/administration/users/${userId}/profile/photo`, form);
}

export async function removeProfilePhoto(userId: number): Promise<Profile> {
  return apiDelete<Profile>(`/administration/users/${userId}/profile/photo`);
}

export async function updateTechnicalScore(userId: number, technicalScore: number | null): Promise<Profile> {
  return apiPut<Profile>(`/administration/users/${userId}/technical-score`, {
    technicalScore,
  });
}

export async function searchTechnologies(search = ""): Promise<string[]> {
  return apiGet<string[]>("/administration/technologies", { params: { search } });
}

export async function searchInterestAreas(search = ""): Promise<string[]> {
  return apiGet<string[]>("/administration/interest-areas", { params: { search } });
}

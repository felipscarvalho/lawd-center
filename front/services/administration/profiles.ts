import { api } from "@/lib/api";
import type { Profile, UpdateProfilePayload } from "@/types/administration";

export async function getProfile(userId: number): Promise<Profile> {
  const { data } = await api.get<{ data: Profile }>(`/administration/users/${userId}/profile`);

  return data.data;
}

export async function updateProfile(userId: number, payload: UpdateProfilePayload): Promise<Profile> {
  const { data } = await api.put<{ data: Profile }>(`/administration/users/${userId}/profile`, payload);

  return data.data;
}

/** Envia a foto; o backend comprime para WebP 512×512 */
export async function uploadProfilePhoto(userId: number, photo: File): Promise<Profile> {
  const form = new FormData();
  form.append("photo", photo);

  const { data } = await api.post<{ data: Profile }>(`/administration/users/${userId}/profile/photo`, form);

  return data.data;
}

export async function removeProfilePhoto(userId: number): Promise<Profile> {
  const { data } = await api.delete<{ data: Profile }>(`/administration/users/${userId}/profile/photo`);

  return data.data;
}

export async function updateTechnicalScore(userId: number, technicalScore: number | null): Promise<Profile> {
  const { data } = await api.put<{ data: Profile }>(`/administration/users/${userId}/technical-score`, {
    technicalScore,
  });

  return data.data;
}

export async function searchTechnologies(search = ""): Promise<string[]> {
  const { data } = await api.get<{ data: string[] }>("/administration/technologies", { params: { search } });

  return data.data;
}

export async function searchInterestAreas(search = ""): Promise<string[]> {
  const { data } = await api.get<{ data: string[] }>("/administration/interest-areas", { params: { search } });

  return data.data;
}

import { api } from "@/lib/api";
import type { AssignMembershipPayload, Directorate, EndMembershipPayload, Membership } from "@/types/administration";

/** Organograma: diretorias com os vínculos ativos e o usuário de cada vínculo */
export async function getOrganizationChart(): Promise<Directorate[]> {
  const { data } = await api.get<{ data: Directorate[] }>("/administration/organization-chart");

  return data.data;
}

/** Histórico completo de vínculos de um usuário */
export async function getUserMemberships(userId: number): Promise<Membership[]> {
  const { data } = await api.get<{ data: Membership[] }>(`/administration/users/${userId}/memberships`);

  return data.data;
}

export async function assignMembership(payload: AssignMembershipPayload): Promise<Membership> {
  const { data } = await api.post<{ data: Membership }>("/administration/memberships", payload);

  return data.data;
}

export async function endMembership(id: number, payload: EndMembershipPayload = {}): Promise<Membership> {
  const { data } = await api.post<{ data: Membership }>(`/administration/memberships/${id}/end`, payload);

  return data.data;
}

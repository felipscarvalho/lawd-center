import { apiGet, apiPost } from "@/lib/api";
import type { AssignMembershipPayload, Directorate, EndMembershipPayload, Membership } from "@/types/administration";

/** Organograma: diretorias com os vínculos ativos e o usuário de cada vínculo */
export async function getOrganizationChart(): Promise<Directorate[]> {
  return apiGet<Directorate[]>("/administration/organization-chart");
}

/** Histórico completo de vínculos de um usuário */
export async function getUserMemberships(userId: number): Promise<Membership[]> {
  return apiGet<Membership[]>(`/administration/users/${userId}/memberships`);
}

export async function assignMembership(payload: AssignMembershipPayload): Promise<Membership> {
  return apiPost<Membership>("/administration/memberships", payload);
}

export async function endMembership(id: number, payload: EndMembershipPayload = {}): Promise<Membership> {
  return apiPost<Membership>(`/administration/memberships/${id}/end`, payload);
}

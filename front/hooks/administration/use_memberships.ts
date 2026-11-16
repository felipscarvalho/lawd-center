import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignMembership,
  endMembership,
  getOrganizationChart,
  getUserMemberships,
} from "@/services/administration/memberships";
import { useUserStore } from "@/stores/user_store";
import type { EndMembershipPayload } from "@/types/administration";

export const membershipKeys = {
  all: ["administration", "memberships"] as const,
  organizationChart: () => [...membershipKeys.all, "organization-chart"] as const,
  userHistory: (userId: number) => [...membershipKeys.all, "user", userId] as const,
};

export function useOrganizationChart() {
  return useQuery({
    queryKey: membershipKeys.organizationChart(),
    queryFn: getOrganizationChart,
  });
}

export function useUserMemberships(userId: number) {
  return useQuery({
    queryKey: membershipKeys.userHistory(userId),
    queryFn: () => getUserMemberships(userId),
  });
}

/** Vínculos mudam permissões: o usuário atual também é revalidado (pode ter mudado o próprio cargo) */
function useInvalidateMemberships() {
  const queryClient = useQueryClient();
  const revalidateUser = useUserStore((state) => state.revalidate);

  return () => {
    queryClient.invalidateQueries({ queryKey: membershipKeys.all });
    revalidateUser();
  };
}

export function useAssignMembership() {
  const invalidate = useInvalidateMemberships();

  return useMutation({
    mutationFn: assignMembership,
    onSuccess: invalidate,
  });
}

export function useEndMembership() {
  const invalidate = useInvalidateMemberships();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: EndMembershipPayload }) => endMembership(id, payload),
    onSuccess: invalidate,
  });
}

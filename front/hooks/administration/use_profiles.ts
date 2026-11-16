import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  removeProfilePhoto,
  searchInterestAreas,
  searchTechnologies,
  updateProfile,
  updateTechnicalScore,
  uploadProfilePhoto,
} from "@/services/administration/profiles";
import { membershipKeys } from "@/hooks/administration/use_memberships";
import { userKeys } from "@/hooks/administration/use_users";
import { useUserStore } from "@/stores/user_store";
import type { UpdateProfilePayload } from "@/types/administration";

export const profileKeys = {
  all: ["administration", "profiles"] as const,
  detail: (userId: number) => [...profileKeys.all, "detail", userId] as const,
  catalog: (catalog: "technologies" | "interest-areas", search: string) =>
    [...profileKeys.all, "catalog", catalog, search] as const,
};

export function useProfile(userId: number) {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => getProfile(userId),
  });
}

/** Catálogos para sugerir nomes já usados por outras pessoas */
export function useTechnologyCatalog(search = "") {
  return useQuery({
    queryKey: profileKeys.catalog("technologies", search),
    queryFn: () => searchTechnologies(search),
  });
}

export function useInterestAreaCatalog(search = "") {
  return useQuery({
    queryKey: profileKeys.catalog("interest-areas", search),
    queryFn: () => searchInterestAreas(search),
  });
}

/**
 * Mudanças de perfil aparecem em vários lugares: o próprio perfil, listas e organograma (foto)
 * e o usuário logado, se for o perfil dele.
 */
function useInvalidateProfile(userId: number) {
  const queryClient = useQueryClient();
  const currentUserId = useUserStore((state) => state.user?.id);
  const revalidateUser = useUserStore((state) => state.revalidate);

  return () => {
    queryClient.invalidateQueries({ queryKey: profileKeys.all });
    queryClient.invalidateQueries({ queryKey: userKeys.all });
    queryClient.invalidateQueries({ queryKey: membershipKeys.all });

    if (currentUserId === userId) revalidateUser();
  };
}

export function useUpdateProfile(userId: number) {
  const invalidate = useInvalidateProfile(userId);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(userId, payload),
    onSuccess: invalidate,
  });
}

export function useUploadProfilePhoto(userId: number) {
  const invalidate = useInvalidateProfile(userId);

  return useMutation({
    mutationFn: (photo: File) => uploadProfilePhoto(userId, photo),
    onSuccess: invalidate,
  });
}

export function useRemoveProfilePhoto(userId: number) {
  const invalidate = useInvalidateProfile(userId);

  return useMutation({
    mutationFn: () => removeProfilePhoto(userId),
    onSuccess: invalidate,
  });
}

export function useUpdateTechnicalScore(userId: number) {
  const invalidate = useInvalidateProfile(userId);

  return useMutation({
    mutationFn: (score: number | null) => updateTechnicalScore(userId, score),
    onSuccess: invalidate,
  });
}

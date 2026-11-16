"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/feedback/toast";
import {
  ProfileFormFields,
  toProfileFormValues,
  toProfilePayload,
} from "@/components/administration/profile_form_fields";
import { FormModal } from "@/components/overlays/form_modal";
import { useUpdateProfile } from "@/hooks/administration/use_profiles";
import { handleApiError } from "@/lib/form_errors";
import { profileSchema, type ProfileForm } from "@/schemas/administration";
import { useUserStore } from "@/stores/user_store";
import type { Profile } from "@/types/administration";

interface ProfileFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  profile: Profile;
}

/** Edição do perfil em modal (detalhe do usuário: CORP, o diretor da pessoa ou ela mesma). Em /profile o formulário fica na página */
export function ProfileFormModal({ isOpen, onOpenChange, profile }: ProfileFormModalProps) {
  const updateProfile = useUpdateProfile(profile.user.id);
  const currentUserId = useUserStore((state) => state.user?.id);
  const canEditPrivate = currentUserId === profile.user.id || profile.abilities.canViewPrivate;

  const { control, handleSubmit, setError, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (isOpen) reset(toProfileFormValues(profile));
  }, [isOpen, profile, reset]);

  const onSubmit = handleSubmit((values) => {
    const payload = toProfilePayload(values, canEditPrivate);

    updateProfile.mutate(payload, {
      onSuccess: () => {
        toast.success("Perfil atualizado", { description: profile.user.fullName });
        onOpenChange(false);
      },
      onError: (error) => handleApiError(error, setError),
    });
  });

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Editar perfil"
      description={profile.user.fullName}
      onSubmit={onSubmit}
      isSubmitting={updateProfile.isPending}
      size="lg"
    >
      <div className="flex flex-col gap-6">
        <ProfileFormFields control={control} canEditPrivate={canEditPrivate} />
      </div>
    </FormModal>
  );
}

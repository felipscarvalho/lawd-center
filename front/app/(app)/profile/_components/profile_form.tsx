"use client";

import { useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/feedback/toast";
import {
  ProfileFormFields,
  toProfileFormValues,
  toProfilePayload,
} from "@/components/administration/profile_form_fields";
import { FormActions } from "@/components/layout/form_actions";
import { useUpdateProfile } from "@/hooks/administration/use_profiles";
import { handleApiError } from "@/lib/form_errors";
import { profileSchema, type ProfileForm as ProfileFormValues } from "@/schemas/administration";
import type { Profile } from "@/types/administration";

interface ProfileFormProps {
  profile: Profile;
  /** Nascimento, matrícula e objetivo: a própria pessoa ou quem pode ver dados privados */
  canEditPrivate: boolean;
  /** Campos extras no início de "Dados pessoais" (ex.: nome e e-mail só leitura em Meu perfil) */
  personalFields?: ReactNode;
  /** Próprio perfil: mostra as descrições das seções, escritas para a pessoa */
  isSelf?: boolean;
}

/** Formulário do próprio perfil, editável direto na página (sem modal) */
export function ProfileForm({ profile, canEditPrivate, personalFields, isSelf = false }: ProfileFormProps) {
  const updateProfile = useUpdateProfile(profile.user.id);

  const { control, handleSubmit, setError, reset, formState } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toProfileFormValues(profile),
  });

  // Recarrega o formulário só quando o perfil muda de fato (o TanStack Query mantém a mesma referência se nada mudou)
  useEffect(() => {
    reset(toProfileFormValues(profile));
  }, [profile, reset]);

  const onSubmit = handleSubmit((values) => {
    const payload = toProfilePayload(values, canEditPrivate);

    updateProfile.mutate(payload, {
      onSuccess: () => toast.success("Perfil atualizado", { description: profile.user.fullName }),
      onError: (error) => handleApiError(error, setError),
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-6 p-5 sm:p-6" noValidate>
      <div className="flex flex-col gap-6">
        <ProfileFormFields
          control={control}
          canEditPrivate={canEditPrivate}
          personalFields={personalFields}
          personalDescription={personalFields ? "Nome e e-mail são alterados pela gestão." : undefined}
          showDescriptions={isSelf}
        />
      </div>

      <FormActions
        isDirty={formState.isDirty}
        isSubmitting={updateProfile.isPending}
        onDiscard={() => reset(toProfileFormValues(profile))}
      />
    </form>
  );
}

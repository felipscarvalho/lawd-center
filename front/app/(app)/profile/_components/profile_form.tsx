"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { toast } from "@/components/feedback/toast";
import {
  FormSection,
  ProfileFormFields,
  toProfileFormValues,
  toProfilePayload,
} from "@/components/administration/profile_form_fields";
import { useUpdateProfile } from "@/hooks/administration/use_profiles";
import { handleApiError } from "@/lib/form_errors";
import { profileSchema, type ProfileForm as ProfileFormValues } from "@/schemas/administration";
import type { Profile } from "@/types/administration";

/** Formulário do próprio perfil, direto na página (sem modal) */
export function ProfileForm({ profile }: { profile: Profile }) {
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
    // Na própria página a pessoa sempre edita os dados privados
    const payload = toProfilePayload(values, true);

    updateProfile.mutate(payload, {
      onSuccess: () => toast.success("Perfil atualizado"),
      onError: (error) => handleApiError(error, setError),
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-8 p-5 sm:p-6" noValidate>
      <FormSection title="Dados da conta">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome completo" value={profile.user.fullName} isDisabled />
          <Input label="E-mail" value={profile.user.email} isDisabled />
        </div>
        <p className="-mt-2 text-sm text-tertiary">Nome e e-mail são alterados pela gestão.</p>
      </FormSection>

      <ProfileFormFields control={control} canEditPrivate />

      <div className="flex flex-col-reverse gap-3 border-t border-secondary pt-6 sm:flex-row sm:justify-end">
        <Button
          color="secondary"
          onClick={() => reset(toProfileFormValues(profile))}
          isDisabled={!formState.isDirty || updateProfile.isPending}
        >
          Descartar
        </Button>
        <Button type="submit" isDisabled={!formState.isDirty} isLoading={updateProfile.isPending} showTextWhileLoading>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}

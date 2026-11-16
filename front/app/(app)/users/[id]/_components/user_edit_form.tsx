"use client";

import { useEffect } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail01 } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { toast } from "@/components/feedback/toast";
import {
  ProfileFormFields,
  toProfileFormValues,
  toProfilePayload,
} from "@/components/administration/profile_form_fields";
import { FormActions } from "@/components/layout/form_actions";
import { useUpdateProfile } from "@/hooks/administration/use_profiles";
import { useUpdateUser } from "@/hooks/administration/use_users";
import { handleApiError } from "@/lib/form_errors";
import { userEditSchema, type ProfileForm, type UserEditForm } from "@/schemas/administration";
import type { Profile, User } from "@/types/administration";

const accountFields = ["fullName", "email"] as const;

const toFormValues = (user: User, profile: Profile): UserEditForm => ({
  fullName: user.fullName,
  email: user.email,
  ...toProfileFormValues(profile),
});

interface UserEditFormProps {
  user: User;
  profile: Profile;
  /** Nome e e-mail (user.update); sem ela os campos da conta ficam só leitura. A senha fica na coluna da esquerda */
  canEditAccount: boolean;
  /** Nascimento, matrícula e objetivo (própria pessoa ou view_private) */
  canEditPrivate: boolean;
}

/**
 * Detalhe do usuário editável direto na tela: conta e perfil num formulário só, com um único "Salvar".
 * Cada parte alterada vai para o seu endpoint (usuário e perfil).
 */
export function UserEditForm({ user, profile, canEditAccount, canEditPrivate }: UserEditFormProps) {
  const updateUser = useUpdateUser(user.id);
  const updateProfile = useUpdateProfile(user.id);

  const { control, handleSubmit, setError, reset, formState } = useForm<UserEditForm>({
    resolver: zodResolver(userEditSchema),
    defaultValues: toFormValues(user, profile),
  });

  // Recarrega quando os dados salvos mudam de fato (o TanStack Query mantém a referência se nada mudou)
  useEffect(() => {
    reset(toFormValues(user, profile));
  }, [user, profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const { fullName, email, ...profileValues } = values;
    const dirty = formState.dirtyFields;
    const isAccountDirty = canEditAccount && accountFields.some((field) => dirty[field]);
    const isProfileDirty = Object.keys(dirty).some((field) => !(accountFields as readonly string[]).includes(field));

    try {
      await Promise.all([
        isAccountDirty && updateUser.mutateAsync({ fullName, email }),
        isProfileDirty && updateProfile.mutateAsync(toProfilePayload(profileValues, canEditPrivate)),
      ]);

      toast.success("Alterações salvas", { description: fullName });
      reset(values);
    } catch (error) {
      handleApiError(error, setError);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-6 p-5 sm:p-6" noValidate>
      <div className="flex flex-col gap-6">
        <ProfileFormFields
          // Os campos do perfil têm os mesmos nomes no formulário combinado
          control={control as unknown as Control<ProfileForm>}
          canEditPrivate={canEditPrivate}
          showDescriptions={false}
          personalFields={<AccountFields control={control} isDisabled={!canEditAccount} />}
        />
      </div>

      <FormActions
        isDirty={formState.isDirty}
        isSubmitting={updateUser.isPending || updateProfile.isPending}
        onDiscard={() => reset(toFormValues(user, profile))}
      />
    </form>
  );
}

function AccountFields({ control, isDisabled }: { control: Control<UserEditForm>; isDisabled: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Controller
        control={control}
        name="fullName"
        render={({ field, fieldState }) => (
          <Input
            label="Nome completo"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isDisabled={isDisabled}
            isInvalid={Boolean(fieldState.error)}
            hint={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <Input
            label="E-mail"
            type="email"
            icon={Mail01}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isDisabled={isDisabled}
            isInvalid={Boolean(fieldState.error)}
            hint={fieldState.error?.message}
          />
        )}
      />
    </div>
  );
}

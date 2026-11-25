"use client";

import { type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail01 } from "@untitledui/icons";
import { toast } from "@/components/feedback/toast";
import { FormInput } from "@/components/forms/form_input";
import {
  ProfileFormFields,
  toProfileFormValues,
  toProfilePayload,
} from "@/components/administration/profile_form_fields";
import { FormActions } from "@/components/layout/form_actions";
import { useUpdateProfile } from "@/hooks/administration/use_profiles";
import { useUpdateUser } from "@/hooks/administration/use_users";
import { useEditForm } from "@/hooks/use_edit_form";
import { handleApiError } from "@/lib/form_errors";
import {
  pendingUserEditSchema,
  userEditSchema,
  type ProfileForm,
  type UserEditForm,
} from "@/schemas/administration";
import type { Profile, User } from "@/types/administration";

const accountFields = ["fullName", "email"] as const;

const toFormValues = (user: User, profile: Profile): UserEditForm => ({
  fullName: user.fullName ?? "",
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

  const { control, handleSubmit, setError, reset, formState, discard } = useEditForm<UserEditForm>({
    resolver: zodResolver(user.isPending ? pendingUserEditSchema : userEditSchema),
    values: () => toFormValues(user, profile),
    deps: [user, profile],
  });

  const onSubmit = handleSubmit(async (values) => {
    const { fullName, email, ...profileValues } = values;
    const dirty = formState.dirtyFields;
    const isAccountDirty = canEditAccount && accountFields.some((field) => dirty[field]);
    const isProfileDirty = Object.keys(dirty).some((field) => !(accountFields as readonly string[]).includes(field));

    try {
      await Promise.all([
        // Nome vazio só acontece com convite pendente: fica para a pessoa informar ao aceitar
        isAccountDirty && updateUser.mutateAsync({ fullName: fullName || undefined, email }),
        isProfileDirty && updateProfile.mutateAsync(toProfilePayload(profileValues, canEditPrivate)),
      ]);

      toast.success("Alterações salvas", { description: fullName || email });
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
          personalFields={<AccountFields control={control} isDisabled={!canEditAccount} isPending={user.isPending} />}
        />
      </div>

      <FormActions
        isDirty={formState.isDirty}
        isSubmitting={updateUser.isPending || updateProfile.isPending}
        onDiscard={discard}
      />
    </form>
  );
}

interface AccountFieldsProps {
  control: Control<UserEditForm>;
  isDisabled: boolean;
  /** Convite não aceito: o nome pode ficar vazio */
  isPending: boolean;
}

function AccountFields({ control, isDisabled, isPending }: AccountFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormInput
        control={control}
        name="fullName"
        label="Nome completo"
        placeholder={isPending ? "Informado pela pessoa ao aceitar o convite" : undefined}
        isDisabled={isDisabled}
      />

      <FormInput
        control={control}
        name="email"
        label="E-mail"
        type="email"
        icon={Mail01}
        isDisabled={isDisabled}
      />
    </div>
  );
}

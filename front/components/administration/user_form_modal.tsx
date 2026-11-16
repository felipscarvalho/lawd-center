"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail01 } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { toast } from "@/components/feedback/toast";
import { FormModal } from "@/components/overlays/form_modal";
import { useCreateUser, useUpdateUser } from "@/hooks/administration/use_users";
import { handleApiError } from "@/lib/form_errors";
import { createUserSchema, updateUserSchema, type UpdateUserForm } from "@/schemas/administration";
import type { User } from "@/types/administration";

interface UserFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Sem usuário: cadastro; com usuário: edição */
  user?: User;
}

/** Cadastro e edição de usuário. Na edição, senha em branco mantém a atual */
export function UserFormModal({ isOpen, onOpenChange, user }: UserFormModalProps) {
  const isEditing = Boolean(user);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(user?.id ?? 0);
  const mutation = isEditing ? updateUser : createUser;

  const { control, handleSubmit, setError, reset } = useForm<UpdateUserForm>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({ fullName: user?.fullName ?? "", email: user?.email ?? "", password: "" });
    }
  }, [isOpen, user, reset]);

  const onSubmit = handleSubmit((values) => {
    const payload = { ...values, password: values.password || undefined };
    const options = {
      onSuccess: () => {
        toast.success(isEditing ? "Usuário atualizado" : "Usuário cadastrado", { description: values.fullName });
        onOpenChange(false);
      },
      onError: (error: unknown) => handleApiError(error, setError),
    };

    if (isEditing) {
      updateUser.mutate(payload, options);
    } else {
      createUser.mutate({ ...payload, password: values.password }, options);
    }
  });

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar usuário" : "Novo usuário"}
      description={isEditing ? undefined : "O cargo é atribuído depois, na página do usuário ou no organograma."}
      onSubmit={onSubmit}
      submitLabel={isEditing ? "Salvar" : "Cadastrar"}
      isSubmitting={mutation.isPending}
    >
      <Controller
        control={control}
        name="fullName"
        render={({ field, fieldState }) => (
          <Input
            label="Nome completo"
            placeholder="Nome e sobrenome"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
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
            placeholder="pessoa@exemplo.com"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={Boolean(fieldState.error)}
            hint={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <Input
            label={isEditing ? "Nova senha" : "Senha"}
            type="password"
            autoComplete="new-password"
            placeholder={isEditing ? "Deixe em branco para manter" : "Pelo menos 8 caracteres"}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={Boolean(fieldState.error)}
            hint={fieldState.error?.message}
          />
        )}
      />
    </FormModal>
  );
}

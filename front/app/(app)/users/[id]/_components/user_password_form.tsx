"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { toast } from "@/components/feedback/toast";
import { useUpdateUser } from "@/hooks/administration/use_users";
import { handleApiError } from "@/lib/form_errors";
import { resetPasswordSchema, type ResetPasswordForm } from "@/schemas/administration";
import type { User } from "@/types/administration";

const emptyValues: ResetPasswordForm = { password: "" };

/** Senha nova definida pela gestão (user.update), na coluna da esquerda como em Meu perfil */
export function UserPasswordForm({ user }: { user: User }) {
  const updateUser = useUpdateUser(user.id);

  const { control, handleSubmit, setError, reset, formState } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: emptyValues,
  });

  const onSubmit = handleSubmit((values) => {
    updateUser.mutate(values, {
      onSuccess: () => {
        toast.success("Senha alterada", { description: user.fullName });
        reset(emptyValues);
      },
      onError: (error) => handleApiError(error, setError),
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 border-t border-secondary pt-6" noValidate>
      <h3 className="text-md font-semibold text-primary">Senha</h3>

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={Boolean(fieldState.error)}
            hint={fieldState.error?.message ?? "Pelo menos 8 caracteres"}
          />
        )}
      />

      <Button
        type="submit"
        color="secondary"
        isDisabled={!formState.isDirty}
        isLoading={updateUser.isPending}
        showTextWhileLoading
      >
        Trocar senha
      </Button>
    </form>
  );
}

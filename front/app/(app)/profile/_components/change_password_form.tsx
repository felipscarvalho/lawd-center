"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { toast } from "@/components/feedback/toast";
import { useChangePassword } from "@/hooks/administration/use_auth";
import { handleApiError } from "@/lib/form_errors";
import { changePasswordSchema, type ChangePasswordForm as ChangePasswordValues } from "@/schemas/administration";

const emptyValues: ChangePasswordValues = { currentPassword: "", newPassword: "" };

/** Troca da própria senha; as outras sessões abertas são encerradas pelo backend */
export function ChangePasswordForm() {
  const changePassword = useChangePassword();

  const { control, handleSubmit, setError, reset } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: emptyValues,
  });

  const onSubmit = handleSubmit((values) => {
    changePassword.mutate(values, {
      onSuccess: () => {
        toast.success("Senha alterada", { description: "As outras sessões abertas foram encerradas." });
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
        name="currentPassword"
        render={({ field, fieldState }) => (
          <Input
            label="Senha atual"
            type="password"
            autoComplete="current-password"
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
        name="newPassword"
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

      <Button type="submit" color="secondary" isLoading={changePassword.isPending} showTextWhileLoading>
        Trocar senha
      </Button>
    </form>
  );
}

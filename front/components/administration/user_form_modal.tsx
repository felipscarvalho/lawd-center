"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail01 } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { toast } from "@/components/feedback/toast";
import { FormModal } from "@/components/overlays/form_modal";
import { useCreateUser } from "@/hooks/administration/use_users";
import { useOpenSession } from "@/hooks/use_open_session";
import { handleApiError } from "@/lib/form_errors";
import { createUserSchema, type CreateUserForm } from "@/schemas/administration";

interface UserFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

/** Cadastro de usuário. A edição é feita direto no detalhe do usuário */
export function UserFormModal(props: UserFormModalProps) {
  const session = useOpenSession(props.isOpen);

  return <UserFormModalContent key={session} {...props} />;
}

/** Formulário montado a cada abertura do modal (ver useOpenSession) */
function UserFormModalContent({ isOpen, onOpenChange }: UserFormModalProps) {
  const createUser = useCreateUser();

  const { control, handleSubmit, setError } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    createUser.mutate(values, {
      onSuccess: () => {
        toast.success("Usuário cadastrado", { description: values.fullName });
        onOpenChange(false);
      },
      onError: (error) => handleApiError(error, setError),
    });
  });

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Novo usuário"
      description="O cargo é atribuído depois, na página do usuário ou no organograma."
      onSubmit={onSubmit}
      submitLabel="Cadastrar"
      isSubmitting={createUser.isPending}
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
            label="Senha"
            type="password"
            autoComplete="new-password"
            placeholder="Pelo menos 8 caracteres"
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

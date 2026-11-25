"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail01 } from "@untitledui/icons";
import { toast } from "@/components/feedback/toast";
import { FormInput } from "@/components/forms/form_input";
import { FormModal } from "@/components/overlays/form_modal";
import { useCreateUser } from "@/hooks/administration/use_users";
import { useOpenSession } from "@/hooks/use_open_session";
import { handleApiError } from "@/lib/form_errors";
import { createUserSchema, type CreateUserForm } from "@/schemas/administration";

interface UserFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

/** Cadastro de usuário por convite: só o e-mail. A edição é feita direto no detalhe do usuário */
export function UserFormModal(props: UserFormModalProps) {
  const session = useOpenSession(props.isOpen);

  return <UserFormModalContent key={session} {...props} />;
}

/** Formulário montado a cada abertura do modal (ver useOpenSession) */
function UserFormModalContent({ isOpen, onOpenChange }: UserFormModalProps) {
  const createUser = useCreateUser();

  const { control, handleSubmit, setError } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit((values) => {
    createUser.mutate(values, {
      onSuccess: (user) => {
        toast.success("Convite enviado", { description: `${user.email} vai receber o link para criar a senha.` });
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
      description="A pessoa recebe um e-mail para informar o nome e criar a senha. O cargo é atribuído depois, na página do usuário ou no organograma."
      onSubmit={onSubmit}
      submitLabel="Enviar convite"
      isSubmitting={createUser.isPending}
    >
      <FormInput
        control={control}
        name="email"
        label="E-mail"
        type="email"
        icon={Mail01}
        placeholder="pessoa@exemplo.com"
      />
    </FormModal>
  );
}

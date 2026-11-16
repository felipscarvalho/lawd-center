"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/feedback/toast";
import { FormSelect } from "@/components/forms/form_select";
import { FormInput } from "@/components/forms/form_input";
import { FormModal } from "@/components/overlays/form_modal";
import { useOpenSession } from "@/hooks/use_open_session";
import { useCreateDirectorate, useUpdateDirectorate } from "@/hooks/administration/use_directorates";
import { directorateKindLabels } from "@/lib/administration";
import { handleApiError } from "@/lib/form_errors";
import { createDirectorateSchema, type CreateDirectorateForm } from "@/schemas/administration";
import type { Directorate } from "@/types/administration";

interface DirectorateFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Sem diretoria: cadastro; com diretoria: só o nome pode mudar (a chave é usada pelo código) */
  directorate?: Directorate;
}

const kindOptions = (["standard", "core"] as const).map((kind) => ({ id: kind, label: directorateKindLabels[kind] }));

export function DirectorateFormModal(props: DirectorateFormModalProps) {
  const session = useOpenSession(props.isOpen);

  return <DirectorateFormModalContent key={session} {...props} />;
}

/** Formulário montado a cada abertura do modal (ver useOpenSession) */
function DirectorateFormModalContent({ isOpen, onOpenChange, directorate }: DirectorateFormModalProps) {
  const isEditing = Boolean(directorate);
  const createDirectorate = useCreateDirectorate();
  const updateDirectorate = useUpdateDirectorate(directorate?.id ?? 0);
  const mutation = isEditing ? updateDirectorate : createDirectorate;

  const { control, handleSubmit, setError } = useForm<CreateDirectorateForm>({
    resolver: zodResolver(createDirectorateSchema),
    defaultValues: { name: directorate?.name ?? "", key: directorate?.key ?? "", kind: directorate?.kind ?? "standard" },
  });

  const onSubmit = handleSubmit((values) => {
    const options = {
      onSuccess: () => {
        toast.success(isEditing ? "Diretoria atualizada" : "Diretoria cadastrada", { description: values.name });
        onOpenChange(false);
      },
      onError: (error: unknown) => handleApiError(error, setError),
    };

    if (isEditing) {
      updateDirectorate.mutate({ name: values.name }, options);
    } else {
      createDirectorate.mutate(values, options);
    }
  });

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? "Renomear diretoria" : "Nova diretoria"}
      onSubmit={onSubmit}
      submitLabel={isEditing ? "Salvar" : "Cadastrar"}
      isSubmitting={mutation.isPending}
    >
      <FormInput
        control={control}
        name="name"
        label="Nome"
        placeholder="Ex.: Jurídico"
      />

      {!isEditing && (
        <>
          <FormInput
            control={control}
            name="key"
            label="Chave"
            placeholder="Ex.: legal_affairs"
            tooltip="Identificador em inglês usado pelo sistema. Não pode ser alterado depois."
          />

          <FormSelect
            control={control}
            name="kind"
            label="Tipo"
            items={kindOptions}
          />
        </>
      )}
    </FormModal>
  );
}

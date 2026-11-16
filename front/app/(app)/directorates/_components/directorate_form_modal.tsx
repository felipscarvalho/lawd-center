"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { toast } from "@/components/feedback/toast";
import { FormModal } from "@/components/overlays/form_modal";
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

export function DirectorateFormModal({ isOpen, onOpenChange, directorate }: DirectorateFormModalProps) {
  const isEditing = Boolean(directorate);
  const createDirectorate = useCreateDirectorate();
  const updateDirectorate = useUpdateDirectorate(directorate?.id ?? 0);
  const mutation = isEditing ? updateDirectorate : createDirectorate;

  const { control, handleSubmit, setError, reset } = useForm<CreateDirectorateForm>({
    resolver: zodResolver(createDirectorateSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: directorate?.name ?? "", key: directorate?.key ?? "", kind: directorate?.kind ?? "standard" });
    }
  }, [isOpen, directorate, reset]);

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
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <Input
            label="Nome"
            placeholder="Ex.: Jurídico"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={Boolean(fieldState.error)}
            hint={fieldState.error?.message}
          />
        )}
      />

      {!isEditing && (
        <>
          <Controller
            control={control}
            name="key"
            render={({ field, fieldState }) => (
              <Input
                label="Chave"
                placeholder="Ex.: legal_affairs"
                tooltip="Identificador em inglês usado pelo sistema. Não pode ser alterado depois."
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
            name="kind"
            render={({ field, fieldState }) => (
              <Select
                label="Tipo"
                items={kindOptions}
                selectedKey={field.value}
                onSelectionChange={(key) => field.onChange(key)}
                isInvalid={Boolean(fieldState.error)}
                hint={fieldState.error?.message}
              >
                {(item) => <Select.Item id={item.id} label={item.label} />}
              </Select>
            )}
          />
        </>
      )}
    </FormModal>
  );
}

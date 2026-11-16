"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { ComboBox } from "@/components/base/select/combobox";
import { Select } from "@/components/base/select/select";
import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import { toast } from "@/components/feedback/toast";
import { FormModal } from "@/components/overlays/form_modal";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useDirectorates } from "@/hooks/administration/use_directorates";
import { useAssignMembership } from "@/hooks/administration/use_memberships";
import { useUsers } from "@/hooks/administration/use_users";
import { positionLabels, positionsByKind } from "@/lib/administration";
import { handleApiError } from "@/lib/form_errors";
import { assignMembershipSchema, type AssignMembershipForm } from "@/schemas/administration";
import type { Directorate, User } from "@/types/administration";

interface AssignMembershipModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Diretoria já definida (ex.: aberto a partir do card da diretoria no organograma) */
  directorate?: Directorate;
  /** Usuário já definido (ex.: aberto a partir da página do usuário) */
  user?: User;
}

/**
 * Atribui um cargo. Mostra só as combinações que quem está atribuindo pode fazer:
 * com gestão global, qualquer cargo; com gestão só na própria diretoria (diretor), apenas membro efetivo.
 */
export function AssignMembershipModal({ isOpen, onOpenChange, directorate, user }: AssignMembershipModalProps) {
  const { can } = usePermissions();
  const directorates = useDirectorates();
  const users = useUsers({ active: true });
  const assign = useAssignMembership();

  const { control, handleSubmit, setError, reset, setValue } = useForm<AssignMembershipForm>({
    resolver: zodResolver(assignMembershipSchema),
  });

  // Ao abrir, recomeça o formulário com os valores já definidos pela tela de origem
  useEffect(() => {
    if (isOpen) {
      reset({ userId: user?.id, directorateId: directorate?.id, position: undefined, startsAt: undefined });
    }
  }, [isOpen, user, directorate, reset]);

  const directorateId = useWatch({ control, name: "directorateId" });
  const selectedDirectorate = directorates.data?.find((item) => item.id === directorateId);

  // Diretorias onde quem atribui pode gerenciar vínculos
  const manageableDirectorates = useMemo(
    () => (directorates.data ?? []).filter((item) => can("administration.membership.manage", item.id)),
    [directorates.data, can],
  );

  const positionOptions = useMemo(() => {
    if (!selectedDirectorate) return [];

    const hasGlobalManage = can("administration.membership.manage");
    const positions = positionsByKind[selectedDirectorate.kind];

    return hasGlobalManage ? positions : positions.filter((position) => position === "member");
  }, [selectedDirectorate, can]);

  const onSubmit = handleSubmit((values) => {
    assign.mutate(values, {
      onSuccess: (membership) => {
        toast.success("Cargo atribuído", {
          description: `${membership.positionLabel} em ${membership.directorate?.name ?? "diretoria"}`,
        });
        onOpenChange(false);
      },
      onError: (error) => handleApiError(error, setError),
    });
  });

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Atribuir cargo"
      description="Se a pessoa já tiver um cargo nesta diretoria, ele é encerrado e substituído pelo novo."
      onSubmit={onSubmit}
      submitLabel="Atribuir"
      isSubmitting={assign.isPending}
    >
      {!user && (
        <Controller
          control={control}
          name="userId"
          render={({ field, fieldState }) => (
            <ComboBox
              label="Usuário"
              placeholder="Buscar pelo nome"
              shortcut={false}
              items={(users.data ?? []).map((item) => ({ id: item.id, label: item.fullName, supportingText: item.email }))}
              selectedKey={field.value ?? null}
              onSelectionChange={(key) => field.onChange(key === null ? undefined : Number(key))}
              isInvalid={Boolean(fieldState.error)}
              hint={fieldState.error?.message}
            >
              {(item) => <Select.Item id={item.id} label={item.label} supportingText={item.supportingText} />}
            </ComboBox>
          )}
        />
      )}

      {!directorate && (
        <Controller
          control={control}
          name="directorateId"
          render={({ field, fieldState }) => (
            <Select
              label="Diretoria"
              placeholder="Selecione a diretoria"
              items={manageableDirectorates.map((item) => ({ id: item.id, label: item.name }))}
              selectedKey={field.value ?? null}
              onSelectionChange={(key) => {
                field.onChange(key === null ? undefined : Number(key));
                // O cargo depende da diretoria escolhida
                setValue("position", undefined as never);
              }}
              isInvalid={Boolean(fieldState.error)}
              hint={fieldState.error?.message}
            >
              {(item) => <Select.Item id={item.id} label={item.label} />}
            </Select>
          )}
        />
      )}

      <Controller
        control={control}
        name="position"
        render={({ field, fieldState }) => (
          <Select
            label="Cargo"
            placeholder={selectedDirectorate ? "Selecione o cargo" : "Escolha a diretoria primeiro"}
            isDisabled={!selectedDirectorate}
            items={positionOptions.map((position) => ({ id: position, label: positionLabels[position] }))}
            selectedKey={field.value ?? null}
            onSelectionChange={(key) => field.onChange(key ?? undefined)}
            isInvalid={Boolean(fieldState.error)}
            hint={fieldState.error?.message}
          >
            {(item) => <Select.Item id={item.id} label={item.label} />}
          </Select>
        )}
      />

      <Controller
        control={control}
        name="startsAt"
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1.5">
            <Label>Início</Label>
            <DatePicker
              aria-label="Data de início"
              value={field.value ? parseDate(field.value) : null}
              onChange={(value) => field.onChange(value?.toString())}
            />
            <HintText isInvalid={Boolean(fieldState.error)}>
              {fieldState.error?.message ?? "Opcional; sem data, o cargo começa hoje."}
            </HintText>
          </div>
        )}
      />
    </FormModal>
  );
}

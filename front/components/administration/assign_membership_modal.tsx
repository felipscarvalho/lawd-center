"use client";

import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import { toast } from "@/components/feedback/toast";
import { FormSelect } from "@/components/forms/form_select";
import { FormModal } from "@/components/overlays/form_modal";
import { UserSearchComboBox } from "@/components/administration/user_search_combobox";
import { useOpenSession } from "@/hooks/use_open_session";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useDirectorates } from "@/hooks/administration/use_directorates";
import { useAssignMembership } from "@/hooks/administration/use_memberships";
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
export function AssignMembershipModal(props: AssignMembershipModalProps) {
  const session = useOpenSession(props.isOpen);

  return <AssignMembershipModalContent key={session} {...props} />;
}

/** Formulário montado a cada abertura do modal (ver useOpenSession) */
function AssignMembershipModalContent({ isOpen, onOpenChange, directorate, user }: AssignMembershipModalProps) {
  const { can } = usePermissions();
  const directorates = useDirectorates();
  const assign = useAssignMembership();

  const { control, handleSubmit, setError, setValue } = useForm<AssignMembershipForm>({
    resolver: zodResolver(assignMembershipSchema),
    // Valores já definidos pela tela de origem
    defaultValues: { userId: user?.id, directorateId: directorate?.id },
  });

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
            <UserSearchComboBox
              label="Usuário"
              value={field.value}
              onChange={field.onChange}
              isInvalid={Boolean(fieldState.error)}
              hint={fieldState.error?.message}
            />
          )}
        />
      )}

      {!directorate && (
        <FormSelect
          control={control}
          name="directorateId"
          label="Diretoria"
          placeholder="Selecione a diretoria"
          items={manageableDirectorates.map((item) => ({ id: item.id, label: item.name }))}
          valueType="number"
          // O cargo depende da diretoria escolhida
          onValueChange={() => setValue("position", undefined as never)}
        />
      )}

      <FormSelect
        control={control}
        name="position"
        label="Cargo"
        placeholder={selectedDirectorate ? "Selecione o cargo" : "Escolha a diretoria primeiro"}
        isDisabled={!selectedDirectorate}
        items={positionOptions.map((position) => ({ id: position, label: positionLabels[position] }))}
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

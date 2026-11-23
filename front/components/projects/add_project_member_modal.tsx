"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { HintText } from "@/components/base/input/hint-text";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { toast } from "@/components/feedback/toast";
import { FormSelect } from "@/components/forms/form_select";
import { UserSearchComboBox } from "@/components/administration/user_search_combobox";
import { FormModal } from "@/components/overlays/form_modal";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useAddProjectMember } from "@/hooks/projects/use_project_team";
import { useOpenSession } from "@/hooks/use_open_session";
import { handleApiError } from "@/lib/form_errors";
import { projectRoleLabels } from "@/lib/projects";
import { addProjectMemberSchema, type AddProjectMemberForm } from "@/schemas/projects";
import type { User } from "@/types/administration";
import type { Project } from "@/types/projects";

interface AddProjectMemberModalProps {
  project: Project;
  /** Pessoa já escolhida (ex.: vinda dos interessados) */
  user?: User;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

/**
 * Coloca alguém na equipe. Definir o coordenador é só da gestão de equipes; o coordenador do projeto
 * adiciona integrantes. Se a pessoa já está no projeto com outro papel, o papel é trocado.
 */
export function AddProjectMemberModal(props: AddProjectMemberModalProps) {
  const session = useOpenSession(props.isOpen);

  return <AddProjectMemberModalContent key={session} {...props} />;
}

/** Formulário montado a cada abertura do modal (ver useOpenSession) */
function AddProjectMemberModalContent({ project, user, isOpen, onOpenChange }: AddProjectMemberModalProps) {
  const addMember = useAddProjectMember(project.id);
  const { can } = usePermissions();

  const canSetCoordinator = can("projects.team.manage", project.directorateId);
  const roleOptions = (canSetCoordinator ? (["member", "coordinator"] as const) : (["member"] as const)).map(
    (role) => ({ id: role, label: projectRoleLabels[role] }),
  );

  const { control, handleSubmit, setError } = useForm<AddProjectMemberForm>({
    resolver: zodResolver(addProjectMemberSchema),
    defaultValues: { userId: user?.id, role: "member" },
  });

  const onSubmit = handleSubmit((values) => {
    addMember.mutate(values, {
      onSuccess: (member) => {
        toast.success("Equipe atualizada", { description: `${member.user.fullName} · ${member.roleLabel}` });
        onOpenChange(false);
      },
      onError: (error) => handleApiError(error, setError),
    });
  });

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Adicionar à equipe"
      description={
        project.coordinator
          ? "Se a pessoa já estiver na equipe com outro papel, ele é trocado e o histórico é mantido."
          : "O projeto ainda não tem coordenador."
      }
      onSubmit={onSubmit}
      submitLabel="Adicionar"
      isSubmitting={addMember.isPending}
    >
      {user ? (
        <Input label="Pessoa" value={user.fullName} isDisabled />
      ) : (
        <Controller
          control={control}
          name="userId"
          render={({ field, fieldState }) => (
            <UserSearchComboBox
              label="Pessoa"
              value={field.value}
              onChange={field.onChange}
              isInvalid={Boolean(fieldState.error)}
              hint={fieldState.error?.message}
            />
          )}
        />
      )}

      <FormSelect control={control} name="role" label="Papel" items={roleOptions} />

      <Controller
        control={control}
        name="startsAt"
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1.5">
            <Label>Entrada</Label>
            <DatePicker
              aria-label="Data de entrada"
              value={field.value ? parseDate(field.value) : null}
              onChange={(value) => field.onChange(value?.toString())}
            />
            <HintText isInvalid={Boolean(fieldState.error)}>
              {fieldState.error?.message ?? "Opcional; sem data, a pessoa entra hoje."}
            </HintText>
          </div>
        )}
      />
    </FormModal>
  );
}

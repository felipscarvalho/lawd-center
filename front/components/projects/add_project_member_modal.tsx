"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { HintText } from "@/components/base/input/hint-text";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { ComboBox } from "@/components/base/select/combobox";
import { Select } from "@/components/base/select/select";
import { toast } from "@/components/feedback/toast";
import { FormSelect } from "@/components/forms/form_select";
import { UserSearchComboBox } from "@/components/administration/user_search_combobox";
import { FormModal } from "@/components/overlays/form_modal";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useAddProjectMember } from "@/hooks/projects/use_project_team";
import { useProjects } from "@/hooks/projects/use_projects";
import { useOpenSession } from "@/hooks/use_open_session";
import { handleApiError } from "@/lib/form_errors";
import { isTeamLocked, projectRoleLabels } from "@/lib/projects";
import { addProjectMemberSchema, type AddProjectMemberForm } from "@/schemas/projects";
import type { User } from "@/types/administration";
import type { Project } from "@/types/projects";

interface AddProjectMemberModalProps {
  /** Projeto já definido (detalhe do projeto); sem ele, a pessoa escolhe entre os que pode gerenciar */
  project?: Project;
  /** Pessoa já definida (interessados, perfil da pessoa) */
  user?: User;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

/**
 * Coloca alguém na equipe de um projeto. Definir o coordenador é só da gestão de equipes da diretoria
 * do projeto; o coordenador do projeto adiciona integrantes. Se a pessoa já está no projeto com outro
 * papel, o papel é trocado.
 */
export function AddProjectMemberModal(props: AddProjectMemberModalProps) {
  const session = useOpenSession(props.isOpen);

  return <AddProjectMemberModalContent key={session} {...props} />;
}

/** Formulário montado a cada abertura do modal (ver useOpenSession) */
function AddProjectMemberModalContent({ project, user, isOpen, onOpenChange }: AddProjectMemberModalProps) {
  const addMember = useAddProjectMember();
  const { can } = usePermissions();

  // Sem projeto definido: projetos com a equipe aberta (não iniciados ou em andamento) de diretorias
  // onde a pessoa gerencia equipes
  const projects = useProjects({ sort: "name", perPage: 100 }, { enabled: !project });
  const manageableProjects = (projects.data?.data ?? []).filter(
    (item) => !isTeamLocked(item.status) && can("projects.team.manage", item.directorateId),
  );

  const { control, handleSubmit, setError, setValue } = useForm<AddProjectMemberForm>({
    resolver: zodResolver(addProjectMemberSchema),
    defaultValues: { projectId: project?.id, userId: user?.id, role: "member" },
  });

  const projectId = useWatch({ control, name: "projectId" });
  const selectedProject = project ?? manageableProjects.find((item) => item.id === projectId);

  const canSetCoordinator = Boolean(selectedProject) && can("projects.team.manage", selectedProject!.directorateId);
  const roleOptions = (canSetCoordinator ? (["member", "coordinator"] as const) : (["member"] as const)).map(
    (role) => ({ id: role, label: projectRoleLabels[role] }),
  );

  const onSubmit = handleSubmit(({ projectId: id, ...payload }) => {
    addMember.mutate(
      { projectId: id, payload },
      {
        onSuccess: (member) => {
          toast.success("Equipe atualizada", { description: `${member.user.fullName} · ${member.roleLabel}` });
          onOpenChange(false);
        },
        onError: (error) => handleApiError(error, setError),
      },
    );
  });

  const description = !project
    ? "Só aparecem projetos não iniciados ou em andamento cuja equipe você gerencia."
    : project.coordinator
      ? "Se a pessoa já estiver na equipe com outro papel, ele é trocado e o histórico é mantido."
      : "O projeto ainda não tem coordenador.";

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={project ? "Adicionar à equipe" : "Adicionar a projeto"}
      description={description}
      onSubmit={onSubmit}
      submitLabel="Adicionar"
      isSubmitting={addMember.isPending}
    >
      {!project && (
        <Controller
          control={control}
          name="projectId"
          render={({ field, fieldState }) => (
            <ComboBox
              label="Projeto"
              placeholder="Buscar pelo nome"
              shortcut={false}
              items={manageableProjects.map((item) => ({
                id: item.id,
                label: item.name,
                // O nome não é único: a diretoria ajuda a diferenciar
                supportingText: item.directorate.name,
              }))}
              selectedKey={field.value ?? null}
              onSelectionChange={(key) => {
                field.onChange(key === null ? undefined : Number(key));
                // O papel de coordenador depende do projeto escolhido
                setValue("role", "member");
              }}
              isInvalid={Boolean(fieldState.error)}
              hint={fieldState.error?.message}
            >
              {(item) => <Select.Item id={item.id} label={item.label} supportingText={item.supportingText} />}
            </ComboBox>
          )}
        />
      )}

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

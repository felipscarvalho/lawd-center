"use client";

import { Controller, useWatch, type Control } from "react-hook-form";
import { parseDate } from "@internationalized/date";
import { InputDate } from "@/components/base/input/input-date";
import { TextArea } from "@/components/base/textarea/textarea";
import { FormInput } from "@/components/forms/form_input";
import { FormSelect } from "@/components/forms/form_select";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useDirectorates } from "@/hooks/administration/use_directorates";
import { toOptions } from "@/lib/administration";
import { projectPriorityLabels, projectStatusLabels } from "@/lib/projects";
import type { ProjectForm } from "@/schemas/projects";
import type { Project, ProjectPayload } from "@/types/projects";

/** Sem prioridade: opção própria no select, enviada como null */
export const NO_PRIORITY = "none";

const priorityOptions = [{ id: NO_PRIORITY, label: "Sem prioridade" }, ...toOptions(projectPriorityLabels)];

export const toProjectFormValues = (project: Project): ProjectForm => ({
  name: project.name,
  description: project.description ?? "",
  status: project.status,
  priority: project.priority ?? NO_PRIORITY,
  directorateId: project.directorateId,
  startsAt: project.startsAt,
  expectedEndAt: project.expectedEndAt,
  endedAt: project.endedAt,
});

/** Converte o formulário no payload da API; o término só vai quando o projeto é finalizado */
export const toProjectPayload = (values: ProjectForm): ProjectPayload => ({
  name: values.name,
  description: values.description || null,
  status: values.status,
  priority: values.priority === NO_PRIORITY ? null : (values.priority ?? null),
  directorateId: values.directorateId,
  startsAt: values.startsAt ?? null,
  expectedEndAt: values.expectedEndAt ?? null,
  ...(values.status === "finished" ? { endedAt: values.endedAt ?? null } : {}),
});

/**
 * Campos do projeto (cadastro e detalhe). A diretoria só oferece as que a pessoa gerencia;
 * a data de término aparece quando o status é "Finalizado" (vazia = hoje).
 */
export function ProjectFormFields({ control }: { control: Control<ProjectForm> }) {
  const { can } = usePermissions();
  const directorates = useDirectorates();
  const status = useWatch({ control, name: "status" });

  const directorateOptions = (directorates.data ?? [])
    .filter((directorate) => can("projects.project.manage", directorate.id))
    .map((directorate) => ({ id: directorate.id, label: directorate.name }));

  return (
    <>
      <FormInput control={control} name="name" label="Nome" placeholder="Ex.: Site da liga" />

      <div className="grid gap-4 sm:grid-cols-3">
        <FormSelect
          control={control}
          name="directorateId"
          label="Diretoria"
          placeholder="Selecione a diretoria"
          items={directorateOptions}
          valueType="number"
        />
        <FormSelect control={control} name="status" label="Status" items={toOptions(projectStatusLabels)} />
        <FormSelect control={control} name="priority" label="Prioridade" items={priorityOptions} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DateField control={control} name="startsAt" label="Início" />
        <DateField control={control} name="expectedEndAt" label="Previsão de término" />
        {status === "finished" && (
          <DateField control={control} name="endedAt" label="Término" hint="Vazio: hoje" />
        )}
      </div>

      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <TextArea
            label="Descrição"
            placeholder="O que o projeto entrega e para quem"
            rows={4}
            value={field.value ?? ""}
            onChange={field.onChange}
            isInvalid={Boolean(fieldState.error)}
            hint={fieldState.error?.message}
          />
        )}
      />
    </>
  );
}

interface DateFieldProps {
  control: Control<ProjectForm>;
  name: "startsAt" | "expectedEndAt" | "endedAt";
  label: string;
  hint?: string;
}

function DateField({ control, name, label, hint }: DateFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <InputDate
          label={label}
          value={field.value ? parseDate(field.value) : null}
          onChange={(value) => field.onChange(value?.toString() ?? null)}
          isInvalid={Boolean(fieldState.error)}
          hint={fieldState.error?.message ?? hint}
        />
      )}
    />
  );
}

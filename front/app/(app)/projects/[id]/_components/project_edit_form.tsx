"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/feedback/toast";
import { FormActions } from "@/components/layout/form_actions";
import { ProjectFormFields, toProjectFormValues, toProjectPayload } from "@/components/projects/project_form_fields";
import { useUpdateProject } from "@/hooks/projects/use_projects";
import { useEditForm } from "@/hooks/use_edit_form";
import { handleApiError } from "@/lib/form_errors";
import { projectSchema, type ProjectForm } from "@/schemas/projects";
import type { Project } from "@/types/projects";

/** Dados do projeto editáveis direto na tela; finalizar tira todo mundo da equipe (o backend encerra) */
export function ProjectEditForm({ project }: { project: Project }) {
  const updateProject = useUpdateProject(project.id);

  const { control, handleSubmit, setError, reset, formState, discard } = useEditForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    values: () => toProjectFormValues(project),
    deps: [project],
  });

  const onSubmit = handleSubmit((values) => {
    updateProject.mutate(toProjectPayload(values), {
      onSuccess: (saved) => {
        toast.success("Alterações salvas", {
          description:
            saved.status === "finished" && project.status !== "finished"
              ? "Projeto finalizado: a equipe foi encerrada."
              : saved.name,
        });
        reset(toProjectFormValues(saved));
      },
      onError: (error) => handleApiError(error, setError),
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-4 p-5 sm:p-6" noValidate>
      <ProjectFormFields control={control} />

      <FormActions isDirty={formState.isDirty} isSubmitting={updateProject.isPending} onDiscard={discard} />
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/feedback/toast";
import { FormModal } from "@/components/overlays/form_modal";
import { ProjectFormFields, toProjectPayload } from "@/components/projects/project_form_fields";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useDirectorates } from "@/hooks/administration/use_directorates";
import { useCreateProject } from "@/hooks/projects/use_projects";
import { useOpenSession } from "@/hooks/use_open_session";
import { handleApiError } from "@/lib/form_errors";
import { defaultProjectDirectorateKey } from "@/lib/projects";
import { projectSchema, type ProjectForm } from "@/schemas/projects";

interface ProjectFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

/** Cadastro de projeto; depois de salvar, abre o detalhe para montar a equipe */
export function ProjectFormModal(props: ProjectFormModalProps) {
  const session = useOpenSession(props.isOpen);

  return <ProjectFormModalContent key={session} {...props} />;
}

/** Formulário montado a cada abertura do modal (ver useOpenSession) */
function ProjectFormModalContent({ isOpen, onOpenChange }: ProjectFormModalProps) {
  const router = useRouter();
  const createProject = useCreateProject();
  const directorates = useDirectorates();
  const { can } = usePermissions();

  // Diretoria sugerida: Projetos, se a pessoa a gerencia; senão a primeira que ela gerencia
  const manageable = (directorates.data ?? []).filter((item) => can("projects.project.manage", item.id));
  const suggested = manageable.find((item) => item.key === defaultProjectDirectorateKey) ?? manageable[0];

  const { control, handleSubmit, setError } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "not_started",
      priority: "none",
      directorateId: suggested?.id,
      startsAt: null,
      expectedEndAt: null,
      endedAt: null,
    },
  });

  const onSubmit = handleSubmit((values) => {
    createProject.mutate(toProjectPayload(values), {
      onSuccess: (project) => {
        toast.success("Projeto cadastrado", { description: project.name });
        onOpenChange(false);
        router.push(`/projects/${project.id}`);
      },
      onError: (error) => handleApiError(error, setError),
    });
  });

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Novo projeto"
      description="A equipe é montada depois, no detalhe do projeto."
      onSubmit={onSubmit}
      submitLabel="Cadastrar"
      isSubmitting={createProject.isPending}
    >
      <ProjectFormFields control={control} />
    </FormModal>
  );
}

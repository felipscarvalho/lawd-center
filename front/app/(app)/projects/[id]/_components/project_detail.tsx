"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Star01, UserPlus01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { toast } from "@/components/feedback/toast";
import { PageHeader } from "@/components/layout/page_header";
import { ErrorState, LoadingState } from "@/components/layout/query_states";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { useToggleProjectInterest } from "@/hooks/projects/use_project_interests";
import { useProject } from "@/hooks/projects/use_projects";
import { handleApiError } from "@/lib/form_errors";
import type { User } from "@/types/administration";
import { AddProjectMemberModal } from "./add_project_member_modal";
import { ProjectCard } from "./project_card";
import { ProjectInterests } from "./project_interests";
import { ProjectTeam } from "./project_team";

/** Modal de adicionar à equipe: fechado, aberto vazio ou aberto com a pessoa já escolhida (interessados) */
type AddMemberState = { isOpen: false } | { isOpen: true; user?: User };

export function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);

  const project = useProject(projectId);
  const toggleInterest = useToggleProjectInterest(projectId);
  const [addMember, setAddMember] = useState<AddMemberState>({ isOpen: false });

  if (project.isPending) {
    return <LoadingState label="Carregando projeto..." />;
  }

  if (project.isError) {
    return <ErrorState title="Não foi possível carregar o projeto" error={project.error} />;
  }

  const { data } = project;
  const isOpen = data.status !== "finished";
  const canManageTeam = Boolean(data.abilities?.canManageTeam) && isOpen;

  const onToggleInterest = () => {
    const interested = !data.isInterested;

    toggleInterest.mutate(interested, {
      onSuccess: () =>
        toast.success(interested ? "Interesse registrado" : "Interesse retirado", { description: data.name }),
      onError: (error) => handleApiError(error),
    });
  };

  return (
    <>
      <PageHeader
        title={data.name}
        actions={
          <>
            {/* Quem está fora da equipe pode marcar interesse enquanto o projeto não termina */}
            {isOpen && !data.isMember && (
              <Button
                color="secondary"
                iconLeading={Star01}
                onClick={onToggleInterest}
                isLoading={toggleInterest.isPending}
                showTextWhileLoading
              >
                {data.isInterested ? "Retirar interesse" : "Tenho interesse"}
              </Button>
            )}
            {canManageTeam && (
              <Button iconLeading={UserPlus01} onClick={() => setAddMember({ isOpen: true })}>
                Adicionar à equipe
              </Button>
            )}
          </>
        }
      >
        <Breadcrumbs items={[{ label: "Projetos", href: "/projects" }, { label: data.name }]} />
      </PageHeader>

      <ProjectCard project={data} />

      <ProjectTeam project={data} />

      <ProjectInterests
        project={data}
        canAllocate={canManageTeam}
        onAllocate={(user) => setAddMember({ isOpen: true, user })}
      />

      <AddProjectMemberModal
        project={data}
        user={addMember.isOpen ? addMember.user : undefined}
        isOpen={addMember.isOpen}
        onOpenChange={(open) => !open && setAddMember({ isOpen: false })}
      />
    </>
  );
}

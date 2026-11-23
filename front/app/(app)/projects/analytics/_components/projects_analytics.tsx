"use client";

import { PageHeader } from "@/components/layout/page_header";
import { ErrorState, LoadingState } from "@/components/layout/query_states";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useProjectsAnalytics } from "@/hooks/projects/use_project_analytics";
import { pluralize } from "@/lib/format";
import { projectPriorityLabels } from "@/lib/projects";
import type { ProjectPriority } from "@/types/projects";
import { AllocationRadar } from "./allocation_radar";
import { RankingCard } from "./ranking_card";
import { StatCard } from "./stat_card";

const people = (count: number) => pluralize(count, "pessoa", "pessoas");
const projects = (count: number) => pluralize(count, "projeto", "projetos");

const priorityOrder: (ProjectPriority | "none")[] = ["high", "medium", "low", "none"];

/** Visão geral dos projetos e, para quem gerencia projetos, o radar de quem está sem equipe */
export function ProjectsAnalytics() {
  const analytics = useProjectsAnalytics();
  const { canAnywhere } = usePermissions();

  if (analytics.isPending) {
    return <LoadingState label="Carregando análise..." />;
  }

  if (analytics.isError) {
    return <ErrorState title="Não foi possível carregar a análise" error={analytics.error} />;
  }

  const { data } = analytics;

  return (
    <>
      <PageHeader title="Análise de projetos" />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Projetos" value={data.total} hint={pluralize(data.byStatus.finished, "finalizado", "finalizados")} />
        <StatCard label="Em andamento" value={data.byStatus.in_progress} />
        <StatCard
          label="Suspensos ou não iniciados"
          value={data.byStatus.suspended + data.byStatus.not_started}
          hint={`${pluralize(data.byStatus.suspended, "suspenso", "suspensos")} · ${pluralize(data.byStatus.not_started, "não iniciado", "não iniciados")}`}
        />
        <StatCard
          label="Pessoas em projetos"
          value={data.allocatedPeople}
          hint={`${people(data.unallocatedPeople)} sem projeto`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <RankingCard
          title="Equipes em andamento"
          description="Projetos em andamento, do maior time para o menor."
          items={data.teamSizes.map((item) => ({
            id: item.project.id,
            label: item.project.name,
            href: `/projects/${item.project.id}`,
            value: item.value,
          }))}
          formatValue={people}
          emptyMessage="Nenhum projeto em andamento."
        />

        <RankingCard
          title="Interesse por projeto"
          description="Projetos abertos com mais gente querendo participar."
          items={data.interests.map((item) => ({
            id: item.project.id,
            label: item.project.name,
            href: `/projects/${item.project.id}`,
            value: item.value,
          }))}
          formatValue={people}
          emptyMessage="Ninguém marcou interesse em projetos abertos."
        />

        <RankingCard
          title="Prioridade"
          description="Projetos ainda não finalizados, por prioridade."
          items={priorityOrder.map((priority) => ({
            id: priority,
            label: priority === "none" ? "Sem prioridade" : projectPriorityLabels[priority],
            value: data.byPriority[priority],
          }))}
          formatValue={projects}
          emptyMessage="Nenhum projeto aberto."
        />
      </div>

      {canAnywhere("projects.project.manage") && <AllocationRadar />}
    </>
  );
}

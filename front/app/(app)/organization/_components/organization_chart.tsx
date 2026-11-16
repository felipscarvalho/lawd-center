"use client";

import { useState } from "react";
import { Dataflow03, LayoutGrid01, UserPlus01 } from "@untitledui/icons";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Alert } from "@/components/feedback/alert";
import { Button } from "@/components/base/buttons/button";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { AssignMembershipModal } from "@/components/administration/assign_membership_modal";
import { PageHeader } from "@/components/layout/page_header";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useOrganizationChart } from "@/hooks/administration/use_memberships";
import type { Directorate } from "@/types/administration";
import { DirectorateSection } from "./directorate_section";
import { OrganizationGraph } from "./organization_graph";

type View = "graph" | "list";

export function OrganizationChart() {
  const chart = useOrganizationChart();
  const { can, canAnywhere } = usePermissions();
  const [assignTo, setAssignTo] = useState<Directorate | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  // Grafo por padrão, em qualquer tela; a lista fica no botão ao lado
  const [view, setView] = useState<View>("graph");

  const canManageDirectorate = (directorate: Directorate) =>
    canAnywhere("administration.membership.manage") && can("administration.membership.manage", directorate.id);

  const openAssign = (directorate: Directorate | null) => {
    setAssignTo(directorate);
    setIsAssignOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Organograma"
        actions={
          <>
            <ButtonGroup
              size="sm"
              aria-label="Visualização"
              selectedKeys={new Set([view])}
              onSelectionChange={(keys) => {
                const [next] = [...keys];
                if (next) setView(next as View);
              }}
              disallowEmptySelection
            >
              <ButtonGroupItem id="graph" iconLeading={Dataflow03}>
                Grafo
              </ButtonGroupItem>
              <ButtonGroupItem id="list" iconLeading={LayoutGrid01}>
                Lista
              </ButtonGroupItem>
            </ButtonGroup>

            {can("administration.membership.manage") && (
              <Button iconLeading={UserPlus01} onClick={() => openAssign(null)}>
                Atribuir cargo
              </Button>
            )}
          </>
        }
      />

      {chart.isPending && (
        <div className="flex justify-center py-16">
          <LoadingIndicator type="line-spinner" size="md" label="Carregando organograma..." />
        </div>
      )}

      {chart.isError && <Alert color="error" title="Não foi possível carregar o organograma" description={chart.error.message} />}

      {chart.data?.length === 0 && (
        // O EmptyState limita a própria largura: o card fica num wrapper com a largura toda
        <div className="glass rounded-2xl py-12 ring-1 ring-secondary">
          <EmptyState size="md">
            <EmptyState.Header pattern="none">
              <EmptyState.FeaturedIcon icon={Dataflow03} color="brand" theme="light" />
            </EmptyState.Header>
            <EmptyState.Content>
              <EmptyState.Title>Nenhuma diretoria cadastrada</EmptyState.Title>
              <EmptyState.Description>Cadastre as diretorias para montar o organograma.</EmptyState.Description>
            </EmptyState.Content>
          </EmptyState>
        </div>
      )}

      {chart.data && chart.data.length > 0 && view === "graph" && (
        <OrganizationGraph directorates={chart.data} canManage={canManageDirectorate} onAddMember={openAssign} />
      )}

      {chart.data && chart.data.length > 0 && view === "list" && (
        // Um card só, com uma seção por diretoria (núcleo primeiro, como vem do backend)
        <div className="glass divide-y divide-secondary overflow-hidden rounded-2xl ring-1 ring-secondary">
          {chart.data.map((directorate) => (
            <DirectorateSection
              key={directorate.id}
              directorate={directorate}
              canManage={canManageDirectorate(directorate)}
              canManageAllPositions={can("administration.membership.manage")}
              onAddMember={() => openAssign(directorate)}
            />
          ))}
        </div>
      )}

      <AssignMembershipModal isOpen={isAssignOpen} onOpenChange={setIsAssignOpen} directorate={assignTo ?? undefined} />
    </>
  );
}

"use client";

import { useState } from "react";
import { Dataflow03, UserPlus01 } from "@untitledui/icons";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Alert } from "@/components/feedback/alert";
import { Button } from "@/components/base/buttons/button";
import { AssignMembershipModal } from "@/components/administration/assign_membership_modal";
import { PageHeader } from "@/components/layout/page_header";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useOrganizationChart } from "@/hooks/administration/use_memberships";
import type { Directorate } from "@/types/administration";
import { DirectorateCard } from "./directorate_card";

export function OrganizationChart() {
  const chart = useOrganizationChart();
  const { can, canAnywhere } = usePermissions();
  const [assignTo, setAssignTo] = useState<Directorate | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const openAssign = (directorate: Directorate | null) => {
    setAssignTo(directorate);
    setIsAssignOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Organograma"
        actions={
          can("administration.membership.manage") && (
            <Button iconLeading={UserPlus01} onClick={() => openAssign(null)}>
              Atribuir cargo
            </Button>
          )
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

      {chart.data && chart.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {chart.data.map((directorate) => (
            <DirectorateCard
              key={directorate.id}
              directorate={directorate}
              // O núcleo institucional ocupa a largura toda, como no topo de um organograma
              className={directorate.kind === "core" ? "md:col-span-2" : undefined}
              canManage={canAnywhere("administration.membership.manage") && can("administration.membership.manage", directorate.id)}
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

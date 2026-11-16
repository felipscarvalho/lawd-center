"use client";

import { useState } from "react";
import { Dataflow03, LayoutGrid01, UserPlus01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { AssignMembershipModal } from "@/components/administration/assign_membership_modal";
import { ListContent } from "@/components/layout/list_content";
import { PageHeader } from "@/components/layout/page_header";
import { Card } from "@/components/layout/card";
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

      <ListContent
        isPending={chart.isPending}
        error={chart.error}
        isEmpty={chart.data?.length === 0}
        loadingLabel="Carregando organograma..."
        errorTitle="Não foi possível carregar o organograma"
        empty={{
          icon: Dataflow03,
          title: "Nenhuma diretoria cadastrada",
          description: "Cadastre as diretorias para montar o organograma.",
        }}
      >
        {view === "graph" ? (
          <OrganizationGraph directorates={chart.data ?? []} canManage={canManageDirectorate} onAddMember={openAssign} />
        ) : (
          // Um card só, com uma seção por diretoria (núcleo primeiro, como vem do backend)
          <Card className="divide-y divide-secondary overflow-hidden">
            {(chart.data ?? []).map((directorate) => (
              <DirectorateSection
                key={directorate.id}
                directorate={directorate}
                canManage={canManageDirectorate(directorate)}
                onAddMember={() => openAssign(directorate)}
              />
            ))}
          </Card>
        )}
      </ListContent>

      <AssignMembershipModal isOpen={isAssignOpen} onOpenChange={setIsAssignOpen} directorate={assignTo ?? undefined} />
    </>
  );
}

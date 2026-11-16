"use client";

import { useState } from "react";
import { Edit05, Plus } from "@untitledui/icons";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Table, TableCard } from "@/components/application/table/table";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Alert } from "@/components/feedback/alert";
import { PageHeader } from "@/components/layout/page_header";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useDirectorates } from "@/hooks/administration/use_directorates";
import { directorateKindLabels } from "@/lib/administration";
import type { Directorate } from "@/types/administration";
import { DirectorateFormModal } from "./directorate_form_modal";

export function DirectoratesList() {
  const directorates = useDirectorates();
  const { can } = usePermissions();
  const canManage = can("administration.directorate.manage");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Directorate | undefined>();

  const openForm = (directorate?: Directorate) => {
    setEditing(directorate);
    setIsFormOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Diretorias"
        description="Núcleo institucional e diretorias da liga."
        actions={
          canManage && (
            <Button iconLeading={Plus} onClick={() => openForm()}>
              Nova diretoria
            </Button>
          )
        }
      />

      {directorates.isError && <Alert color="error" title="Não foi possível carregar as diretorias" description={directorates.error.message} />}

      {directorates.isPending ? (
        <div className="flex justify-center py-16">
          <LoadingIndicator type="line-spinner" size="md" label="Carregando diretorias..." />
        </div>
      ) : (
        directorates.data && (
          <TableCard.Root>
            <Table aria-label="Diretorias">
              <Table.Header>
                <Table.Head id="name" label="Nome" isRowHeader className="w-full" />
                <Table.Head id="key" label="Chave" />
                <Table.Head id="kind" label="Tipo" />
                <Table.Head id="actions" />
              </Table.Header>
              <Table.Body items={directorates.data}>
                {(directorate) => (
                  <Table.Row id={directorate.id}>
                    <Table.Cell className="font-medium whitespace-nowrap text-primary">{directorate.name}</Table.Cell>
                    <Table.Cell className="font-mono whitespace-nowrap">{directorate.key}</Table.Cell>
                    <Table.Cell>
                      <Badge type="modern" size="sm">
                        {directorateKindLabels[directorate.kind]}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className="px-4">
                      {canManage && (
                        <ButtonUtility
                          size="xs"
                          color="tertiary"
                          icon={Edit05}
                          tooltip="Renomear"
                          aria-label={`Renomear ${directorate.name}`}
                          onClick={() => openForm(directorate)}
                        />
                      )}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </TableCard.Root>
        )
      )}

      <DirectorateFormModal isOpen={isFormOpen} onOpenChange={setIsFormOpen} directorate={editing} />
    </>
  );
}

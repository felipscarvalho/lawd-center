"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, SearchLg, Users01 } from "@untitledui/icons";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Table, TableCard } from "@/components/application/table/table";
import { Tabs } from "@/components/application/tabs/tabs";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Alert } from "@/components/feedback/alert";
import { UserFormModal } from "@/components/administration/user_form_modal";
import { PageHeader } from "@/components/layout/page_header";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useUsers } from "@/hooks/administration/use_users";
import { getInitials } from "@/lib/administration";
import { formatDate } from "@/lib/moment";

type StatusFilter = "active" | "inactive" | "all";

const statusTabs = [
  { id: "active", label: "Ativos" },
  { id: "inactive", label: "Desativados" },
  { id: "all", label: "Todos" },
];

const filtersByStatus = { active: { active: true }, inactive: { active: false }, all: {} } as const;

export function UsersList() {
  const router = useRouter();
  const { can } = usePermissions();
  const [status, setStatus] = useState<StatusFilter>("active");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const users = useUsers(filtersByStatus[status]);

  // Busca local por nome ou e-mail (a lista da liga é pequena)
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return users.data ?? [];

    return (users.data ?? []).filter(
      (user) => user.fullName.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
    );
  }, [users.data, search]);

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Pessoas com acesso ao Lawd Center."
        actions={
          can("administration.user.create") && (
            <Button iconLeading={Plus} onClick={() => setIsCreateOpen(true)}>
              Novo usuário
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs selectedKey={status} onSelectionChange={(key) => setStatus(key as StatusFilter)}>
          <Tabs.List type="button-brand" items={statusTabs}>
            {(tab) => <Tabs.Item {...tab} />}
          </Tabs.List>
        </Tabs>

        <div className="w-full sm:w-72">
          <Input aria-label="Buscar usuário" placeholder="Buscar por nome ou e-mail" icon={SearchLg} value={search} onChange={setSearch} />
        </div>
      </div>

      {users.isError && <Alert color="error" title="Não foi possível carregar os usuários" description={users.error.message} />}

      {users.isPending ? (
        <div className="flex justify-center py-16">
          <LoadingIndicator type="line-spinner" size="md" label="Carregando usuários..." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState size="md" className="glass rounded-2xl py-12 ring-1 ring-secondary">
          <EmptyState.Header pattern="none">
            <EmptyState.FeaturedIcon icon={Users01} color="brand" theme="light" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>Nenhum usuário encontrado</EmptyState.Title>
            <EmptyState.Description>
              {search ? "Nenhum resultado para essa busca." : "Não há usuários nesta lista."}
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState>
      ) : (
        <TableCard.Root>
          <Table aria-label="Usuários" onRowAction={(key) => router.push(`/users/${key}`)}>
            <Table.Header>
              <Table.Head id="name" label="Nome" isRowHeader className="w-full" />
              <Table.Head id="status" label="Situação" />
              <Table.Head id="createdAt" label="Cadastrado em" />
            </Table.Header>
            <Table.Body items={filteredUsers}>
              {(user) => (
                <Table.Row id={user.id} className="cursor-pointer">
                  <Table.Cell>
                    <AvatarLabelGroup
                      size="md"
                      src={user.photoUrl}
                      alt={user.fullName}
                      initials={getInitials(user.fullName)}
                      title={user.fullName}
                      subtitle={user.email}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <BadgeWithDot size="sm" type="modern" color={user.isActive ? "success" : "gray"}>
                      {user.isActive ? "Ativo" : "Desativado"}
                    </BadgeWithDot>
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{formatDate(user.createdAt)}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </TableCard.Root>
      )}

      <UserFormModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}

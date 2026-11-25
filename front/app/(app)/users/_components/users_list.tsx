"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users01 } from "@untitledui/icons";
import { Table, TableCard } from "@/components/application/table/table";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { UserFormModal } from "@/components/administration/user_form_modal";
import { ListContent } from "@/components/layout/list_content";
import { ListPagination } from "@/components/layout/list_pagination";
import { ListToolbar } from "@/components/layout/list_toolbar";
import { PageHeader } from "@/components/layout/page_header";
import { avatarProps } from "@/components/administration/person_link";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useDirectorates } from "@/hooks/administration/use_directorates";
import { useUsers } from "@/hooks/administration/use_users";
import { useDebouncedValue } from "@/hooks/use_debounced_value";
import {
  courseLabels,
  displayName,
  maturityLabels,
  toOptions,
  weeklyAvailabilityShortLabels,
  userStatus,
} from "@/lib/administration";
import type { Course } from "@/types/administration";

type StatusFilter = "active" | "inactive" | "all";

const statusOptions = [
  { id: "active", label: "Ativos" },
  { id: "inactive", label: "Desativados" },
  { id: "all", label: "Todos" },
];

const filtersByStatus = { active: { active: true }, inactive: { active: false }, all: {} } as const;

const ALL = "all";

const courseOptions = [{ id: ALL, label: "Todos os cursos" }, ...toOptions(courseLabels)];

const emptyValue = <span className="text-quaternary">—</span>;

export function UsersList() {
  const router = useRouter();
  const { can } = usePermissions();
  const [status, setStatus] = useState<StatusFilter>("active");
  const [search, setSearch] = useState("");
  const [directorateId, setDirectorateId] = useState<string>(ALL);
  const [course, setCourse] = useState<string>(ALL);
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const directorates = useDirectorates();

  // Filtros e paginação no backend; a busca espera a pessoa parar de digitar
  const debouncedSearch = useDebouncedValue(search.trim());
  const users = useUsers({
    ...filtersByStatus[status],
    search: debouncedSearch || undefined,
    directorateId: directorateId === ALL ? undefined : Number(directorateId),
    course: course === ALL ? undefined : (course as Course),
    page,
  });
  const pageUsers = users.data?.data ?? [];

  const directorateOptions = [
    { id: ALL, label: "Todas as diretorias" },
    ...(directorates.data ?? []).map((directorate) => ({ id: String(directorate.id), label: directorate.name })),
  ];

  // Filtros do painel que fogem do padrão (situação "Ativos", todas as diretorias, todos os cursos)
  const activeFilters = [status !== "active", directorateId !== ALL, course !== ALL].filter(Boolean).length;
  const hasFilters = Boolean(search.trim()) || activeFilters > 0;

  // Qualquer filtro novo volta para a primeira página
  const applyFilter = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setStatus("active");
    setDirectorateId(ALL);
    setCourse(ALL);
    setPage(1);
  };

  // Com o filtro em Ativos ou Desativados a situação já é conhecida; a coluna só aparece em Todos
  const showStatus = status === "all";

  return (
    <>
      <PageHeader
        title="Usuários"
        actions={
          can("administration.user.create") && (
            <Button iconLeading={Plus} onClick={() => setIsCreateOpen(true)}>
              Novo usuário
            </Button>
          )
        }
      />

      <ListToolbar
        search={search}
        onSearchChange={(value) => applyFilter(setSearch, value)}
        searchPlaceholder="Buscar por nome ou e-mail"
        activeFilters={activeFilters}
        onClearFilters={clearFilters}
        filters={
          <>
            <Select
              label="Situação"
              items={statusOptions}
              selectedKey={status}
              onSelectionChange={(key) => applyFilter(setStatus, (key ?? "active") as StatusFilter)}
            >
              {(item) => <Select.Item id={item.id} label={item.label} />}
            </Select>

            <Select
              label="Diretoria"
              items={directorateOptions}
              selectedKey={directorateId}
              onSelectionChange={(key) => applyFilter(setDirectorateId, String(key ?? ALL))}
            >
              {(item) => <Select.Item id={item.id} label={item.label} />}
            </Select>

            <Select label="Curso" items={courseOptions} selectedKey={course} onSelectionChange={(key) => applyFilter(setCourse, String(key ?? ALL))}>
              {(item) => <Select.Item id={item.id} label={item.label} />}
            </Select>
          </>
        }
      />

      <ListContent
        isPending={users.isPending}
        error={users.error}
        isEmpty={pageUsers.length === 0}
        loadingLabel="Carregando usuários..."
        errorTitle="Não foi possível carregar os usuários"
        empty={{
          icon: Users01,
          title: "Nenhum usuário encontrado",
          description: hasFilters ? "Nenhum resultado para esses filtros." : "Não há usuários nesta lista.",
        }}
      >
        <TableCard.Root>
          <Table aria-label="Usuários" onRowAction={(key) => router.push(`/users/${key}`)}>
            <Table.Header>
              <Table.Head id="name" label="Nome" isRowHeader />
              <Table.Head id="memberships" label="Cargos" className="hidden md:table-cell" />
              <Table.Head id="course" label="Curso" className="hidden md:table-cell" />
              <Table.Head id="maturity" label="Maturidade" className="hidden lg:table-cell" />
              <Table.Head id="availability" label="Disponibilidade" className="hidden 2xl:table-cell" />
              {showStatus && <Table.Head id="status" label="Situação" />}
            </Table.Header>
            <Table.Body items={pageUsers}>
              {(user) => (
                <Table.Row id={user.id} className="cursor-pointer">
                  <Table.Cell>
                    <AvatarLabelGroup
                      size="md"
                      {...avatarProps(user)}
                      title={displayName(user)}
                      // Sem nome (convite pendente), o e-mail já está no título
                      subtitle={user.fullName ? user.email : "Convite pendente"}
                    />
                  </Table.Cell>
                  <Table.Cell className="hidden md:table-cell">
                    {user.memberships?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {user.memberships.map((membership) => (
                          <Badge key={membership.id} size="sm" color="brand">
                            {membership.positionLabel} · {membership.directorate?.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-quaternary">Sem cargo</span>
                    )}
                  </Table.Cell>
                  <Table.Cell className="hidden md:table-cell">
                    {user.profile?.course ? (
                      <div className="flex flex-col">
                        <span className="whitespace-nowrap text-primary">{courseLabels[user.profile.course]}</span>
                        {user.profile.universityEntryPeriod && (
                          <span className="text-xs text-tertiary">Entrada em {user.profile.universityEntryPeriod}</span>
                        )}
                      </div>
                    ) : (
                      emptyValue
                    )}
                  </Table.Cell>
                  <Table.Cell className="hidden whitespace-nowrap lg:table-cell">
                    {user.profile?.maturity ? maturityLabels[user.profile.maturity] : emptyValue}
                  </Table.Cell>
                  <Table.Cell className="hidden whitespace-nowrap 2xl:table-cell">
                    {user.profile?.weeklyAvailability ? weeklyAvailabilityShortLabels[user.profile.weeklyAvailability] : emptyValue}
                  </Table.Cell>
                  {showStatus && (
                    <Table.Cell>
                      <BadgeWithDot size="sm" type="modern" color={userStatus(user).color}>
                        {userStatus(user).label}
                      </BadgeWithDot>
                    </Table.Cell>
                  )}
                </Table.Row>
              )}
            </Table.Body>
          </Table>

          {users.data && <ListPagination meta={users.data.metadata} onPageChange={setPage} />}
        </TableCard.Root>
      </ListContent>

      <UserFormModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}

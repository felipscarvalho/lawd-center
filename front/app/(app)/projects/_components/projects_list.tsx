"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, Plus } from "@untitledui/icons";
import { Table, TableCard } from "@/components/application/table/table";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { UserAvatar } from "@/components/administration/person_link";
import { ListContent } from "@/components/layout/list_content";
import { ListPagination } from "@/components/layout/list_pagination";
import { ListToolbar } from "@/components/layout/list_toolbar";
import { PageHeader } from "@/components/layout/page_header";
import { ProjectPriorityBadge, ProjectStatusBadge } from "@/components/projects/project_badges";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useDirectorates } from "@/hooks/administration/use_directorates";
import { useProjects } from "@/hooks/projects/use_projects";
import { useDebouncedValue } from "@/hooks/use_debounced_value";
import { toOptions } from "@/lib/administration";
import { pluralize } from "@/lib/format";
import { projectPriorityLabels, projectSortLabels, projectStatusLabels } from "@/lib/projects";
import type { ProjectPriority, ProjectSort, ProjectStatus } from "@/types/projects";
import { ProjectFormModal } from "./project_form_modal";

const ALL = "all";

const statusOptions = [{ id: ALL, label: "Todos os status" }, ...toOptions(projectStatusLabels)];
const priorityOptions = [{ id: ALL, label: "Todas as prioridades" }, ...toOptions(projectPriorityLabels)];
const sortOptions = toOptions(projectSortLabels);

export function ProjectsList() {
  const router = useRouter();
  const { canAnywhere } = usePermissions();
  const directorates = useDirectorates();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [priority, setPriority] = useState<string>(ALL);
  const [directorateId, setDirectorateId] = useState<string>(ALL);
  const [sort, setSort] = useState<ProjectSort>("activity");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filtros, ordem e paginação no backend; a busca espera a pessoa parar de digitar
  const debouncedSearch = useDebouncedValue(search.trim());
  const projects = useProjects({
    search: debouncedSearch || undefined,
    status: status === ALL ? undefined : (status as ProjectStatus),
    priority: priority === ALL ? undefined : (priority as ProjectPriority),
    directorateId: directorateId === ALL ? undefined : Number(directorateId),
    sort,
    page,
  });
  const pageProjects = projects.data?.data ?? [];

  const directorateOptions = [
    { id: ALL, label: "Todas as diretorias" },
    ...(directorates.data ?? []).map((directorate) => ({ id: String(directorate.id), label: directorate.name })),
  ];

  // Filtros do painel que fogem do padrão (ordem incluída)
  const activeFilters = [status !== ALL, priority !== ALL, directorateId !== ALL, sort !== "activity"].filter(Boolean).length;
  const hasFilters = Boolean(search.trim()) || activeFilters > 0;

  // Qualquer filtro novo volta para a primeira página
  const applyFilter = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setStatus(ALL);
    setPriority(ALL);
    setDirectorateId(ALL);
    setSort("activity");
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Projetos"
        actions={
          canAnywhere("projects.project.manage") && (
            <Button iconLeading={Plus} onClick={() => setIsCreateOpen(true)}>
              Novo projeto
            </Button>
          )
        }
      />

      <ListToolbar
        search={search}
        onSearchChange={(value) => applyFilter(setSearch, value)}
        searchPlaceholder="Buscar projeto ou pessoa"
        activeFilters={activeFilters}
        onClearFilters={clearFilters}
        filters={
          <>
            <Select
              label="Status"
              items={statusOptions}
              selectedKey={status}
              onSelectionChange={(key) => applyFilter(setStatus, String(key ?? ALL))}
            >
              {(item) => <Select.Item id={item.id} label={item.label} />}
            </Select>

            <Select
              label="Prioridade"
              items={priorityOptions}
              selectedKey={priority}
              onSelectionChange={(key) => applyFilter(setPriority, String(key ?? ALL))}
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

            <Select
              label="Ordenar por"
              items={sortOptions}
              selectedKey={sort}
              onSelectionChange={(key) => applyFilter(setSort, (key ?? "activity") as ProjectSort)}
            >
              {(item) => <Select.Item id={item.id} label={item.label} />}
            </Select>
          </>
        }
      />

      <ListContent
        isPending={projects.isPending}
        error={projects.error}
        isEmpty={pageProjects.length === 0}
        loadingLabel="Carregando projetos..."
        errorTitle="Não foi possível carregar os projetos"
        empty={{
          icon: Folder,
          title: "Nenhum projeto encontrado",
          description: hasFilters ? "Nenhum resultado para esses filtros." : "Ainda não há projetos cadastrados.",
        }}
      >
        <TableCard.Root>
          <Table aria-label="Projetos" onRowAction={(key) => router.push(`/projects/${key}`)}>
            <Table.Header>
              <Table.Head id="name" label="Projeto" isRowHeader />
              <Table.Head id="status" label="Status" />
              <Table.Head id="coordinator" label="Coordenação" className="hidden lg:table-cell" />
              <Table.Head id="team" label="Equipe" className="hidden sm:table-cell" />
              <Table.Head id="priority" label="Prioridade" className="hidden xl:table-cell" />
            </Table.Header>
            <Table.Body items={pageProjects}>
              {(project) => (
                <Table.Row id={project.id} className="cursor-pointer">
                  <Table.Cell>
                    <span className="block font-medium text-primary">{project.name}</span>
                    {/* A diretoria diferencia projetos de mesmo nome */}
                    <span className="block text-sm text-tertiary">{project.directorate.name}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <ProjectStatusBadge status={project.status} />
                  </Table.Cell>
                  <Table.Cell className="hidden lg:table-cell">
                    {project.coordinator ? (
                      <span className="flex items-center gap-2">
                        <UserAvatar person={project.coordinator} size="xs" />
                        <span className="text-sm whitespace-nowrap text-primary">{project.coordinator.fullName}</span>
                      </span>
                    ) : (
                      <span className="text-sm text-quaternary">Sem coordenador</span>
                    )}
                  </Table.Cell>
                  <Table.Cell className="hidden whitespace-nowrap sm:table-cell">
                    {pluralize(project.teamSize, "pessoa", "pessoas")}
                  </Table.Cell>
                  <Table.Cell className="hidden xl:table-cell">
                    <ProjectPriorityBadge priority={project.priority} />
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>

          {projects.data && <ListPagination meta={projects.data.metadata} onPageChange={setPage} />}
        </TableCard.Root>
      </ListContent>

      <ProjectFormModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}

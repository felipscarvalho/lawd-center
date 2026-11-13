"use client";

import { type ReactNode, Suspense, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Copy01,
  Edit01,
  File06,
  Grid01,
  HelpCircle,
  List,
  LogOut01,
  Mail01,
  Plus,
  SearchLg,
  Settings01,
  Trash01,
  User01,
} from "@untitledui/icons";
import { useListData } from "react-stately";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/components/application/modals/modal";
import {
  PaginationButtonGroup,
  PaginationCardMinimal,
  PaginationPageDefault,
} from "@/components/application/pagination/pagination";
import { PaginationDot } from "@/components/application/pagination/pagination-dot";
import { PaginationLine } from "@/components/application/pagination/pagination-line";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Avatar } from "@/components/base/avatar/avatar";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { AvatarProfilePhoto } from "@/components/base/avatar/avatar-profile-photo";
import { Badge, BadgeWithDot, BadgeWithIcon } from "@/components/base/badges/badges";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { BadgeGroup } from "@/components/base/badges/badge-groups";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Alert } from "@/components/feedback/alert";
import { toast } from "@/components/feedback/toast";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Input, InputBase } from "@/components/base/input/input";
import { InputDate } from "@/components/base/input/input-date";
import { InputFile } from "@/components/base/input/input-file";
import { InputGroup } from "@/components/base/input/input-group";
import { InputNumber } from "@/components/base/input/input-number";
import { InputTags } from "@/components/base/input/input-tags";
import { InputTagsOuter } from "@/components/base/input/input-tags-outer";
import { PinInput } from "@/components/base/input/pin-input";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { ComboBox } from "@/components/base/select/combobox";
import { MultiSelect } from "@/components/base/select/multi-select";
import { Select, type SelectItemType } from "@/components/base/select/select";
import { NativeSelect } from "@/components/base/select/select-native";
import { TagSelect } from "@/components/base/select/tag-select";
import { Tag, TagGroup, TagList } from "@/components/base/tags/tags";
import { TextArea } from "@/components/base/textarea/textarea";
import { Toggle } from "@/components/base/toggle/toggle";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import type { SortDescriptor } from "react-aria-components";
import { Table, TableCard } from "@/components/application/table/table";
import { Tabs } from "@/components/application/tabs/tabs";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { DateRangePicker } from "@/components/application/date-picker/date-range-picker";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { formatDate } from "@/lib/moment";
import { ThemeToggle } from "@/components/theme/theme_toggle";

const roleOptions = [
  { id: "admin", label: "Administrador" },
  { id: "editor", label: "Editor" },
  { id: "viewer", label: "Visualizador" },
];

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  failed?: boolean;
  type?: "pdf" | "jpg" | "docx";
}

const initialUploadedFiles: UploadedFile[] = [
  { id: "contract", name: "contrato.pdf", size: 1_240_000, progress: 100, type: "pdf" },
  { id: "photo", name: "foto-documento.jpg", size: 3_400_000, progress: 60, type: "jpg" },
  { id: "petition", name: "peticao.docx", size: 820_000, progress: 30, failed: true, type: "docx" },
];

const tabItems = [
  { id: "details", label: "Detalhes" },
  { id: "documents", label: "Documentos", badge: 3 },
  { id: "history", label: "Histórico" },
];

type CaseStatus = "active" | "pending" | "archived";

interface CaseRow {
  id: string;
  number: string;
  client: string;
  status: CaseStatus;
  updatedAt: string;
}

const caseRows: CaseRow[] = [
  { id: "1", number: "0001234-56.2026.8.25.0001", client: "Maria Souza", status: "active", updatedAt: "2026-11-10" },
  { id: "2", number: "0004567-89.2026.8.25.0001", client: "João Lima", status: "pending", updatedAt: "2026-11-08" },
  { id: "3", number: "0007890-12.2025.8.25.0001", client: "Ana Costa", status: "archived", updatedAt: "2026-10-21" },
  { id: "4", number: "0002345-67.2026.8.25.0001", client: "Carlos Mendes", status: "active", updatedAt: "2026-11-12" },
];

const caseStatusBadge: Record<CaseStatus, { label: string; color: "success" | "warning" | "gray" }> = {
  active: { label: "Ativo", color: "success" },
  pending: { label: "Pendente", color: "warning" },
  archived: { label: "Arquivado", color: "gray" },
};

// Bloco com título para agrupar os exemplos de cada componente
function Section({ title, align = "start", children }: { title: string; align?: "start" | "center"; children: ReactNode }) {
  return (
    // Card de vidro com título marcado por um ponto roxo, como as seções do SimMAP
    <section className="glass flex min-w-0 flex-col gap-4 rounded-2xl p-4 ring-1 ring-secondary sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-solid" />
        {title}
      </h2>
      {/* Itens não encolhem (quebram para a linha de baixo) e nunca passam da largura do card */}
      <div className={`flex flex-wrap gap-4 *:max-w-full *:shrink-0 ${align === "center" ? "items-center" : "items-start"}`}>{children}</div>
    </section>
  );
}

export function ComponentShowcase() {
  // Itens selecionados do TagSelect (o componente adiciona e remove itens desta lista)
  const selectedRoles = useListData<SelectItemType>({ initialItems: [] });
  const [page, setPage] = useState(1);
  const [slide, setSlide] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: "updatedAt", direction: "descending" });

  // Ordenação local da tabela pela coluna escolhida
  const sortedCases = [...caseRows].sort((a, b) => {
    const column = sortDescriptor.column as keyof CaseRow;
    const result = a[column].localeCompare(b[column]);
    return sortDescriptor.direction === "descending" ? -result : result;
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialUploadedFiles);

  // Simula upload concluído para os arquivos soltos na área de upload
  const addFiles = (files: FileList) => {
    const newFiles = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      progress: 100,
    }));
    setUploadedFiles((current) => [...newFiles, ...current]);
  };

  const removeFile = (id: string) => setUploadedFiles((current) => current.filter((file) => file.id !== id));

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-display-xs font-semibold text-primary">Componentes</h1>
          <p className="text-md text-tertiary">Componentes base do Untitled UI instalados no projeto.</p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Button" align="center">
        <Button color="primary">Primary</Button>
        <Button color="secondary">Secondary</Button>
        <Button color="tertiary">Tertiary</Button>
        <Button color="link-color">Link</Button>
        <Button color="primary-destructive" iconLeading={Trash01}>
          Excluir
        </Button>
        <Button color="primary" iconLeading={Plus}>
          Novo
        </Button>
        <Button color="secondary" iconTrailing={ArrowRight}>
          Continuar
        </Button>
        <Button color="primary" isLoading showTextWhileLoading>
          Salvando
        </Button>
        <Button color="primary" isDisabled>
          Desabilitado
        </Button>
      </Section>

      <Section title="Button sizes" align="center">
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button size="md">md</Button>
        <Button size="lg">lg</Button>
        <Button size="xl">xl</Button>
      </Section>

      <Section title="Button group">
        <ButtonGroup defaultSelectedKeys={["grid"]} selectionMode="single">
          <ButtonGroupItem id="grid" iconLeading={Grid01}>
            Grade
          </ButtonGroupItem>
          <ButtonGroupItem id="list" iconLeading={List}>
            Lista
          </ButtonGroupItem>
        </ButtonGroup>
      </Section>

      <Section title="Avatar" align="center">
        <Avatar size="xs" initials="FC" />
        <Avatar size="sm" initials="FC" />
        <Avatar size="md" initials="FC" status="online" />
        <Avatar size="lg" initials="FC" status="offline" />
        <Avatar size="xl" />
        <Avatar size="2xl" initials="FC" />
        <AvatarLabelGroup size="md" initials="FC" title="Felipe Carvalho" subtitle="Administrador" className="flex-none" />
      </Section>

      <Section title="Avatar profile photo" align="center">
        <AvatarProfilePhoto size="sm" initials="FC" />
        <AvatarProfilePhoto size="md" initials="FC" />
        <AvatarProfilePhoto size="lg" initials="FC" />
      </Section>

      <Section title="Badge" align="center">
        <Badge color="gray">Gray</Badge>
        <Badge color="brand">Brand</Badge>
        <Badge color="success">Ativo</Badge>
        <Badge color="warning">Pendente</Badge>
        <Badge color="error">Erro</Badge>
        <Badge type="color" color="blue">
          Color
        </Badge>
        <Badge type="modern" color="gray">
          Modern
        </Badge>
        <BadgeWithDot color="success">Online</BadgeWithDot>
        <BadgeWithIcon color="brand" iconLeading={Mail01}>
          Novo e-mail
        </BadgeWithIcon>
      </Section>

      <Section title="Badge group">
        <div className="flex w-full min-w-0 flex-col items-start gap-3">
          <BadgeGroup theme="modern" color="brand" size="md" addonText="Novidade">
            Acabamos de lançar uma nova funcionalidade
          </BadgeGroup>
          <BadgeGroup theme="modern" color="brand" size="lg" addonText="Novidade">
            Acabamos de lançar uma nova funcionalidade
          </BadgeGroup>
          <BadgeGroup theme="light" color="brand" addonText="Novidade">
            Confira o que mudou
          </BadgeGroup>
          <BadgeGroup theme="light" color="success" align="trailing" addonText="Ver mais">
            Processo atualizado
          </BadgeGroup>
          <BadgeGroup theme="light" color="warning" addonText="Atenção">
            Prazo vence amanhã
          </BadgeGroup>
          <BadgeGroup theme="light" color="error" addonText="Erro">
            Falha ao sincronizar
          </BadgeGroup>
        </div>
      </Section>

      <Section title="Input">
        <div className="w-80">
          <Input label="E-mail" placeholder="voce@exemplo.com" icon={Mail01} hint="Usado para login." />
        </div>
        <div className="w-80">
          <Input label="Buscar" placeholder="Buscar..." icon={SearchLg} tooltip="Busca por nome ou e-mail" />
        </div>
        <div className="w-80">
          <Input label="Nome" placeholder="Nome completo" isRequired isInvalid hint="Campo obrigatório." />
        </div>
      </Section>

      <Section title="Input group, number e date">
        <div className="w-80">
          <InputGroup label="Site" leadingAddon={<InputGroup.Prefix>https://</InputGroup.Prefix>}>
            <InputBase placeholder="www.exemplo.com" />
          </InputGroup>
        </div>
        <div className="w-80">
          <InputNumber label="Quantidade" defaultValue={1} minValue={0} />
        </div>
        <div className="w-80">
          {/* DateField usa a data atual no placeholder; o Suspense tira ele do prerender estático */}
          <Suspense fallback={null}>
            <InputDate label="Data de nascimento" />
          </Suspense>
        </div>
      </Section>

      <Section title="Date picker" align="center">
        {/* Os pickers também dependem da data atual (dia destacado e atalhos), por isso o Suspense */}
        <Suspense fallback={null}>
          <DatePicker aria-label="Data" />
          <DateRangePicker aria-label="Período" />
        </Suspense>
      </Section>

      <Section title="Input file">
        <div className="w-full max-w-lg">
          <InputFile label="Anexo" hint="Apenas PDF." acceptedFileTypes={["application/pdf"]} />
        </div>
      </Section>

      <Section title="Input tags">
        <div className="w-80">
          <InputTags label="Etiquetas" placeholder="Digite e pressione Enter" defaultValue={["cliente", "urgente"]} />
        </div>
        <div className="w-80">
          <InputTagsOuter label="Áreas" placeholder="Digite e pressione Enter" defaultValue={["civil"]} />
        </div>
      </Section>

      <Section title="Pin input">
        <PinInput size="xs">
          <PinInput.Label>Código de verificação</PinInput.Label>
          <PinInput.Group maxLength={4}>
            <PinInput.Slot index={0} />
            <PinInput.Slot index={1} />
            <PinInput.Slot index={2} />
            <PinInput.Slot index={3} />
          </PinInput.Group>
          <PinInput.Description>Enviado para o seu e-mail.</PinInput.Description>
        </PinInput>
      </Section>

      <Section title="Textarea">
        <div className="w-full max-w-lg">
          <TextArea label="Descrição" placeholder="Escreva uma descrição..." rows={4} />
        </div>
      </Section>

      <Section title="Select">
        <div className="w-80">
          <Select label="Perfil" placeholder="Selecione um perfil" items={roleOptions}>
            {(item) => (
              <Select.Item id={item.id} label={item.label}>
                {item.label}
              </Select.Item>
            )}
          </Select>
        </div>
        <div className="w-80">
          <ComboBox label="Perfil (com busca)" placeholder="Buscar perfil" items={roleOptions}>
            {(item) => <Select.Item id={item.id} label={item.label} />}
          </ComboBox>
        </div>
        <div className="w-80">
          <MultiSelect label="Perfis" placeholder="Selecione perfis" items={roleOptions}>
            {(item) => <MultiSelect.Item id={item.id} label={item.label} />}
          </MultiSelect>
        </div>
        <div className="w-80">
          <TagSelect label="Perfis (tags)" placeholder="Buscar perfil" items={roleOptions} selectedItems={selectedRoles}>
            {(item) => <TagSelect.Item id={item.id} label={item.label} />}
          </TagSelect>
        </div>
        <div className="w-80">
          <NativeSelect
            label="Perfil (nativo)"
            options={roleOptions.map((role) => ({ label: role.label, value: role.id }))}
          />
        </div>
      </Section>

      <Section title="Tags">
        <TagGroup label="Etiquetas" size="md">
          <TagList className="flex flex-wrap gap-2">
            <Tag id="client">Cliente</Tag>
            <Tag id="urgent" dot>
              Urgente
            </Tag>
            <Tag id="cases" count={4}>
              Processos
            </Tag>
            <Tag id="removable" onClose={() => {}}>
              Removível
            </Tag>
          </TagList>
        </TagGroup>
      </Section>

      <Section title="Checkbox, radio e toggle">
        <div className="flex flex-col gap-3">
          <Checkbox label="Lembrar de mim" defaultSelected />
          <Checkbox label="Aceito os termos" hint="Leia os termos antes de aceitar." />
          <Checkbox label="Desabilitado" isDisabled />
        </div>
        <RadioGroup aria-label="Plano" defaultValue="basic">
          <RadioButton value="basic" label="Básico" />
          <RadioButton value="pro" label="Profissional" />
          <RadioButton value="enterprise" label="Empresarial" />
        </RadioGroup>
        <div className="flex flex-col gap-3">
          <Toggle label="Notificações" defaultSelected />
          <Toggle label="Modo compacto" hint="Reduz o espaçamento das tabelas." />
        </div>
      </Section>

      <Section title="Dropdown">
        <Dropdown.Root>
          <Button color="secondary" iconLeading={Settings01}>
            Opções
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu>
              <Dropdown.Item icon={User01} label="Perfil" />
              <Dropdown.Item icon={Edit01} label="Editar" />
              <Dropdown.Item icon={Copy01} label="Duplicar" />
              <Dropdown.Separator />
              <Dropdown.Item icon={LogOut01} label="Sair" />
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown.Root>
      </Section>

      <Section title="Alert">
        <div className="flex w-full max-w-2xl flex-col gap-3">
          <Alert
            color="brand"
            title="Nova versão disponível"
            description="Atualizamos o sistema com melhorias de desempenho."
            onClose={() => {}}
            actions={
              <>
                <Button color="link-gray" size="sm">
                  Dispensar
                </Button>
                <Button color="link-color" size="sm">
                  Ver novidades
                </Button>
              </>
            }
          />
          <Alert color="success" title="Cadastro salvo" description="As alterações foram gravadas com sucesso." />
          <Alert color="warning" title="Prazo próximo" description="O prazo deste processo vence amanhã." />
          <Alert color="error" title="Falha ao salvar" description="Verifique sua conexão e tente novamente." />
          <Alert color="gray" title="Sem descrição e sem ações" />
        </div>
      </Section>

      <Section title="Toast" align="center">
        <Button color="secondary" onClick={() => toast.info("Nova mensagem", { description: "Você recebeu uma mensagem." })}>
          Info
        </Button>
        <Button color="secondary" onClick={() => toast.success("Cadastro salvo", { description: "As alterações foram gravadas." })}>
          Success
        </Button>
        <Button color="secondary" onClick={() => toast.warning("Prazo próximo", { description: "O prazo vence amanhã." })}>
          Warning
        </Button>
        <Button
          color="secondary"
          onClick={() =>
            toast.error("Falha ao salvar", {
              description: "Não foi possível gravar as alterações.",
              action: { label: "Tentar novamente", onClick: () => toast.success("Cadastro salvo") },
            })
          }
        >
          Error com ação
        </Button>
      </Section>

      <Section title="Tabs">
        <div className="flex w-full flex-col gap-6">
          <Tabs>
            <Tabs.List type="underline" items={tabItems}>
              {(tab) => <Tabs.Item {...tab} />}
            </Tabs.List>
            <Tabs.Panel id="details" className="pt-4 text-sm text-tertiary">
              Conteúdo da aba Detalhes.
            </Tabs.Panel>
            <Tabs.Panel id="documents" className="pt-4 text-sm text-tertiary">
              Conteúdo da aba Documentos.
            </Tabs.Panel>
            <Tabs.Panel id="history" className="pt-4 text-sm text-tertiary">
              Conteúdo da aba Histórico.
            </Tabs.Panel>
          </Tabs>
          <Tabs>
            <Tabs.List type="button-brand" items={tabItems}>
              {(tab) => <Tabs.Item {...tab} />}
            </Tabs.List>
          </Tabs>
          <Tabs>
            <Tabs.List type="button-border" items={tabItems}>
              {(tab) => <Tabs.Item {...tab} />}
            </Tabs.List>
          </Tabs>
        </div>
      </Section>

      <Section title="Table">
        <TableCard.Root className="w-full">
          <TableCard.Header
            title="Processos"
            badge={`${caseRows.length} processos`}
            description="Processos recentes do escritório."
            contentTrailing={
              <Button size="sm" iconLeading={Plus}>
                Novo processo
              </Button>
            }
          />
          <Table aria-label="Processos" selectionMode="multiple" sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
            <Table.Header>
              <Table.Head id="number" label="Número" isRowHeader allowsSorting className="w-full" />
              <Table.Head id="client" label="Cliente" allowsSorting />
              <Table.Head id="status" label="Status" />
              <Table.Head id="updatedAt" label="Atualizado em" allowsSorting />
              <Table.Head id="actions" />
            </Table.Header>
            <Table.Body items={sortedCases}>
              {(row) => (
                <Table.Row id={row.id}>
                  <Table.Cell className="font-medium whitespace-nowrap text-primary">{row.number}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{row.client}</Table.Cell>
                  <Table.Cell>
                    <BadgeWithDot size="sm" color={caseStatusBadge[row.status].color} type="modern">
                      {caseStatusBadge[row.status].label}
                    </BadgeWithDot>
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {formatDate(row.updatedAt)}
                  </Table.Cell>
                  <Table.Cell className="px-4">
                    <Dropdown.Root>
                      <Dropdown.DotsButton aria-label="Ações" />
                      <Dropdown.Popover className="w-min">
                        <Dropdown.Menu>
                          <Dropdown.Item icon={Edit01} label="Editar" />
                          <Dropdown.Item icon={Copy01} label="Duplicar" />
                          <Dropdown.Item icon={Trash01} label="Excluir" />
                        </Dropdown.Menu>
                      </Dropdown.Popover>
                    </Dropdown.Root>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
          <PaginationCardMinimal page={1} total={1} align="right" />
        </TableCard.Root>
      </Section>

      <Section title="Breadcrumbs">
        <div className="flex flex-col gap-4">
          <Breadcrumbs
            homeHref="/components"
            items={[
              { label: "Processos", href: "/components" },
              { label: "Cível", href: "/components" },
              { label: "0001234-56.2026.8.25.0001" },
            ]}
          />
          <Breadcrumbs
            divider="slash"
            items={[{ label: "Clientes", href: "/components" }, { label: "Empresas", href: "/components" }, { label: "Acme Ltda." }]}
          />
          <Breadcrumbs
            type="button"
            homeHref="/components"
            items={[
              { label: "Configurações", href: "/components", icon: Settings01 },
              { label: "Usuários", href: "/components" },
              { label: "Editar" },
            ]}
          />
        </div>
      </Section>

      <Section title="Sidebar" align="center">
        <p className="text-sm text-tertiary">A sidebar ocupa a altura da tela, por isso fica numa página própria.</p>
        <Button color="secondary" href="/components/sidebar" iconTrailing={ArrowRight}>
          Ver sidebar
        </Button>
      </Section>

      <Section title="Modal" align="center">
        <DialogTrigger>
          <Button color="primary-destructive" iconLeading={Trash01}>
            Excluir registro
          </Button>
          <ModalOverlay isDismissable>
            <Modal className="max-w-md">
              <Dialog aria-label="Excluir registro">
                {({ close }) => (
                  <div className="flex flex-col gap-5 p-6">
                    <FeaturedIcon icon={AlertTriangle} color="error" theme="light" size="lg" />
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-semibold text-primary">Excluir registro?</h2>
                      <p className="text-sm text-tertiary">Esta ação não pode ser desfeita. O registro será removido permanentemente.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button color="secondary" className="flex-1" onClick={close}>
                        Cancelar
                      </Button>
                      <Button
                        color="primary-destructive"
                        className="flex-1"
                        onClick={() => {
                          close();
                          toast.success("Registro excluído");
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                )}
              </Dialog>
            </Modal>
          </ModalOverlay>
        </DialogTrigger>
      </Section>

      <Section title="Empty state">
        {/* overflow-hidden recorta o padrão decorativo de círculos em telas estreitas */}
        <div className="flex w-full flex-col gap-10 overflow-hidden md:flex-row">
          <EmptyState size="md" className="flex-1">
            <EmptyState.Header pattern="circle">
              <EmptyState.FeaturedIcon color="gray" />
            </EmptyState.Header>
            <EmptyState.Content>
              <EmptyState.Title>Nenhum processo encontrado</EmptyState.Title>
              <EmptyState.Description>Sua busca não retornou resultados. Tente outros termos.</EmptyState.Description>
            </EmptyState.Content>
            <EmptyState.Footer>
              <Button color="secondary">Limpar busca</Button>
              <Button iconLeading={Plus}>Novo processo</Button>
            </EmptyState.Footer>
          </EmptyState>
          <EmptyState size="md" className="flex-1">
            <EmptyState.Header pattern="none">
              <EmptyState.FeaturedIcon icon={File06} color="brand" theme="light" />
            </EmptyState.Header>
            <EmptyState.Content>
              <EmptyState.Title>Nenhum documento</EmptyState.Title>
              <EmptyState.Description>Envie o primeiro documento para começar.</EmptyState.Description>
            </EmptyState.Content>
          </EmptyState>
        </div>
      </Section>

      <Section title="Loading indicator" align="center">
        <LoadingIndicator type="line-simple" size="md" label="Carregando..." />
        <LoadingIndicator type="line-spinner" size="md" label="Carregando..." />
        <LoadingIndicator type="dot-circle" size="md" label="Carregando..." />
        <LoadingIndicator type="line-simple" size="sm" />
        <LoadingIndicator type="line-simple" size="lg" />
        <LoadingIndicator type="line-simple" size="xl" />
      </Section>

      <Section title="Pagination">
        <div className="flex w-full flex-col gap-8">
          <PaginationPageDefault page={page} total={10} onPageChange={setPage} />
          <PaginationCardMinimal page={page} total={10} onPageChange={setPage} />
          <PaginationButtonGroup page={page} total={10} onPageChange={setPage} />
          <div className="flex items-center gap-8">
            {/* Dot e line são indicadores de carrossel: poucas páginas e largura definida pelo container */}
            <PaginationDot page={slide} total={5} onPageChange={setSlide} />
            <PaginationLine page={slide} total={5} onPageChange={setSlide} className="w-40" />
          </div>
        </div>
      </Section>

      <Section title="File upload">
        <FileUpload.Root className="w-full max-w-lg">
          <FileUpload.DropZone hint="PDF, JPG ou DOCX (máx. 10MB)" maxSize={10 * 1024 * 1024} onDropFiles={addFiles} />
          <FileUpload.List>
            {uploadedFiles.map((file) => (
              <FileUpload.ListItemProgressBar
                key={file.id}
                name={file.name}
                size={file.size}
                progress={file.progress}
                failed={file.failed}
                type={file.type}
                onDelete={() => removeFile(file.id)}
                onRetry={() => toast.info("Reenviando arquivo")}
              />
            ))}
          </FileUpload.List>
        </FileUpload.Root>
      </Section>

      <Section title="Tooltip">
        <Tooltip title="Ajuda" description="Texto de apoio exibido ao passar o mouse.">
          <TooltipTrigger className="text-fg-quaternary">
            <HelpCircle className="size-5" />
          </TooltipTrigger>
        </Tooltip>
      </Section>

      <Section title="Progress">
        <div className="flex w-full max-w-lg flex-col gap-6">
          <ProgressBar value={30} />
          <ProgressBar value={60} labelPosition="right" />
          <ProgressBar value={85} labelPosition="bottom" />
        </div>
      </Section>
    </main>
  );
}

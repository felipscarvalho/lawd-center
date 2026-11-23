# Lawd Center

Monorepo com dois projetos e um único repositório git (raiz):

- `back/`: API em AdonisJS 7 (starter kit `api`, Lucid, VineJS)
- `front/`: aplicação web em Next.js 16 (App Router, TypeScript, Tailwind)

Gerenciador de pacotes: npm.

## Convenções gerais

- **Idioma do código: inglês.** Nomes de variáveis, funções, classes, arquivos, pastas, tabelas, colunas, rotas e chaves de API sempre em inglês (ex.: `getUser`, `users_controller.ts`). A única exceção são os comentários, que ficam em português
- Funções e variáveis em camelCase (`getUser`), classes e componentes em PascalCase (`UserCard`)
- **Seções separadas por linha em branco**: dentro de funções e métodos, cada etapa lógica fica separada da seguinte por uma linha em branco. Ex.: entrada/validação → chamada principal → retorno; busca do registro → verificações (cada `if` de guarda) → alteração → retorno. Resultados de expressões aninhadas viram variáveis nomeadas antes do `return`

```ts
async update({ params, request, serialize }: HttpContext) {
  const userId = Number(params.id)
  const payload = await request.validateUsing(updateUserValidator, { meta: { userId } })

  const user = await this.userService.update(userId, payload)

  return serialize(UserTransformer.transform(user))
}
```

---

# Arquitetura do backend (`back/`)

## 1. Camadas

Todo fluxo segue **Controller → Service → Model**, sem exceção e sem pular camadas.

### Controller (`app/controllers/<module>/`)

Responsável exclusivamente pela camada HTTP:

- Recebe o `HttpContext` e valida a entrada com o validator do módulo (`request.validateUsing`)
- Extrai dados do contexto (params, usuário autenticado, etc.) e repassa ao service como DTO
- Converte o retorno do service em resposta (transformer / `ctx.serialize`) e define o status HTTP
- **Proibido**: importar models, montar queries, conter regra de negócio ou chamar outro controller

### Service (`app/services/<module>/`)

Responsável por toda regra de negócio e orquestração:

- Única camada que acessa models e o banco (queries, transações)
- **Não recebe `HttpContext`**: entradas e saídas são DTOs, para que o service seja reutilizável por controllers, commands, jobs, listeners e outros services
- Instanciado via container de IoC (`@inject()`), com dependências injetadas no construtor
- Pode chamar outros services (inclusive de outros módulos, ver seção 4); nunca chama controllers
- Falhas de negócio são lançadas como exceptions (`app/exceptions/<module>/`) e convertidas em HTTP pelo handler global (`app/exceptions/handler.ts`)
- Antes de criar um método novo, verificar se já existe service que resolve o caso. Lógica repetida em dois lugares deve ser extraída para um service

### Model (`app/models/<module>/`)

Representação Lucid da tabela:

- Colunas, relacionamentos, hooks, scopes e computed properties
- Sem regra de negócio que envolva múltiplas entidades ou fluxos (isso é service)

### DTOs (`app/dtos/<module>/`)

Contrato de dados entre camadas:

- Tipos/interfaces TypeScript que definem a entrada e a saída dos services
- Independentes de HTTP: não referenciam `HttpContext`, request ou validators
- O validator do controller deve produzir um objeto compatível com o DTO de entrada do service (o TypeScript garante isso na chamada)
- Import via alias `#dtos/*` (registrar em `imports` do `back/package.json` ao criar a pasta)

### Camadas de apoio

- `app/validators/<module>/`: schemas VineJS, usados apenas por controllers
- `app/transformers/<module>/`: formato de saída da API, usados apenas por controllers

## 2. Módulos

A aplicação é dividida em módulos de domínio. A divisão é **apenas por pasta**: cada tipo de artefato ganha uma subpasta com o nome do módulo. Não há estrutura extra por módulo (sem pacotes, providers ou configs próprios).

```
app/controllers/<module>/
app/services/<module>/
app/models/<module>/
app/dtos/<module>/
app/validators/<module>/
app/transformers/<module>/
app/exceptions/<module>/
database/migrations/<module>/
start/routes/<module>.ts
tests/functional/<module>/
tests/unit/<module>/
```

- Nome do módulo: `snake_case`, em inglês (ex.: `administration`)
- Imports seguem os aliases existentes com a subpasta: `#services/administration/xxx_service`
- No índice gerado, controllers ficam agrupados por módulo: `controllers.administration.Xxx`
- Generators sempre com o prefixo do módulo: `node ace make:controller <module>/<nome>` (idem `make:service`, `make:model`, `make:validator`, `make:transformer`, `make:test`). Migrations: `node ace make:migration <nome> --folder=database/migrations/<module>`

### Módulo `administration`

Primeiro módulo da aplicação. Contém tudo que é **comum a todos os módulos** (ex.: usuários, autenticação, permissões, cadastros compartilhados). Critério: se mais de um módulo precisa e não pertence ao domínio de nenhum deles especificamente, vai para `administration`.

### Módulo `projects`

Projetos, equipes (com histórico) e interessados. Pessoas e diretorias vêm de `administration` pelos services de lá (`UserService.findMany/searchIds/listActiveMembers`, `DirectorateService`); os services do módulo devolvem DTOs de visão (`ProjectView`...) com esses dados montados.

Módulos novos são criados conforme a aplicação cresce, seguindo a mesma estrutura.

## 3. Rotas

- Cada módulo tem seu arquivo `start/routes/<module>.ts`, importado por `start/routes.ts` (que não define rotas de módulo, só importa os arquivos)
- Cada arquivo de módulo declara um único grupo com prefixo e nome do módulo:

```ts
router
  .group(() => {
    // rotas do módulo
  })
  .where('id', router.matchers.number())
  .prefix('/api/v1/<module>')
  .as('<module>')
```

- O matcher numérico de `:id` fica no grupo do módulo, não em cada rota

- Middlewares nomeados continuam centralizados em `start/kernel.ts`

## 4. Regras de dependência entre módulos

1. Qualquer módulo pode depender de `administration`.
2. `administration` não depende de nenhum outro módulo.
3. Um módulo acessa dados de outro **somente via service** do módulo dono, nunca importando o model alheio diretamente. Dependências circulares entre módulos são proibidas.
4. Migrations: cada pasta de módulo é registrada explicitamente em `config/database.ts` (`migrations.paths`), em ordem de dependência, com `administration` primeiro. Uma migration só pode referenciar (FK) tabelas de módulos registrados antes. Motivo: o Lucid ordena migrations pelo caminho relativo do arquivo, então pastas soltas em `database/migrations` rodariam em ordem alfabética de módulo, não cronológica. O mesmo vale para seeders (`seeders.paths`, pasta `database/seeders/<module>/`).

## 5. Banco, models e testes

- PostgreSQL (conexão `postgres`, variáveis `DB_*` validadas em `start/env.ts`)
- Colunas dos models vêm de `database/schema.ts`, **gerado** a cada `node ace migration:run`; nunca editar à mão. Models estendem a classe gerada (`UserSchema`) e só acrescentam relações, scopes e tipos específicos
- Colunas que precisam de conversão (decimal, que o Postgres devolve como texto, e `jsonb`) entram em `skipColumns` de `database/schema_rules.ts` e são declaradas no model com `prepare`/`consume`
- Arquivos enviados: `@adonisjs/drive` com disco local (`storage/`, servido em `/uploads`). Imagens passam pelo `ImageCompressionService` antes de gravar; o service recebe o caminho do arquivo temporário, nunca o objeto da requisição
- Helpers sem regra de negócio, usados por mais de um módulo, ficam em `app/helpers/` (alias `#helpers/*`, ex.: `likeTerm` para buscas ILIKE)
- Seeders e testes também usam os services (não acessam models diretamente, exceto para preparar cenários de teste)
- Listas que podem crescer são paginadas no banco (`query.paginate`, devolvidas com `Transformer.paginate(items.all(), items.getMeta())`), com os filtros também no banco
- Testes Japa no banco próprio `lawd_test` (`.env.test`), com `testUtils.db().withGlobalTransaction()` em cada grupo; helpers de cenário em `tests/helpers/<module>.ts`; o `data` das respostas é lido com `responseData<T>(response)` de `tests/helpers/http.ts`

## 6. Autenticação e permissões

- Access tokens (`@adonisjs/auth`, guard `api`); rotas autenticadas usam `middleware.auth()`
- **Permissões existem só no código**: catálogo em `app/permissions/<module>.ts` (chaves `<módulo>.<recurso>.<ação>`), registrado em `app/permissions/index.ts`, e mapa cargo → permissões + escopo (`global` | `directorate`) em `app/permissions/positions.ts`, com as extras de um cargo numa diretoria específica em `directoratePositionPermissions` (ex.: diretor de Projetos gerencia projetos de todas as diretorias). Não criar tabelas de permissões ou papéis
- Permissões efetivas = cargos dos vínculos ativos (`memberships`) do usuário, via `PermissionService`
- Checar na rota com `middleware.can('<permissão>')`; escopo de diretoria e regras por registro são conferidos no service (`PermissionService.can/authorize`). Permissão sobre outra pessoa (ex.: diretor sobre membros da diretoria): `PermissionService.canOnUser`
- Erros: `ForbiddenException` (403) e `BusinessRuleException` (422, com código da regra) em `app/exceptions/administration/`

---

# Documentação (`docs/`)

Cada funcionalidade aprovada e implementada ganha documentação em `docs/back/` ou `docs/front/`, explicando o que foi definido e por quê, e entra no índice `docs/README.md`. O `CLAUDE.md` guarda só as regras curtas.

---

# Arquitetura do frontend (`front/`)

## 1. Stack

- **UI base**: Untitled UI React (React Aria + Tailwind CSS 4). Componentes adicionados via CLI (`npx untitledui@latest add <componente>`), que copia o código para o projeto
- **HTTP**: axios, encapsulado em um client único
- **Dados do servidor**: TanStack Query (cache, revalidação, mutations)
- **Estado global do cliente**: Zustand
- **Identidade visual**: segue o SimMAP (aplicação anterior da LAWD). Cores, fontes (MuseoModerno/JetBrains Mono), fundo com brilhos coloridos (sem grade) e scrollbar ficam em `styles/lawd-theme.css`, que sobrescreve as paletas `brand` e `neutral` do Untitled UI; não editar `styles/theme.css`. Usar sempre os tokens semânticos (`bg-primary`, `text-secondary`, `border-secondary`...) para funcionar nos dois modos. As formas (raios, tamanhos, pílulas) seguem o Untitled UI; do SimMAP vêm só cores, transparências e efeitos. Glassmorphism via utilitários de `lawd-theme.css`: `glass` (cards), `glass-strong` (menus, popovers, modal, toast), `glass-field` (campos), `glass-control` (botões secundários) e `glass-brand` / `glass-destructive` (botões primário e destrutivo); a borda vem do `ring-*` do componente. Desempenho: só `glass` e `glass-strong` usam `backdrop-filter` (vidro dentro de vidro não desfoca de novo); não adicionar `backdrop-blur` em elementos pequenos ou repetidos
- **Light/dark mode**: `next-themes` em `components/providers.tsx` (classes `light-mode`/`dark-mode` do Untitled UI, padrão dark); alternância com `ThemeToggle` de `components/theme/theme_toggle.tsx`
- **Alert e toast**: componentes próprios em `components/feedback/` (os do Untitled UI são PRO). Toasts sempre via `toast` de `@/components/feedback/toast`, nunca importando `sonner` diretamente
- **Estilos**: só classes Tailwind; módulos CSS (`*.module.css`) não funcionam, porque o `next.config.ts` passa todo `.css` pelo loader do Tailwind como CSS global
- **Ícones**: somente `@untitledui/icons` (mesma biblioteca usada internamente pelos componentes); não adicionar outras bibliotecas de ícones
- **Datas**: moment, sempre importado de `@/lib/moment` (já configura o locale `pt-br`); exibição no formato `DD/MM/YYYY` via `formatDate`. Componentes do react-aria usam o locale `pt-BR` do `I18nProvider` em `components/providers.tsx`
- **Formulários**: react-hook-form
- **Validação**: Zod (integrado ao react-hook-form via `zodResolver` de `@hookform/resolvers`)

## 2. Camada de API

Fluxo: **Componente → Hook (TanStack Query) → Service → API client → backend**. Componentes e stores nunca chamam axios diretamente, e componentes não chamam services diretamente para buscar dados (sempre via hook).

### API client (`lib/api.ts`)

Instância única de axios, configurada uma vez:

- `baseURL` vinda de `NEXT_PUBLIC_API_URL` (aponta para `/api/v1` do back)
- Interceptors de request (ex.: token de autenticação) e de response (normalização de erros em um formato único)
- É o único arquivo do front que importa `axios`

### Services (`services/<module>/`)

Funções tipadas que representam cada endpoint, reutilizadas por toda a aplicação:

- Uma função por operação: `getUser(id)` → `GET /<module>/users/:id`
- Usam exclusivamente o API client, pelos atalhos `apiGet`, `apiPost`, `apiPut` e `apiDelete` de `lib/api.ts`, que já devolvem o `data` da resposta tipado (`return apiGet<User>(...)`), e `apiGetPage` para listas paginadas (itens + `metadata`); o `api` direto só quando não há corpo a desembrulhar
- Módulos espelham os módulos do backend

### Hooks de dados (`hooks/<module>/`)

Camada fina de TanStack Query sobre os services; é por ela que componentes consomem dados do backend:

- Leitura com `useQuery`, escrita com `useMutation`. `queryFn`/`mutationFn` sempre chamam um service
- Um arquivo por recurso: `hooks/<module>/use_users.ts`, exportando hooks como `useUsers()`, `useUser(id)`, `useCreateUser()`
- Query keys centralizadas por recurso (ex.: `userKeys.all`, `userKeys.detail(id)`), nunca escritas como literal solto nos componentes
- Toda mutation invalida (`invalidateQueries`) as keys afetadas no `onSuccess`
- Cache apenas em memória, com as opções padrão; ajustes de `staleTime`, persistência ou prefetch no servidor só quando houver necessidade concreta
- `QueryClientProvider` configurado uma vez no layout raiz

### Tipos (`types/<module>/`)

Tipos das respostas e payloads da API, espelhando os DTOs/transformers do backend.

## 3. Estado global do cliente (`stores/`)

- Zustand apenas para estado **do próprio front compartilhado entre páginas/componentes** (ex.: sessão do usuário, preferências, UI global)
- Dados vindos do backend ficam no cache do TanStack Query, nunca copiados para stores. **Exceção: o usuário autenticado**, que fica no `user_store` (`stores/user_store.ts`): token, dados do usuário e permissões, com os métodos `login`, `logout`, `revalidate`, `clear`, `can` e `canAnywhere`. Ações que mudam cargos ou o próprio cadastro chamam `revalidate()` depois de concluir
- Estado local de um componente fica em `useState`; não criar store para estado usado em um só lugar
- Um store por responsabilidade: `stores/<name>_store.ts`, exportando o hook `use<Name>Store`

## Área logada e autenticação

- Token no `user_store` (persistido no `localStorage`); o API client envia `Authorization: Bearer` e, em 401, limpa a sessão e volta para `/login`
- Páginas autenticadas ficam no route group `app/(app)/`, cujo layout (`AppShell`) só monta no navegador (`use(browser())` + `Suspense`), redireciona sem token, revalida o usuário e monta a sidebar filtrada por permissão. A sidebar é dividida em seções por módulo (`navigation` no `AppShell`): tela nova entra na seção do seu módulo, com a permissão exigida
- Toda página nova em `app/(app)/` exporta `export const instant = false` (a área depende da sessão do navegador e não passa na validação de instant navigation do Next)
- Botões e ações aparecem só com a permissão necessária (`usePermissions().can/canAnywhere`, mesma regra de escopo do backend); o backend continua sendo quem garante
- Logout usa `window.location.href` (recarga completa), porque o Next mantém rotas montadas em segundo plano
- URL da API em `NEXT_PUBLIC_API_URL` (`front/.env.local`; modelo em `front/.env.example`)

## 4. Componentes

### Globais (`components/`)

- Componentes do Untitled UI ficam nas pastas criadas pelo CLI dentro de `components/` (ex.: `components/base/`, `components/application/`)
- Componentes próprios reutilizáveis em mais de uma página ficam em `components/`, fora das pastas do Untitled UI
- Antes de criar um componente, verificar se o Untitled UI já oferece um equivalente

### ⚠️ Componentes base são congelados

Os componentes base já estão definidos e **não podem ser modificados sem permissão direta e explícita do usuário**, mesmo para correções, ajustes de estilo, refatorações ou tradução de textos. Isso vale para:

- Tudo em `components/base/`, `components/application/`, `components/foundations/` e `components/shared-assets/` (Untitled UI adaptado)
- Componentes próprios: `components/feedback/`, `components/navigation/`, `components/brand/`, `components/theme/` e `components/providers.tsx`
- Estilos globais: `styles/theme.css`, `styles/lawd-theme.css`, `styles/globals.css` e `app/globals.css`

Se uma tarefa parecer exigir mudança nesses arquivos, parar e pedir autorização descrevendo a alteração. Telas devem usar os componentes como estão, ajustando apenas via props e `className` no local de uso. Adicionar um componente novo do Untitled UI (via CLI) também precisa de autorização.

### Componentes de tela compartilhados (não congelados)

- `components/layout/`: estrutura de página e blocos reutilizáveis
  - `PageHeader`; `Card` (card de vidro padrão) e `SplitCard` (duas colunas: aside + conteúdo, como Meu perfil e detalhe do usuário)
  - `Section`, `DetailField` e `DetailTags` (seções com divisória e campos só de leitura)
  - `LoadingState` e `ErrorState` (carregando e erro de qualquer tela); `ListToolbar` (filtros em painel + busca à direita), `ListContent` (carregando, erro, vazio e conteúdo de listas) e `ListPagination` (rodapé de paginação das tabelas)
  - `FormActions` (Descartar/Salvar dos formulários de edição direta)
- `components/forms/`: `FormInput` e `FormSelect`, campos já ligados ao react-hook-form (valor, validação e erro no lugar da dica); usar no lugar de `Controller` + `Input`/`Select"
- `components/overlays/`: `FormModal` (formulário em modal) e `ConfirmModal` (confirmação de ação)
- `components/administration/`: componentes do módulo usados em mais de uma página (ex.: `AssignMembershipModal`, `UserFormModal`, `ProfileFormFields`, `ProfilePhotoEditor`, `EndMembershipModal`, `PersonLink`/`UserAvatar`/`avatarProps` para pessoa com foto ou iniciais, `UserSearchComboBox` para escolher pessoa buscando no backend)
- `components/projects/`: componentes do módulo projects usados em mais de uma página (`ProjectStatusBadge`/`ProjectPriorityBadge`, `ProjectFormFields`, `UserProjectsCard`, `AddProjectMemberModal`)
- `components/query_provider.tsx`: `QueryClientProvider` do TanStack Query, aplicado no layout raiz

### Locais (`app/<route>/_components/`)

- Componentes usados apenas por uma página ficam junto dela em `_components/`
- O prefixo `_` faz o Next.js tratar a pasta como privada (fora do roteamento)
- Componente local que passa a ser usado por outra página é promovido para `components/`

## 5. Formulários e validação

- Formulários com react-hook-form + Zod (`useForm({ resolver: zodResolver(schema) })`)
- Schemas compartilhados em `schemas/<module>/`; schema usado por um único formulário pode ficar junto da página
- Tipos derivados com `z.infer<typeof schema>`, sem duplicar tipo manualmente
- A validação do front é para UX; a validação de verdade continua no backend (VineJS)
- **Telas de detalhe são editáveis direto**: quem tem permissão já entra com os campos editáveis, sem botão "Editar" nem modal de edição; um único formulário por tela, montado com `useEditForm` (`hooks/use_edit_form.ts`: carrega os dados salvos, recarrega quando mudam e oferece `discard`) e `FormActions` (Descartar/Salvar ativos só quando algo mudou), e quem não pode editar vê a mesma estrutura só para leitura. Modais ficam para criar registros e ações pontuais (atribuir cargo, confirmar)
- **Sem informação repetida em cards separados**: dados de uma mesma entidade ficam num card só (ex.: uma única foto por tela)
- **Campos limpos a cada submissão**: o formulário nunca reaparece com o que foi preenchido antes
  - Em modal: o componente exportado só chama `useOpenSession(isOpen)` (`hooks/use_open_session.ts`) e renderiza o conteúdo com `key={session}`; os valores iniciais vão em `defaultValues` do `useForm`. Não usar `reset` em `useEffect` ao abrir (os campos montam antes do efeito e guardam os valores antigos)
  - Na página: formulário que cria algo chama `reset` com os valores vazios no `onSuccess`; formulário que edita um registro volta a mostrar os dados salvos

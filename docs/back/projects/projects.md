# Projetos

Módulo `projects`: projetos da liga, equipes com histórico, interessados e a análise de alocação. Depende só de `administration`.

## De onde veio

O SimMAP guardava os projetos como texto solto: o time era uma lista de nomes, e cada membro tinha listas próprias de projetos atuais, finalizados, coordenados e com interesse, que podiam divergir entre si. Não havia histórico de quem entrou ou saiu.

Aqui a ideia é a mesma do organograma: guardar **vínculos com período** e derivar o resto. Projetos atuais, finalizados e coordenados de uma pessoa saem da equipe (`project_members`); nada disso é guardado no usuário. Nenhum dado do SimMAP foi importado.

## Tabelas

**`projects`**

| Coluna | Observação |
|---|---|
| `name` | obrigatório e **não único**: projetos diferentes podem ter o mesmo nome (ex.: edições). As telas diferenciam pela diretoria e pelas datas, e tudo é referenciado pelo `id` |
| `description` | texto livre, opcional |
| `status` | `not_started`, `in_progress`, `suspended`, `finished` (padrão `not_started`) |
| `priority` | `high`, `medium`, `low` ou nulo (o "Não se aplica" do SimMAP) |
| `directorate_id` | diretoria dona do projeto (obrigatória); define quem pode gerenciá-lo |
| `starts_at`, `expected_end_at` | início e previsão de término, opcionais; a previsão não pode ser antes do início |
| `ended_at` | preenchida ao finalizar (padrão: hoje) e limpa ao reabrir; não pode ser antes do início |

**`project_members`**: pessoa na equipe, com `role` (`coordinator` ou `member`), `starts_at` e `ends_at` (nulo = está na equipe).

- No máximo **um coordenador ativo** por projeto e **uma participação ativa** por pessoa em cada projeto, garantidos também por índices únicos parciais no banco
- Trocar o papel (ex.: integrante vira coordenador) encerra a participação atual e abre outra, preservando o histórico, como na troca de cargo
- Para trocar o coordenador, primeiro ele sai da coordenação (fica como integrante ou sai), depois o novo é definido (`E_COORDINATOR_TAKEN` enquanto houver um)
- **Finalizar o projeto encerra a equipe** na data de término (nunca antes da entrada de cada pessoa)
- **Equipe travada em projetos suspensos ou finalizados**: ninguém entra nem sai (`E_PROJECT_TEAM_LOCKED`), nem pelo coordenador. Só projetos não iniciados ou em andamento mexem na equipe; para alocar num projeto suspenso, ele precisa ser retomado antes
- Quem entra na equipe deixa de constar como interessado

**`project_interests`**: interesse de uma pessoa em participar (único por pessoa e projeto). Cada um marca e desmarca o próprio; não vale para projetos finalizados nem para quem já está na equipe.

Propostas de projeto pessoal e sugestões de retomada (que o SimMAP coletava pelo Forms) ficaram para depois.

## Dependência de `administration`

Pessoas e diretorias pertencem a `administration`, então o módulo **não importa os models de lá**: a migration referencia as tabelas (FK), e os services buscam os dados pelos services donos e montam a resposta:

- `UserService.findMany(ids)`: pessoas com o perfil (coordenador, equipe, interessados)
- `UserService.searchIds(term)`: busca de projetos pelo nome de quem está na equipe
- `UserService.listActiveMembers()`: pessoas ativas na liga com perfil, tecnologias e cargos, já ordenadas por disponibilidade e maturidade (base do radar)
- `DirectorateService.list/find`
- `PermissionService.usersReachable(actorId, permission, ids)`: versão em lote do `canOnUser`

Por isso os services devolvem DTOs de "visão" (`ProjectView`, `ProjectMemberView`...) com o model do projeto e as pessoas/diretoria já montadas, e os transformers trabalham sobre esses DTOs.

## Permissões

| Permissão | Quem tem |
|---|---|
| `projects.project.view` | todos os membros (global) |
| `projects.project.manage` | CORP (global); diretores na própria diretoria; **diretor de Projetos em todas** |
| `projects.team.manage` | os mesmos de `project.manage` |

- O diretor de Projetos recebe a gestão global pelo mapa de permissões por diretoria (`directoratePositionPermissions`, ver [permissões](../administration/permissions.md))
- **Coordenador**: gerencia os integrantes do próprio projeto sem ter a permissão; definir ou tirar o coordenador é só de quem tem `team.manage`. Por isso as rotas de equipe não usam o middleware `can`, e o `ProjectTeamService` confere tudo
- Mudar o projeto de diretoria exige a permissão nas duas
- O detalhe do projeto devolve `abilities` (`canEdit`, `canManageTeam`) para o front mostrar os botões, além de `isMember` e `isInterested` de quem consulta

## Análise e radar

- **Análise** (todos): total de projetos, por status, por prioridade (só não finalizados; `none` = sem prioridade), pessoas alocadas e sem projeto (entre as ativas na liga), tamanho das equipes dos projetos em andamento e interessados por projeto aberto
- **Radar** (quem gerencia projetos em algum escopo): pessoas ativas na liga fora de qualquer equipe, das mais disponíveis e maduras para as menos, com curso, cargos, tecnologias, áreas de interesse e projetos em que marcaram interesse
  - A nota técnica só aparece para quem pode ver os dados privados da pessoa (`administration.profile.view_private`, mesma regra do perfil), e **não entra na ordem**, para a posição na lista não revelar a nota a quem não pode vê-la. No SimMAP a ordem começava pela nota

## Rotas (`/api/v1/projects`)

| Método | Rota | Permissão |
|---|---|---|
| GET | `/projects` (`?search`, `status`, `priority`, `directorateId`, `sort=activity\|team\|name`, `page`, `perPage`) | `project.view` (paginado: `{ data, metadata }`) |
| GET | `/projects/:id` | `project.view` |
| POST | `/projects` | `project.manage` na diretoria |
| PUT | `/projects/:id` | `project.manage` na diretoria do projeto |
| GET | `/projects/:id/members` | `project.view` (equipe com histórico: ativos, coordenador primeiro, depois quem saiu) |
| POST | `/projects/:id/members` | `team.manage` ou coordenador (só integrantes) |
| POST | `/project-members/:id/end` | idem |
| GET | `/users/:id/projects` | `project.view` (participações e interesses da pessoa) |
| GET | `/projects/:id/interests` | `project.view` |
| POST / DELETE | `/projects/:id/interest` | `project.view` (o próprio interesse; 204) |
| GET | `/analytics` | `project.view` |
| GET | `/radar` | `project.manage` em algum escopo |

A busca da lista procura no nome do projeto e no nome/e-mail de quem está na equipe; `activity` (padrão) ordena por em andamento, não iniciado, suspenso e finalizado, e times maiores antes.

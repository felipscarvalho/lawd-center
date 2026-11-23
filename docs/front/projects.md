# Telas do módulo projects

Telas sobre a API descrita em [projetos](../back/projects/projects.md). Ficam na seção **Projetos** da sidebar (permissão `projects.project.view`, que todo membro tem). Os gráficos do SimMAP ficaram para depois: a análise usa números e listas ordenadas.

## Projetos (`/projects`)

- Mesma estrutura da lista de usuários: busca à direita (nome do projeto ou de alguém da equipe, com espera de 300 ms) e **Filtros** com status, prioridade, diretoria e **ordem** (atividade, tamanho do time ou nome; padrão atividade). A ordem conta como filtro quando foge do padrão
- Paginação de 20 em 20 no backend (`ListPagination`); mudar busca ou filtro volta para a página 1
- Colunas: projeto com a diretoria embaixo (o nome não é único, a diretoria ajuda a diferenciar), status, coordenação, tamanho da equipe e prioridade; as três últimas somem em telas menores
- **Novo projeto** aparece para quem gerencia projetos em alguma diretoria. A diretoria só oferece as que a pessoa gerencia, sugerindo Projetos. Depois de salvar, abre o detalhe para montar a equipe

## Detalhe do projeto (`/projects/:id`)

Segue as regras das telas de detalhe: um card só, editável direto para quem pode editar (`abilities.canEdit` vindo do backend) e só leitura para os demais.

- À esquerda: coordenação (pessoa com link), tamanho da equipe, interessados e data de cadastro. À direita: nome, diretoria, status, prioridade, datas e descrição (`ProjectFormFields`, os mesmos campos do cadastro). A data de término só aparece com o status "Finalizado" (vazia = hoje); ao finalizar, o aviso diz que a equipe foi encerrada
- **Tenho interesse / Retirar interesse**: para quem não está na equipe, enquanto o projeto não termina
- **Adicionar à equipe** (quem gerencia a equipe, inclusive o coordenador): pessoa (busca no backend), papel e data de entrada. O papel "Coordenador" só aparece para quem tem a gestão de equipes da diretoria (`projects.team.manage`), a mesma regra do backend. Se a pessoa já está na equipe com outro papel, ele é trocado
- **Equipe**: ativos primeiro (coordenador antes) e depois o histórico. O papel aparece embaixo do nome; no celular a situação some e quem saiu mostra a data no lugar. O "X" tira a pessoa da equipe com confirmação: integrantes, para quem gerencia a equipe; o coordenador, só para a gestão de equipes
- **Interessados**: maturidade, disponibilidade e desde quando, com o atalho de adicionar à equipe (abre o mesmo modal com a pessoa já escolhida)

## Análise (`/projects/analytics`)

- Indicadores: projetos (e finalizados), em andamento, suspensos ou não iniciados, e pessoas em projetos (e sem projeto)
- Listas ordenadas (`RankingCard`): equipes dos projetos em andamento, interesse por projeto aberto e projetos abertos por prioridade
- **Radar de alocação**, só para quem gerencia projetos em algum escopo: pessoas sem equipe, das mais disponíveis e maduras para as menos, com cargo (o primeiro e quantos mais, para não alargar a tabela), disponibilidade, maturidade, nota técnica (só quando quem vê pode ver), tecnologias e projetos de interesse

## Projetos da pessoa

`UserProjectsCard` (`components/projects/`) aparece no detalhe do usuário e em **Meu perfil**, para quem tem `projects.project.view`: participações (projeto, papel, período e status do projeto ou "Saiu da equipe") e os projetos em que a pessoa marcou interesse.

## Peças do módulo

| Peça | Onde | Para quê |
|---|---|---|
| `ProjectStatusBadge`, `ProjectPriorityBadge` | `components/projects/project_badges.tsx` | status e prioridade com as cores de cada um |
| `ProjectFormFields`, `toProjectFormValues`, `toProjectPayload` | `components/projects/project_form_fields.tsx` | campos do projeto no cadastro e no detalhe; "Sem prioridade" é uma opção que vira `null` |
| `UserProjectsCard` | `components/projects/user_projects_card.tsx` | projetos de uma pessoa |
| `UserSearchComboBox` | `components/administration/user_search_combobox.tsx` | escolher uma pessoa ativa buscando no backend (atribuir cargo, adicionar à equipe) |
| `projectKeys`, `useInvalidateProjects` | `hooks/projects/use_projects.ts` | todas as mutations do módulo invalidam `projects` inteiro: equipe e interesse mudam contagens da lista, do detalhe, da análise e dos perfis |
| rótulos e cores | `lib/projects.ts` | status, prioridade, papel e ordem |

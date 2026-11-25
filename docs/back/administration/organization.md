# Organização: diretorias, cargos e vínculos

Modela o organograma da LAWD (o mesmo do SimMAP): um núcleo institucional (CORP) com presidente, vice-presidente, secretário-geral e conselheiros, e diretorias (Adm, Projetos, Ensino, Eventos, RH, Marketing), cada uma com um diretor e membros efetivos.

## Por que três conceitos separados

No SimMAP o cargo era um texto no cadastro do membro e o secretário-geral era um "diretor" marcado com uma área especial. Aqui:

| Conceito | Onde fica | Por quê |
|---|---|---|
| **Diretoria** | tabela `directorates` | Pode mudar entre gestões (nomes, novas diretorias) sem mudar código |
| **Cargo** | enum `Position` em `app/permissions/positions.ts` | O mapa de permissões depende dele, então fica no mesmo lugar que as permissões |
| **Vínculo** | tabela `memberships` | Liga pessoa + diretoria + cargo + período, guardando o histórico |

## Diretorias (`directorates`)

| Coluna | Descrição |
|---|---|
| `key` | identificador estável usado pelo código (`corp`, `administrative`, `projects`, `teaching`, `events`, `hr`, `marketing`) |
| `name` | nome exibido (`CORP`, `Adm`, `Projetos`...) |
| `kind` | `core` (núcleo institucional, só pode existir um) ou `standard` |

As diretorias iniciais são criadas pelo seeder `database/seeders/administration/1_directorate_seeder.ts` (idempotente, atualiza pela chave).

## Cargos (`Position`)

| Valor | Rótulo | Onde pode existir | Ocupantes ativos |
|---|---|---|---|
| `president` | Presidente | núcleo (`core`) | 1 |
| `vice_president` | Vice-presidente | núcleo | 1 |
| `general_secretary` | Secretário-geral | núcleo | 1 |
| `counselor` | Conselheiro | núcleo | vários |
| `director` | Diretor | diretorias `standard` | 1 por diretoria |
| `member` | Membro efetivo | diretorias `standard` | vários |

## Vínculos (`memberships`)

Cada linha é uma pessoa ocupando um cargo numa diretoria por um período. `ends_at` nulo significa vínculo ativo.

| Coluna | Descrição |
|---|---|
| `user_id` | quem |
| `directorate_id` | onde |
| `position` | cargo (valor do enum `Position`) |
| `starts_at` / `ends_at` | período (datas); `ends_at` nulo = ativo |

Exemplo de histórico: uma pessoa que foi membro de Projetos, depois diretora de Projetos e depois presidente tem três linhas, e só a última está ativa. A situação atual, a trajetória, o organograma de uma data passada e o tempo de liga saem dessas linhas. O histórico de uma pessoa (`GET /users/:id/memberships`) vem do vínculo mais recente ao mais antigo; no mesmo dia, o cadastrado por último vem primeiro.

## Regras (`MembershipService`)

- Cargos do núcleo só no núcleo; diretor e membro efetivo só nas diretorias comuns (`E_POSITION_NOT_ALLOWED`)
- Cargos únicos não podem ter dois vínculos ativos (`E_POSITION_TAKEN`). O banco tem índices únicos parciais como segunda barreira. Conselheiro e membro efetivo aceitam vários ocupantes (`sharedPositions` em `positions.ts`); o conselheiro tem as mesmas permissões do restante do CORP
- **Troca de cargo**: se a pessoa já tem vínculo ativo na mesma diretoria, ele é encerrado e um novo é criado, sem editar o anterior (o histórico nunca se perde). Repetir o mesmo cargo devolve `E_ALREADY_IN_POSITION`
- Encerrar um vínculo já encerrado devolve `E_MEMBERSHIP_ALREADY_ENDED`; o término não pode ser anterior ao início (`E_INVALID_DATES`)
- Usuários desativados não recebem cargos (`E_USER_INACTIVE`); desativar um usuário encerra todos os vínculos ativos dele
- **Quem pode atribuir/encerrar**: quem tem `administration.membership.manage` global (presidência) gerencia qualquer cargo; quem tem a permissão só na própria diretoria (diretor) gerencia apenas membros efetivos daquela diretoria

## Endpoints (`/api/v1/administration`)

| Método | Rota | Permissão |
|---|---|---|
| GET | `/directorates` | `directorate.view` |
| POST / PUT | `/directorates`, `/directorates/:id` | `directorate.manage` |
| GET | `/organization-chart` | `membership.view` (diretorias com vínculos ativos e usuários, ordenados por hierarquia) |
| GET | `/users/:id/memberships` | `membership.view` (histórico completo) |
| POST | `/memberships` | `membership.manage` (`userId`, `directorateId`, `position`, `startsAt?`) |
| POST | `/memberships/:id/end` | `membership.manage` (`endsAt?`) |

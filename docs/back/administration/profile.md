# Perfil do usuário

Dados de cada pessoa da LAWD além do cadastro básico (nome, e-mail, senha): curso, entrada na UFS, disponibilidade, maturidade técnica, interesses, foto e a nota técnica dada pela gestão. Fica no módulo `administration` porque todos os módulos vão consultar quem é cada pessoa.

A estrutura foi pensada a partir dos dados que o SimMAP guardava sobre os usuários, sem copiar as entidades de lá. Projetos ficaram de fora por enquanto, assim como qualquer importação de dados.

## Tabelas

| Tabela | O que guarda |
|---|---|
| `profiles` | um registro por usuário (`user_id` único), criado no primeiro preenchimento |
| `technologies`, `interest_areas` | catálogos abertos, compartilhados entre os perfis |
| `user_technologies`, `user_interest_areas` | pivôs usuário ↔ item do catálogo |

Campos de `profiles`:

| Campo | Tipo | Observação |
|---|---|---|
| `birth_date` | data | privado |
| `course` | enum | `information_systems`, `computer_science`, `computer_engineering`, `design`, `advertising`, `other` |
| `university_entry_period` | `AAAA.S` | período de **entrada** na UFS (ex.: `2022.1`); o período atual se calcula a partir dele |
| `graduated` | booleano | já formado |
| `photo_path` | texto | caminho da foto no disco (ver abaixo) |
| `weekly_availability` | enum | `under_6h`, `from_6_to_8h`, `from_9_to_12h`, `over_12h` |
| `maturity` | enum | `beginner`, `developing`, `autonomous`, `mentor` |
| `career_paths` | jsonb (lista de enum) | `full_stack`, `frontend`, `backend`, `devops`, `ui_ux`, `project_management`, `research` |
| `soft_skills` | jsonb (lista de enum) | `communication`, `teamwork`, `leadership`, `organization`, `proactivity`, `autonomy` |
| `goal` | texto | objetivo na LAWD; privado |
| `technical_score` | decimal 0–10 | nota técnica; com `technical_score_updated_by` e `technical_score_updated_at` |

Por que assim:

- **Listas fixas em enum, catálogos abertos em tabela.** Carreira e atributos têm poucas opções e o código decide o que significam, então ficam em `jsonb` validado por enum. Tecnologias e áreas de interesse crescem com o uso: cada nome novo vira item do catálogo, e o formulário sugere os que já existem. A comparação ignora maiúsculas (índice único em `lower(name)`), então "react" e "React" são o mesmo item, mantendo a primeira grafia cadastrada
- **Tabela separada de `users`.** O cadastro (login, ativação) e o perfil mudam por motivos diferentes e têm regras de acesso diferentes
- Os enums e o formato do período ficam exportados em `app/models/administration/profile.ts`, usados pelo model e pelo validator. Os rótulos em português ficam no front
- `technical_score`, `career_paths` e `soft_skills` são ignorados pelo gerador de schema (`database/schema_rules.ts`) e declarados no model com conversão: o Postgres devolve decimal como texto e o `jsonb` precisa de `JSON.stringify` na escrita

## Quem vê e quem edita

| Ação | Quem pode |
|---|---|
| Ver o perfil | a própria pessoa (mesmo sem vínculo ativo) e quem tem `profile.view` (todos os cargos) |
| Ver nascimento e objetivo | a própria pessoa e quem tem `profile.view_private` sobre ela |
| Ver a nota técnica | só quem tem `profile.view_private` sobre ela (a própria pessoa **não** vê) |
| Editar o perfil e a foto | a própria pessoa e quem tem `profile.update` sobre ela |
| Definir a nota técnica | quem tem `profile.evaluate` sobre ela, nunca sobre si mesmo (`E_SELF_EVALUATION`, 422) |

`view_private`, `update` e `evaluate` são globais para presidente, vice e secretário-geral, e de escopo `directorate` para o diretor: valem sobre quem tem vínculo ativo na diretoria dele. "Sobre ela" é conferido por `PermissionService.canOnUser(actorId, permission, targetUserId)`, que aceita a permissão global ou concedida numa diretoria onde a pessoa alvo tem vínculo ativo.

Os campos que quem consulta não pode ver saem como `null` na resposta. Junto vem `abilities` (`canUpdate`, `canViewPrivate`, `canEvaluate`), para o front decidir o que mostrar sem repetir a regra.

## Foto

- Disco local, via `@adonisjs/drive` (disco `fs`, pasta `storage/`, fora do git), servido em `/uploads`. É a decisão definitiva para o projeto
- Aceita JPG, PNG e WebP de até 5 MB (validator). O `ImageCompressionService` (sharp) aplica a rotação do EXIF, recorta em quadrado 512×512 centralizado, converte para WebP qualidade 80 e descarta os metadados (EXIF pode ter localização). Arquivo que não é imagem de verdade vira `E_INVALID_IMAGE` (422)
- Cada envio grava com nome novo (`profiles/<userId>/<uuid>.webp`) e apaga a foto anterior, então o navegador nunca mostra uma versão em cache
- O `UserTransformer` inclui `photoUrl` quando o perfil vem carregado: listas, detalhe, organograma e `/auth/me`

O `ImageCompressionService` não conhece perfil: recebe o caminho do arquivo e devolve o buffer comprimido, para outros módulos reaproveitarem.

## Endpoints (`/api/v1/administration`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `users/:id/profile` | perfil filtrado para quem consulta, com `abilities` |
| `PUT` | `users/:id/profile` | atualiza os campos enviados (ausente = não muda, `null` = limpa); `technologies` e `interestAreas` são nomes e substituem a lista |
| `POST` | `users/:id/profile/photo` | multipart com `photo` |
| `DELETE` | `users/:id/profile/photo` | remove a foto (registro e arquivo) |
| `PUT` | `users/:id/technical-score` | `{ technicalScore: number \| null }`, até duas casas |
| `GET` | `technologies?search=` | nomes do catálogo (até 20), para autocompletar |
| `GET` | `interest-areas?search=` | idem |

O perfil que nunca foi preenchido responde com os campos vazios; o registro é criado na primeira edição.

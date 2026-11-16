# Telas do módulo administration

Telas sobre o que o backend oferece em `/api/v1/administration` (ver [docs/back/administration](../back/administration/)). O front só mostra ações que o usuário pode executar, mas quem garante a autorização é sempre o backend.

## Rotas

| Rota | Tela | Permissão para ver |
|---|---|---|
| `/` | página "Em desenvolvimento" com botão **Entrar** | pública |
| `/login` | login por e-mail e senha; quem já tem sessão vai direto ao organograma | pública |
| `/organization` | organograma | `membership.view` |
| `/users` | lista de usuários | `user.view` |
| `/users/[id]` | detalhe do usuário (conta e perfil, editáveis direto) e histórico de cargos | `user.view` |
| `/profile` | meu perfil | qualquer usuário logado |
| `/directorates` | diretorias | `directorate.view` |

Depois do login o usuário vai para `/organization`.

## Organograma

Duas visualizações, alternadas pelo botão **Grafo / Lista** no topo. Abre sempre no grafo, em qualquer tela.

**Grafo** (`organization_graph.tsx`): árvore estática, só para visualizar (sem arrastar nem zoom). O núcleo institucional fica no topo, ligado às diretorias por linhas com cantos arredondados e pontos nas ligações, sobre um fundo pontilhado. As diretorias quebram em fileiras para caber na tela sem rolagem (2 por fileira; 4 em telas bem largas), com a linha central descendo pelo vão entre os cards. Cada card mostra o tipo, o nome, o diretor em destaque e os membros como avatares (até 5, depois "+N"); clicar numa pessoa abre o detalhe dela, e o **+** atribui cargo para quem gerencia a diretoria. As linhas são feitas só com CSS (pseudo-elementos do Tailwind), sem biblioteca de grafos.

**Lista** (`directorate_section.tsx`): um card só, com uma seção por diretoria (núcleo primeiro). Cada seção tem cabeçalho no estilo do grafo (ícone, nome, quantidade de pessoas e **Adicionar**) e uma linha por pessoa: avatar, nome e e-mail (abre o detalhe), cargo (diretor e núcleo em destaque), data de início e o **X** para encerrar o vínculo, ordenadas pela hierarquia do cargo e a data de início. É onde se encerram vínculos.

- **Atribuir cargo** (botão no topo): só com gestão global de vínculos
- **Adicionar** (no card): para quem gerencia aquela diretoria. O diretor vê o botão só no card da própria diretoria e só pode adicionar membros efetivos
- **Encerrar vínculo** (X ao lado da pessoa): mesma regra; pede confirmação e informa que o histórico é mantido
- Clicar na pessoa abre o detalhe do usuário (com o perfil)

## Usuários

- Busca por nome ou e-mail no canto direito; o botão **Filtros** abre um painel com situação (Ativos, Desativados, Todos; padrão Ativos), diretoria (cargo ativo) e curso. O botão mostra quantos filtros fogem do padrão e o painel tem **Limpar filtros**. Busca e filtros de diretoria e curso são locais; clicar na linha abre o detalhe
- Colunas: nome com foto, cargos ativos (cargo · diretoria), curso com o período de entrada, maturidade e disponibilidade (as três últimas somem em telas menores). A coluna de situação só aparece com o filtro em **Todos**, já que nos outros ela é o próprio filtro
- O `GET /users` traz, junto de cada usuário, o resumo público do perfil (`profile`: curso, entrada, disponibilidade e maturidade) e os cargos ativos com a diretoria (`memberships`); dados privados não entram na lista
- **Novo usuário** (`user.create`): nome, e-mail e senha. O cargo é atribuído depois

### Detalhe do usuário

Um único card no mesmo layout de **Meu perfil** (sem dados repetidos em cards separados):

- **Esquerda**: foto (enviar e remover com `abilities.canUpdate`), situação, cargos atuais, data de cadastro, **Senha** (com `user.update`: nova senha sem pedir a atual, como a coluna de conta de Meu perfil) e, com `canViewPrivate`, a **nota técnica**. Com `canEvaluate` a nota já é um campo editável com **Salvar nota** (0 a 10, vírgula ou ponto, vazio remove); sem ela, só leitura
- **Direita**: com `abilities.canUpdate`, um formulário só (`UserEditForm`) com conta e perfil: nome e e-mail em **Dados pessoais** (editáveis com `user.update`; o diretor vê só leitura) e as seções do perfil. Um único **Salvar alterações** envia só as partes alteradas, cada uma para o seu endpoint (usuário e perfil). Sem `canUpdate`, a mesma estrutura só para leitura (`UserProfileDetails`)
- Não há botão **Editar**: quem pode editar já entra com os campos editáveis
- **Desativar** (`user.deactivate`, não aparece para o próprio usuário) e **Atribuir cargo** ficam no topo da página
- **Histórico de cargos** abaixo do card: todos os vínculos, do mais recente ao mais antigo; os ativos podem ser encerrados por quem gerencia a diretoria

## Meu perfil (`/profile`)

Página em duas colunas dentro de um único card (no celular, uma embaixo da outra):

- **Conta** (esquerda): foto em quadro grande com o X para remover (pede confirmação) e o botão **Enviar/Trocar foto**; sem foto, mostra as iniciais. Abaixo, a **troca de senha** (senha atual e nova). Depois da troca o backend encerra as outras sessões, e o toast avisa isso
- **Formulário do perfil** (direita), direto na página em vez de modal, em seções com título, descrição e linha divisória: **Dados pessoais** (nome e e-mail só leitura, pois quem altera é a gestão, nascimento e matrícula), **Formação** (curso e entrada na UFS), **Dedicação e nível** (disponibilidade e maturidade), **Interesses** (carreira e áreas de interesse), **Habilidades** (atributos e tecnologias) e **Objetivo na LAWD**. **Salvar alterações** e **Descartar** só ficam ativos quando algo mudou
- A nota técnica não aparece: a própria pessoa não vê a sua

Os campos do perfil ficam em `ProfileFormFields` (`components/administration/profile_form_fields.tsx`), usados por Meu perfil e pelo detalhe do usuário, para os dois formulários não divergirem. As descrições das seções falam com a pessoa ("você") e só aparecem no próprio perfil. Na maturidade técnica a descrição do nível aparece como dica abaixo do select: como texto de apoio do item, o `Select` do Untitled cortava o nome do nível. Carreira e atributos aceitam até 3 opções cada: um contador mostra quantas foram escolhidas e, ao chegar em 3, as demais ficam desabilitadas.

Regras de acesso do perfil em [docs/back/administration/profile.md](../back/administration/profile.md); o front segue o `abilities` que vem na resposta. Nascimento, matrícula e objetivo só aparecem para a própria pessoa ou com `canViewPrivate`. A foto (`ProfilePhotoEditor`) é conferida no navegador (JPG, PNG ou WebP, até 5 MB) antes do envio, e o backend comprime. Toda alteração de perfil invalida perfil, usuários e organograma (por causa da foto) e, quando é o próprio perfil, chama `revalidate()` do `user_store`.

## Diretorias

Tabela com nome, chave e tipo. Com `directorate.manage`: **Nova diretoria** (nome, chave em inglês e tipo) e **Renomear** (só o nome; a chave é usada pelo código e não muda).

## Atribuir cargo (`AssignMembershipModal`)

Usado no organograma e no detalhe do usuário, com a diretoria ou o usuário já preenchidos conforme a origem.

- Usuário: busca entre os usuários ativos
- Diretoria: só as que quem atribui pode gerenciar
- Cargo: depende do tipo da diretoria (núcleo: presidente, vice, secretário-geral; demais: diretor, membro efetivo). Sem gestão global, só membro efetivo
- Início: opcional; sem data o cargo começa hoje
- Se a pessoa já tem cargo na mesma diretoria, ele é encerrado e substituído (troca de cargo)

Depois de atribuir ou encerrar, o organograma, os históricos e o próprio usuário logado (`user_store.revalidate()`) são atualizados.

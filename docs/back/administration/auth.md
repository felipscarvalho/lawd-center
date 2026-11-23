# Autenticação e usuários

## Autenticação por access token

`@adonisjs/auth` com o guard `api` de **access tokens** (`config/auth.ts`). O front envia o token em `Authorization: Bearer <token>`. Escolhido por funcionar de forma simples com o front Next.js em outra origem e por ser o padrão do starter kit `api`.

Os tokens ficam na tabela `auth_access_tokens` (só o hash é guardado; o valor em texto puro aparece apenas na resposta do login).

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/v1/administration/auth/login` | `email`, `password` → `{ token, user }`. Credenciais inválidas ou usuário desativado: 400 `E_INVALID_CREDENTIALS` (mensagem genérica, não revela qual) |
| POST | `/api/v1/administration/auth/logout` | revoga o token da requisição (204) |
| GET | `/api/v1/administration/auth/me` | usuário autenticado + permissões efetivas, usadas pelo front para montar menus e telas |
| PUT | `/api/v1/administration/auth/password` | troca a própria senha (`currentPassword`, `newPassword`; 204) |

### Troca de senha

Qualquer usuário logado troca a própria senha informando a atual. Senha atual errada devolve 422 com `code: E_INVALID_CURRENT_PASSWORD` e `field: currentPassword` (o front mostra o erro no campo); a nova precisa ter de 8 a 72 caracteres e ser diferente da atual. Depois da troca, **todas as outras sessões (tokens) são revogadas** e a sessão usada continua válida: quem trocou a senha por suspeita de acesso indevido derruba o outro lado sem precisar entrar de novo.

`BusinessRuleException` aceita um `field` opcional justamente para regras de negócio ligadas a um campo do formulário.

O middleware `auth` protege as rotas autenticadas; sem token válido a resposta é 401.

## Usuários (`users`)

| Coluna | Descrição |
|---|---|
| `full_name` | nome completo |
| `email` | único, salvo em minúsculas |
| `password` | hash (scrypt, via `withAuthFinder`); nunca é serializado |
| `deactivated_at` | preenchido quando o usuário é desativado |

### Cadastro

Por enquanto **só administradores cadastram usuários** (não há auto-cadastro). O primeiro administrador é criado pelo seeder `2_admin_user_seeder.ts` a partir de `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`, recebendo o cargo de presidente no CORP. Sem essas variáveis o seeder só avisa e não cria nada.

### Desativação

Usuários não são apagados. Desativar (`POST /users/:id/deactivate`):

- preenche `deactivated_at` e bloqueia o login
- encerra todos os vínculos ativos (o acesso derivado deles cai junto)
- revoga todos os tokens
- não é permitido desativar o próprio usuário (`E_SELF_DEACTIVATION`)

| Método | Rota | Permissão |
|---|---|---|
| GET | `/users` (`?active`, `search`, `directorateId`, `course`, `page`, `perPage`) | `user.view` (paginado: `{ data, metadata }`) |
| GET | `/users/:id` | `user.view` |
| POST | `/users` | `user.create` |
| PUT | `/users/:id` | `user.update` |
| POST | `/users/:id/deactivate` | `user.deactivate` |

Validações: nome com 3+ caracteres, e-mail válido e único (sem diferenciar maiúsculas), senha de 8 a 72 caracteres.

Lista paginada no banco (padrão 20 por página, máximo 100), em ordem de nome. Os filtros também são aplicados no banco, para o total de páginas bater com o resultado: `search` procura no nome e no e-mail (sem diferenciar maiúsculas; `%` e `_` contam como texto), `directorateId` traz quem tem cargo ativo na diretoria e `course` filtra pelo curso do perfil. A resposta segue o paginador dos transformers: itens em `data` e `metadata` com `total`, `perPage`, `currentPage` e `lastPage`.

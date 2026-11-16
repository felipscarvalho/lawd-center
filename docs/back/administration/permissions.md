# Permissões

## Decisão: permissões só no código

As permissões são definidas **apenas no código**, versionadas e revisadas em PR, no mesmo espírito do que big techs usam (Google Zanzibar, policies da AWS, papéis fixos do GitHub). O banco guarda só o que muda com as pessoas: usuários, diretorias e vínculos. **Não existem** tabelas de permissões nem de papéis.

Consequência aceita: mudar o que um cargo pode fazer exige deploy. Se um dia for preciso editar pela interface, a evolução prevista é guardar no banco só exceções por usuário, sem duplicar o catálogo.

## Onde fica

| Arquivo | Conteúdo |
|---|---|
| `app/permissions/<module>.ts` | catálogo do módulo: chave → descrição |
| `app/permissions/index.ts` | junta os catálogos; exporta `PermissionKey`, `permissionKeys` e `PermissionScope` |
| `app/permissions/positions.ts` | cargos (`Position`) e o mapa cargo → permissões com escopo |

Chaves no formato `<módulo>.<recurso>.<ação>` (ex.: `administration.user.create`). Por serem tipadas, uma chave inexistente não compila.

## Escopo

Cada permissão concedida por um cargo tem um escopo:

- `global`: vale no sistema todo
- `directorate`: vale só na diretoria do vínculo que a concedeu

Assim um único "diretor" no mapa serve para todas as diretorias: o diretor de Eventos recebe `membership.manage` só em Eventos.

## Como as permissões de um usuário são calculadas

`PermissionService.getEffectivePermissions(userId)`:

1. Busca os vínculos **ativos** do usuário
2. Para cada vínculo, pega as permissões do cargo no mapa
3. Permissões de escopo `directorate` recebem o `directorateId` do vínculo

Não há atribuição manual de papéis: mudou o cargo, mudou o acesso; encerrou o vínculo, o acesso cai.

## Mapa atual (módulo administration)

| Cargo | Permissões |
|---|---|
| Presidente, vice-presidente, secretário-geral | todas as `administration.*`, global |
| Diretor | `user.view`, `directorate.view`, `membership.view`, `profile.view` (global) + `membership.manage`, `profile.view_private`, `profile.update`, `profile.evaluate` (diretoria) |
| Membro efetivo | `user.view`, `directorate.view`, `membership.view`, `profile.view` (global) |

Catálogo do `administration`: `user.view`, `user.create`, `user.update`, `user.deactivate`, `directorate.view`, `directorate.manage`, `membership.view`, `membership.manage`, `profile.view`, `profile.view_private`, `profile.update`, `profile.evaluate`. As regras do perfil estão em [profile.md](profile.md).

## Onde a autorização é checada

- **Na rota**, com o middleware `can`: `router.post('users', ...).use(middleware.can('administration.user.create'))`. Exige a permissão em algum escopo e deixa a regra visível no arquivo de rotas
- **No service**, para escopo de diretoria e regras por registro, via `PermissionService.can(userId, permission, directorateId)` ou `authorize(...)` (lança `ForbiddenException`, HTTP 403). Ex.: o `MembershipService` confere se o diretor está mexendo na própria diretoria
- **Sobre outra pessoa**, via `PermissionService.canOnUser(actorId, permission, targetUserId)`: vale a permissão global ou a concedida numa diretoria onde a pessoa alvo tem vínculo ativo. É o que deixa o diretor editar e avaliar o perfil dos membros da própria diretoria

## Como adicionar permissões de um módulo novo

1. Criar `app/permissions/<module>.ts` com o catálogo
2. Registrar o catálogo em `app/permissions/index.ts`
3. Conceder aos cargos em `app/permissions/positions.ts`, com o escopo certo
4. Proteger as rotas com `middleware.can(...)` e, se houver escopo de diretoria, conferir no service

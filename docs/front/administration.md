# Telas do módulo administration

Telas sobre o que o backend oferece em `/api/v1/administration` (ver [docs/back/administration](../back/administration/)). O front só mostra ações que o usuário pode executar, mas quem garante a autorização é sempre o backend.

## Rotas

| Rota | Tela | Permissão para ver |
|---|---|---|
| `/` | página "Em desenvolvimento" com botão **Entrar** | pública |
| `/login` | login por e-mail e senha; quem já tem sessão vai direto ao organograma | pública |
| `/organization` | organograma | `membership.view` |
| `/users` | lista de usuários | `user.view` |
| `/users/[id]` | detalhe do usuário e histórico de cargos | `user.view` |
| `/directorates` | diretorias | `directorate.view` |

Depois do login o usuário vai para `/organization`.

## Organograma

Um card por diretoria (o núcleo institucional ocupa a largura toda), com as pessoas ordenadas pela hierarquia do cargo e a data de início.

- **Atribuir cargo** (botão no topo): só com gestão global de vínculos
- **Adicionar** (no card): para quem gerencia aquela diretoria. O diretor vê o botão só no card da própria diretoria e só pode adicionar membros efetivos
- **Encerrar vínculo** (X ao lado da pessoa): mesma regra; pede confirmação e informa que o histórico é mantido

## Usuários

- Lista com filtro **Ativos / Desativados / Todos** e busca local por nome ou e-mail; clicar na linha abre o detalhe
- **Novo usuário** (`user.create`): nome, e-mail e senha. O cargo é atribuído depois

### Detalhe do usuário

- Cargos atuais, data de cadastro e situação
- **Editar** (`user.update`): nome, e-mail e senha (em branco mantém a atual)
- **Desativar** (`user.deactivate`, não aparece para o próprio usuário): confirmação explicando que o login é bloqueado e os cargos são encerrados
- **Atribuir cargo** (gestão de vínculos em alguma diretoria)
- **Histórico de cargos**: todos os vínculos com início, término e situação; os ativos podem ser encerrados por quem gerencia a diretoria

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

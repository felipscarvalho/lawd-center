# Telas do módulo administration

Telas sobre o que o backend oferece em `/api/v1/administration` (ver [docs/back/administration](../back/administration/)). O front só mostra ações que o usuário pode executar, mas quem garante a autorização é sempre o backend.

## Rotas

| Rota | Tela | Permissão para ver |
|---|---|---|
| `/` | página "Em desenvolvimento" com botão **Entrar** | pública |
| `/login` | login por e-mail e senha; quem já tem sessão vai direto ao organograma | pública |
| `/organization` | organograma | `membership.view` |
| `/users` | lista de usuários | `user.view` |
| `/users/[id]` | detalhe do usuário, perfil e histórico de cargos | `user.view` |
| `/profile` | meu perfil | qualquer usuário logado |
| `/directorates` | diretorias | `directorate.view` |

Depois do login o usuário vai para `/organization`.

## Organograma

Um card por diretoria (o núcleo institucional ocupa a largura toda), com as pessoas ordenadas pela hierarquia do cargo e a data de início.

- **Atribuir cargo** (botão no topo): só com gestão global de vínculos
- **Adicionar** (no card): para quem gerencia aquela diretoria. O diretor vê o botão só no card da própria diretoria e só pode adicionar membros efetivos
- **Encerrar vínculo** (X ao lado da pessoa): mesma regra; pede confirmação e informa que o histórico é mantido
- Clicar na pessoa abre o detalhe do usuário (com o perfil)

## Usuários

- Lista com filtro **Ativos / Desativados / Todos** e busca local por nome ou e-mail; clicar na linha abre o detalhe
- **Novo usuário** (`user.create`): nome, e-mail e senha. O cargo é atribuído depois

### Detalhe do usuário

- Cargos atuais, data de cadastro e situação
- **Editar** (`user.update`): nome, e-mail e senha (em branco mantém a atual)
- **Desativar** (`user.deactivate`, não aparece para o próprio usuário): confirmação explicando que o login é bloqueado e os cargos são encerrados
- **Atribuir cargo** (gestão de vínculos em alguma diretoria)
- **Perfil** (`ProfilePanel`, ver abaixo)
- **Histórico de cargos**: todos os vínculos com início, término e situação; os ativos podem ser encerrados por quem gerencia a diretoria

## Meu perfil (`/profile`)

Página em duas colunas dentro de um único card (no celular, uma embaixo da outra):

- **Conta** (esquerda): foto em quadro grande com o X para remover (pede confirmação) e o botão **Enviar/Trocar foto**; sem foto, mostra as iniciais. Abaixo, a **troca de senha** (senha atual e nova). Depois da troca o backend encerra as outras sessões, e o toast avisa isso
- **Formulário do perfil** (direita), direto na página em vez de modal: nome e e-mail só leitura (quem altera é a gestão), seções **Formação**, **Atuação na LAWD** e **Sobre você**. **Salvar alterações** e **Descartar** só ficam ativos quando algo mudou
- A nota técnica não aparece: a própria pessoa não vê a sua

Os campos do perfil ficam em `ProfileFormFields` (`components/administration/profile_form_fields.tsx`), usados pela página e pelo `ProfileFormModal`, para os dois formulários não divergirem. Na maturidade técnica a descrição do nível aparece como dica abaixo do select: como texto de apoio do item, o `Select` do Untitled cortava o nome do nível.

## Perfil (`ProfilePanel`)

Componente de `components/administration/`, usado no detalhe do usuário (o próprio perfil tem a página acima, item fixo da sidebar). Regras de acesso em [docs/back/administration/profile.md](../back/administration/profile.md); o front segue o `abilities` que vem na resposta:

- Foto grande no topo; fotos também aparecem nos avatares da sidebar, da lista de usuários, do detalhe e do organograma
- **Enviar/Trocar foto** e **Editar perfil** com `abilities.canUpdate`. A foto é conferida no navegador (JPG, PNG ou WebP, até 5 MB) antes do envio; o backend comprime
- Nascimento e objetivo só aparecem (e só entram no formulário) para a própria pessoa ou com `canViewPrivate`
- **Nota técnica** em bloco à parte, só com `canViewPrivate`; o botão **Avaliar** aparece com `canEvaluate` e abre o `TechnicalScoreModal` (0 a 10, vírgula ou ponto, vazio remove)
- O `ProfileFormModal` usa selects para curso, disponibilidade e maturidade, checkboxes para carreira e atributos e tags livres para tecnologias e áreas de interesse, com sugestões vindas do catálogo do backend
- Toda alteração invalida perfil, usuários e organograma (por causa da foto) e, quando é o próprio perfil, chama `revalidate()` do `user_store`

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

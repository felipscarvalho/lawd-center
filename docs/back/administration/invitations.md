# Cadastro por convite e envio de e-mails

## Por que convite

Antes, a gestão cadastrava nome, e-mail e senha e precisava repassar a senha para a pessoa. Agora a gestão informa **só o e-mail**: a pessoa recebe um e-mail com um link, informa o nome, cria a própria senha e já entra no sistema. A senha nunca passa por outra pessoa e o nome fica do jeito que a própria pessoa escreve.

## Fluxo

1. `POST /users` (`user.create`) com `{ email }` cria o usuário **pendente**: sem nome e sem senha (`full_name` e `password` passaram a aceitar `NULL`)
2. O back gera um token de convite e envia o e-mail com o link `FRONT_URL/invitation/<token>`
3. A página pública do convite chama `GET /auth/invitations/:token` (devolve `email` e o `fullName`, se a gestão já tiver preenchido) e depois `POST /auth/invitations/:token/accept` com `fullName` e `password`
4. O aceite grava nome e senha, apaga os tokens de convite da pessoa e devolve a sessão (`{ token, user }`, como o login): a pessoa cai direto na área logada

| Método | Rota | Acesso |
|---|---|---|
| POST | `/api/v1/administration/users` (`email`) | `user.create`; 201 com o usuário pendente |
| POST | `/api/v1/administration/users/:id/invitation` | `user.create`; reenvia o convite |
| GET | `/api/v1/administration/auth/invitations/:token` | pública |
| POST | `/api/v1/administration/auth/invitations/:token/accept` (`fullName`, `password`) | pública, com limite por IP |

## Usuário pendente

- `isPending` no transformer (`password` nulo). O front mostra "Convite pendente" e usa o e-mail no lugar do nome enquanto ele não existe
- **Não faz login**: o model sobrescreve `verifyPassword` para devolver falso sem senha (o mixin do auth lançaria erro); o login responde o mesmo 400 de senha errada e calcula um hash mesmo assim, para o tempo de resposta não denunciar o caso
- A gestão **não define a senha** de quem está pendente (`PUT /users/:id` com `password` devolve 422 `E_USER_PENDING` no campo `password`): quem cria a senha é a pessoa, pelo link. A gestão pode corrigir o e-mail e reenviar
- Pode receber cargo antes de aceitar; os cargos valem assim que ela entrar

## Tokens de convite

- Gerados pelo mesmo `DbAccessTokensProvider` do `@adonisjs/auth` usado no login (`User.invitationTokens`), numa tabela própria (`user_invitation_tokens`, mesmo formato de `auth_access_tokens`). Só o hash fica no banco; o valor só existe no e-mail
- Prefixo `inv_`, validade de **7 dias** (`invitationExpiresInDays` em `models/administration/user.ts`)
- Link inválido, expirado, já usado, substituído por um mais novo ou de usuário desativado: 404 `E_INVALID_INVITATION`, com a mesma mensagem para todos os casos
- **Reenvio** gera um token novo e só depois que o e-mail sai apaga os anteriores (uma falha no envio não derruba o link que a pessoa já tem). Não reenvia para quem já criou a senha (`E_INVITATION_ALREADY_ACCEPTED`) nem para desativado (`E_USER_INACTIVE`)
- O aceite é rota pública que grava dados, então tem limite de 10 tentativas por IP a cada 15 minutos (`throttleInvitationAcceptance` em `start/limiter.ts`); o token já é longo demais para ser adivinhado, o limite só corta abuso

## Envio de e-mails

- `@adonisjs/mail` com transporte **SMTP** (`config/mail.ts`). Em produção, o SMTP do Google: `smtp.gmail.com`, porta 465 (TLS direto) ou 587 (STARTTLS), usuário = conta Google e senha = **senha de app** (Conta Google > Segurança > Senhas de app, exige verificação em duas etapas). A senha normal da conta não funciona
- `MAIL_FROM_ADDRESS` precisa ser a própria conta (ou um alias verificado dela), senão o Gmail troca o remetente
- Em desenvolvimento, qualquer SMTP local sem login, como o Mailpit (`SMTP_HOST=localhost`, `SMTP_PORT=1025`, usuário e senha vazios)
- `MailService` (`services/administration/mail_service.ts`) é o ponto único de envio para qualquer módulo: envia na hora (quem chamou sabe se saiu) e converte falha do SMTP em `MailDeliveryException` (503 `E_MAIL_DELIVERY_FAILED`), com o erro no log. `frontUrl(path)` monta os links a partir de `FRONT_URL`
- **Cadastro só fica se o e-mail sair**: se o envio falha, o usuário recém-criado é apagado e a gestão vê o erro para tentar de novo, em vez de ficar um usuário pendente que nunca recebeu o link

### Visual dos e-mails

Cada e-mail é uma classe em `app/mails/<module>/` que estende `LawdMail` (`app/mails/administration/lawd_mail.ts`), passando só o conteúdo (título, parágrafos, botão, avisos e o motivo do envio). O layout segue a identidade da aplicação: fundo escuro violeta com os brilhos roxo, ciano e magenta, card com a faixa em degradê, MuseoModerno e botão em pílula roxo. A logo vai **embutida** no e-mail (`resources/mails/lawd_logo.png`, anexo inline por CID), para aparecer mesmo sem depender do front no ar.

O HTML usa tabelas e estilos inline, que é o que Gmail e Outlook renderizam. Degradês e a fonte aparecem onde o cliente suporta; nos outros, caem para cor sólida e Arial sem quebrar o layout. Todo texto passa por `escapeHtml` (`app/helpers/html.ts`). Sempre vai junto a versão em texto puro.

O texto do convite é direto, para quem já é da liga: avisa que a diretoria liberou o acesso, explica o link e a validade, sem propaganda.

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `FRONT_URL` | endereço público do front, base dos links nos e-mails |
| `MAIL_MAILER` | `smtp` |
| `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS` | remetente |
| `SMTP_HOST`, `SMTP_PORT` | servidor SMTP (465 liga TLS direto) |
| `SMTP_USERNAME`, `SMTP_PASSWORD` | login do SMTP; vazios = sem autenticação |

## Testes

`fakeMail` (em `tests/helpers/administration.ts`) troca o mailer por um falso em cada teste, e `sentInvitationToken(email)` lê o token do link no e-mail enviado. Os testes de `invitations.spec.ts` cobrem envio, aceite com sessão, link reutilizado, expirado e inválido, login de pendente, reenvio, bloqueio de senha pela gestão e o cadastro desfeito quando o SMTP falha.

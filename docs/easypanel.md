# Implantação no Easypanel

Como o Lawd Center roda em produção no Easypanel, a partir das imagens descritas em [Imagens Docker](deploy.md). O código vem do GitHub (branch `main`), e cada serviço é construído pelo `Dockerfile` da sua pasta.

## Visão geral

Um projeto com três serviços e **um domínio só**, `lawd.felipscarvalho.com.br`:

| Serviço | Tipo | Origem | Porta |
|---|---|---|---|
| Postgres | banco pronto do Easypanel | — | 5432 (só na rede interna) |
| Back | App, build por Dockerfile | GitHub, pasta `back` | a do log (ver abaixo) |
| Front | App, build por Dockerfile | GitHub, pasta `front` | 80 (a do log) |

### Porta: a do log, não a da imagem

As imagens usam `PORT=3333` (back) e `PORT=3000` (front), mas o Easypanel define a variável `PORT` nos serviços do tipo App (**80**), e ela vale no lugar da imagem: o front em produção sobe com `http://0.0.0.0:80` no log. A regra é usar no domínio **a porta que aparece no log do serviço**:

- Front: `- Network: http://0.0.0.0:80` → porta **80** no domínio
- Back: `started HTTP server on 0.0.0.0:<porta>` → essa porta no domínio (80 se o Easypanel também a definir ali; 3333 se não)

Para fixar uma porta, basta definir `PORT` nas variáveis do serviço (ex.: `PORT=3333` no back) e usar o mesmo valor no domínio. Porta do domínio diferente da do log dá **502 Bad Gateway**.

O proxy do Easypanel divide o domínio pelo caminho:

| Domínio | Path | Destino |
|---|---|---|
| `lawd.felipscarvalho.com.br` | `/api` | serviço do back, na porta do log, destino `/api` |
| `lawd.felipscarvalho.com.br` | `/` | serviço do front, porta 80, destino `/` |

No formulário de domínio do Easypanel: *Path* `/api` e *Destination path* `/api` no back (se o destino for `/`, o prefixo é removido e a API recebe `/v1/...`, dando 404); *Path* `/` e destino `/` no front. O proxy escolhe o caminho mais específico. Os dois domínios usam o mesmo host: crie primeiro o do back com `/api`, senão o Easypanel acusa que o host já está em uso.

Por isso **toda rota da API fica sob `/api/v1`**, inclusive os arquivos enviados (`/api/v1/uploads`) e os health checks (`/api/v1/health/*`): nada do back pode ficar na raiz, que é do front. O prefixo `/api` precisa chegar inteiro ao back (se houver opção de remover o prefixo do path, deixar desligada).

Com front e API na mesma origem, o navegador nem usa CORS. `CORS_ORIGIN` continua configurado (padrão `https://lawd.felipscarvalho.com.br`) para o caso de a API ir para outro domínio.

## Ordem do primeiro deploy

1. Criar o **Postgres** e anotar o host interno, usuário, senha e banco
2. Criar o **back**, com as variáveis e o bind mount abaixo, e fazer o deploy. Ao subir, o container roda as migrations e os seeders pendentes: cria as tabelas, as 7 diretorias e o administrador do `ADMIN_*`
3. Conferir `https://lawd.felipscarvalho.com.br/api/v1/health/live` → `{"status":"ok"}`
4. Criar o **front**, com `NEXT_PUBLIC_API_URL`, e fazer o deploy
5. Entrar com o e-mail e a senha do `ADMIN_*` e cadastrar o resto da liga

Nos deploys seguintes basta o push na `main` (com deploy automático) ou o botão de deploy: migrations e seeders novos rodam sozinhos, e os já executados não se repetem.

## Back

### Variáveis

```
APP_KEY=            # gerar com: node ace generate:key
APP_URL=https://lawd.felipscarvalho.com.br
LOG_LEVEL=info
SESSION_DRIVER=cookie
DRIVE_DISK=fs

DB_CONNECTION=postgres
DB_HOST=            # host interno do Postgres (ex.: main_lawd-center-postgresql)
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_DATABASE=

ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=

# Links dos e-mails e envio pelo SMTP do Google (senha de app da conta remetente)
FRONT_URL=https://lawd.felipscarvalho.com.br
MAIL_MAILER=smtp
MAIL_FROM_NAME=Lawd Center
MAIL_FROM_ADDRESS=        # a própria conta Google que envia
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME=            # a mesma conta Google
SMTP_PASSWORD=            # senha de app (Conta Google > Segurança > Senhas de app)

# Opcionais
CORS_ORIGIN=https://lawd.felipscarvalho.com.br
HEALTH_SECRET=      # se definido, /api/v1/health/ready exige o cabeçalho x-monitoring-secret
```

Cuidados:

- **Não definir `HOST`** (ou usar `HOST=0.0.0.0`). Com o `HOST=localhost` do `.env.example`, a API escuta só dentro do container, o proxy não a alcança e o domínio responde **502 Bad Gateway**. `NODE_ENV` e `TZ` já vêm da imagem; `PORT`, ver [Porta](#porta-a-do-log-não-a-da-imagem)
- **`APP_URL` completo e sem barra no fim**: é a base das URLs das fotos (`APP_URL` + `/api/v1/uploads/...`). Variáveis do Easypanel não são interpoladas, então nada de `http://${HOST}:${PORT}`
- **`DB_HOST`** é o nome interno do serviço Postgres na rede do Docker, que costuma ter `_` (ex.: `main_lawd-center-postgresql`). O back aceita esses nomes; eles só resolvem dentro do servidor
- **E-mail obrigatório**: sem as variáveis `FRONT_URL`, `MAIL_*` e `SMTP_*` a API não sobe. A senha do SMTP é a **senha de app** do Google, não a senha da conta. Se o envio falhar, o cadastro de usuário dá erro e não fica gravado (ver [convites](back/administration/invitations.md))
- **`ADMIN_*` desde o primeiro deploy**: o seeder do administrador roda uma vez só. Se as variáveis faltarem nessa hora, ele apenas avisa no log, fica registrado e não roda de novo, e o administrador precisa ser criado à mão

### Fotos de perfil: bind mount

As fotos ficam em `/app/storage` dentro do container. Sem persistir essa pasta, elas somem a cada deploy. Para elas aparecerem numa pasta do servidor, usar um **bind mount**:

1. No servidor, criar a pasta e entregá-la ao usuário do container (`node`, uid 1000):

   ```bash
   sudo mkdir -p /srv/lawd/storage
   sudo chown -R 1000:1000 /srv/lawd/storage
   ```

   Sem o `chown`, o envio de foto falha por falta de permissão: no bind mount a pasta do servidor é usada como está, sem herdar o dono da pasta da imagem

2. No serviço do back, em **Mounts → Add Bind Mount**:
   - **Host Path**: `/srv/lawd/storage`
   - **Mount Path**: `/app/storage` (literal: `/app` é a pasta de trabalho da imagem, não o nome do serviço)

3. Fazer um novo deploy

As fotos passam a aparecer em `/srv/lawd/storage/profiles/<id da pessoa>/...`. O backup dessa pasta fica por conta do servidor (rsync, restic, snapshot): o *Volume Backups* do Easypanel cobre volumes, não bind mounts.

Alternativa sem pasta visível: **Add Volume Mount** (nome qualquer, ex.: `storage`, mount path `/app/storage`). O Easypanel cria o volume, a permissão vem da imagem e o *Volume Backups* funciona.

### Healthcheck

- Healthcheck do container: `GET /api/v1/health/live`, na porta do log. Só confirma que o processo está no ar, sem tocar no banco, para o container não reiniciar quando o banco oscila
- Monitoramento externo (ex.: Uptime Kuma): `GET /api/v1/health/ready`, que confere banco, memória e disco (200 saudável, 503 com problema). Com `HEALTH_SECRET`, enviar o cabeçalho `x-monitoring-secret`

### Uma réplica só

Migrations e seeders rodam na subida do container. Com mais de uma réplica subindo junto, eles concorreriam; manter **uma réplica** do back.

## Front

- Variável **`NEXT_PUBLIC_API_URL=https://lawd.felipscarvalho.com.br/api/v1`**, que precisa existir **no build** (o Next a embute no código do navegador). Trocar o valor exige um novo build
- Para conferir: depois do deploy, na aba de rede do navegador, o login deve chamar `https://lawd.felipscarvalho.com.br/api/v1/administration/auth/login`. Se chamar `localhost:3333`, a variável não chegou ao build
- A imagem define `HOSTNAME=0.0.0.0` (escuta em todas as interfaces; não definir `HOSTNAME` no serviço). A porta é a do Easypanel, **80**, não a 3000 da imagem

## Problemas conhecidos

| Sintoma | Causa provável |
|---|---|
| 502 Bad Gateway no domínio | porta do domínio diferente da do log (o Easypanel usa 80), back escutando em `localhost` (`HOST` definido) ou container caindo ao subir (ver logs) |
| Container não sobe com `EnvValidationException` | variável faltando ou com formato inválido (ex.: `APP_URL` com `${...}`); o log diz qual |
| `EAI_AGAIN` / `ENOTFOUND` no log | `DB_HOST` errado ou serviços em projetos diferentes |
| `password authentication failed` | `DB_USER`, `DB_PASSWORD` ou `DB_DATABASE` não batem com o Postgres |
| Foto não carrega | `APP_URL` errado, bind mount sem `chown` ou rota `/api` sem o prefixo |
| Página inicial dá 404 da API | domínio `/` apontando para o back em vez do front |

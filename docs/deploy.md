# Imagens Docker

Passo a passo da produção atual: [Implantação no Easypanel](easypanel.md).

Cada projeto tem o próprio `Dockerfile` (`back/Dockerfile` e `front/Dockerfile`), construído a partir da pasta do projeto. Os dois usam Node 24 (`bookworm-slim`, por causa das bibliotecas nativas do `sharp`), estágios separados para dependências, build e imagem final, e rodam como o usuário `node`.

## Back (`back/Dockerfile`)

```bash
docker build -t lawd-back back
docker run --env-file back/.env.production -p 3333:3333 -v lawd-storage:/app/storage lawd-back
```

- O build roda `node ace build` e a imagem final leva só o código compilado (`build/`) e as dependências de produção (`npm ci --omit=dev`)
- **Variáveis de ambiente na execução**, nunca na imagem: `APP_KEY`, `APP_URL`, `DB_*`, `ADMIN_*` etc. (modelo em `back/.env.example`). A imagem já define `NODE_ENV=production`, `HOST=0.0.0.0`, `PORT=3333` e `TZ=UTC`
- **CORS**: fora do desenvolvimento, a API só aceita chamadas das origens em `CORS_ORIGIN` (separadas por vírgula, com `https://`). Sem a variável, vale o front de produção, `https://lawd.felipscarvalho.com.br`
- O `--env-file` do Docker não interpola valores: `APP_URL` precisa vir completo (ex.: `https://api.exemplo.com`), não `http://${HOST}:${PORT}` como no `.env` de desenvolvimento
- **Fotos de perfil** ficam em `/app/storage` (disco local do Drive): montar um volume ali, senão somem a cada nova versão. Para ver os arquivos numa pasta do servidor, usar um bind mount (no Easypanel, *Add Bind Mount*: host `/srv/lawd/storage`, mount `/app/storage`) e dar a pasta ao usuário do container: `sudo chown -R 1000:1000 /srv/lawd/storage`. O backup dessa pasta fica por conta do servidor
- **A cada deploy**, antes de subir o servidor, o container roda as migrations pendentes (`migration:run --force`) e os seeders ainda não executados naquele banco (`db:seed:pending`, ver [arquitetura do back](back/architecture.md#seeders-com-registro)). No primeiro deploy isso cria as tabelas, as diretorias e o administrador do `ADMIN_*`; nos seguintes, só o que for novo. Se algo falhar, o container não sobe e a versão anterior segue no ar
- **Healthcheck**: configure o do container (no Easypanel ou no orquestrador que usar) em `GET /api/v1/health/live`, porta 3333. Para monitorar banco, memória e disco, use `GET /api/v1/health/ready` (com `HEALTH_SECRET`, enviar o cabeçalho `x-monitoring-secret`)
- Feito para **uma réplica** da API: com várias subindo juntas, as migrations e os seeders concorreriam

## Front (`front/Dockerfile`)

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.exemplo.com/api/v1 -t lawd-front front
docker run -p 3000:3000 lawd-front
```

- A porta vem de `PORT` (3000 na imagem); plataformas que definem `PORT` sobrepõem esse valor (o Easypanel usa 80, ver [Easypanel](easypanel.md#porta-a-do-log-não-a-da-imagem))
- Usa a saída `standalone` do Next (`output: "standalone"` em `next.config.ts`): a imagem leva o servidor gerado, os arquivos estáticos e `public/`, sem o `node_modules` inteiro
- **`NEXT_PUBLIC_API_URL` é definida no build** (`--build-arg`), porque variáveis `NEXT_PUBLIC_*` são embutidas no código do navegador. Trocar a URL da API exige um build novo. Sem o argumento, aponta para `http://localhost:3333/api/v1`
- A API precisa aceitar a origem do front no CORS (`CORS_ORIGIN` do back)

## Verificado

As duas imagens foram construídas e executadas: a API subiu contra o PostgreSQL local, respondeu login e lista de projetos e enxergou as migrations; o front serviu o login com estilos e fontes. Tamanho aproximado: back 730 MB, front 420 MB.

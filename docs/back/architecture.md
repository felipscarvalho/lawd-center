# Arquitetura do backend

API em AdonisJS 7 (starter kit `api`), Lucid (ORM) sobre PostgreSQL e VineJS para validação.

## Camadas

Todo fluxo segue **Controller → Service → Model**, sem pular camadas.

| Camada | Pasta | Responsabilidade |
|---|---|---|
| Controller | `app/controllers/<module>/` | HTTP: valida a entrada (validator), extrai dados do contexto, chama o service e serializa a resposta (transformer). Não importa models nem monta queries |
| Service | `app/services/<module>/` | Regra de negócio e acesso ao banco. Recebe e devolve DTOs, nunca o `HttpContext`, para ser reutilizável por controllers, seeders, commands e outros services |
| Model | `app/models/<module>/` | Tabela Lucid: colunas (herdadas do schema gerado), relações, scopes |
| DTO | `app/dtos/<module>/` | Tipos de entrada e saída dos services (`#dtos/*`) |
| Validator | `app/validators/<module>/` | Schemas VineJS usados pelos controllers |
| Transformer | `app/transformers/<module>/` | Formato de saída da API |
| Exception | `app/exceptions/<module>/` | Falhas de negócio lançadas pelos services e convertidas em HTTP |

### Schema gerado

As colunas dos models não são escritas à mão: a cada `node ace migration:run` o Lucid lê o banco e gera `database/schema.ts`, com uma classe por tabela (`UserSchema`, `MembershipSchema`...). Os models estendem essas classes e só acrescentam relações, scopes e tipos mais específicos (ex.: `position: Position`). O arquivo é ignorado pelo ESLint e pelo Prettier.

## Módulos

A aplicação é dividida em módulos de domínio, **apenas por pasta**: cada tipo de artefato ganha uma subpasta com o nome do módulo (`app/services/administration/`, `database/migrations/administration/`...). O primeiro módulo é o `administration`, que concentra o que é comum a todos (usuários, autenticação, organização e permissões).

Regras de dependência:

1. Qualquer módulo pode depender de `administration`; `administration` não depende de nenhum outro.
2. Um módulo acessa dados de outro somente via service do módulo dono.
3. Migrations e seeders são registrados por pasta em `config/database.ts`, em ordem de dependência, com `administration` primeiro. O Lucid ordena pelo caminho do arquivo, então pastas soltas rodariam em ordem alfabética de módulo.

## Rotas

`start/routes.ts` só importa os arquivos de cada módulo (`start/routes/<module>.ts`). Cada módulo declara um grupo com prefixo `/api/v1/<module>` e nome `<module>`. Os controllers são referenciados pelo índice gerado (`controllers.administration.Users`). O matcher numérico do parâmetro `:id` é declarado uma vez no grupo do módulo (`.where('id', router.matchers.number())`), valendo para todas as rotas dele.

### Health checks

Rotas de infraestrutura, públicas e fora dos módulos, em `start/routes/health.ts` (o `GET /` do starter foi removido: toda a API fica sob `/api/v1`):

| Rota | Para quê |
|---|---|
| `GET /api/v1/health/live` | o processo está no ar (`{ status: "ok" }`); não toca no banco, para o orquestrador não reiniciar a API quando o banco oscila. É o healthcheck do container |
| `GET /api/v1/health/ready` | módulo de health checks do Adonis (`start/health.ts`): conexão com o banco, memória e disco. 200 quando saudável (avisos não derrubam), 503 quando não. Para monitoramento externo |

O relatório do `ready` mostra detalhes internos: com `HEALTH_SECRET` definida, ele exige o cabeçalho `x-monitoring-secret` com esse valor (401 sem ele).

## Respostas e erros

- Sucesso: `{ "data": ... }` (serializer do `providers/api_provider.ts`)
- Erros: `{ "errors": [{ "message": "...", "code": "E_..." }] }`
  - `401` sem autenticação, `403` sem permissão (`E_FORBIDDEN`), `404` registro inexistente
  - `422` validação (VineJS) ou regra de negócio (`BusinessRuleException`, com código específico da regra)

## Banco e ambiente

- PostgreSQL, conexão `postgres` configurada pelas variáveis `DB_*` (validadas em `start/env.ts`; modelo em `.env.example`)
- Testes (Japa) usam um banco próprio, `lawd_test` (`DB_DATABASE` em `.env.test`, que sobrescreve o `.env`), migrado no início da execução (`tests/bootstrap.ts`) e com cada teste dentro de uma transação desfeita ao final (`testUtils.db().withGlobalTransaction()`). Motivo: com o banco de desenvolvimento, dados criados nele (ex.: cargos únicos ocupados) quebravam os testes. Criar uma vez: `CREATE DATABASE lawd_test`. O `data` das respostas é lido com `responseData<T>(response)` (`tests/helpers/http.ts`), em vez de converter o corpo à mão em cada teste

## Comandos

| Comando | Uso |
|---|---|
| `node ace migration:run` | aplica migrations e regenera `database/schema.ts` |
| `node ace db:seed:pending` | roda só os seeders ainda não executados neste banco e registra cada um (usado a cada deploy) |
| `node ace db:seed` | roda todos os seeders de novo, sem olhar o registro: diretorias e primeiro administrador |
| `node ace test` | testes unitários e funcionais |
| `npm run lint` / `npm run typecheck` | qualidade de código |

## Seeders com registro

O `db:seed` do Lucid roda todos os seeders sempre, sem histórico. Para rodar seeders a cada deploy sem repetir o que já foi feito, eles ganharam um registro como o das migrations:

- Tabela `adonis_seeders` (`name`, `ran_at`), criada por uma migration do `administration`
- `node ace db:seed:pending` (`commands/db_seed_pending.ts` → `SeederRegistryService`): lê os seeders das pastas de `seeders.paths`, na mesma ordem do `db:seed`, roda os que não estão no registro e registra cada um logo depois de terminar. Para no primeiro que falhar (sem registrá-lo, então ele roda de novo no próximo deploy)
- Seeders restritos a outro ambiente (`static environment`, ex.: `['development']`) são ignorados **sem registro**, para poderem rodar num ambiente onde valham
- Consequência, como nas migrations: **seeder já rodado não roda de novo**. Para mudar ou acrescentar dados depois, cria-se um seeder novo, sem editar o antigo
- Mesmo assim, os seeders de produção só criam o que falta (diretorias por chave, administrador só se o e-mail não existir), para quem rodar `db:seed` à mão não desfazer mudanças feitas pela tela (nome de diretoria trocado, presidência que mudou de mãos)

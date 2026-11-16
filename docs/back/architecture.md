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

## Respostas e erros

- Sucesso: `{ "data": ... }` (serializer do `providers/api_provider.ts`)
- Erros: `{ "errors": [{ "message": "...", "code": "E_..." }] }`
  - `401` sem autenticação, `403` sem permissão (`E_FORBIDDEN`), `404` registro inexistente
  - `422` validação (VineJS) ou regra de negócio (`BusinessRuleException`, com código específico da regra)

## Banco e ambiente

- PostgreSQL, conexão `postgres` configurada pelas variáveis `DB_*` (validadas em `start/env.ts`; modelo em `.env.example`)
- Testes (Japa) usam o mesmo banco do `.env`, com cada teste dentro de uma transação desfeita ao final (`testUtils.db().withGlobalTransaction()`); recomenda-se apontar `.env.test` para um banco separado. O `data` das respostas é lido com `responseData<T>(response)` (`tests/helpers/http.ts`), em vez de converter o corpo à mão em cada teste

## Comandos

| Comando | Uso |
|---|---|
| `node ace migration:run` | aplica migrations e regenera `database/schema.ts` |
| `node ace db:seed` | cadastra as diretorias e o primeiro administrador |
| `node ace test` | testes unitários e funcionais |
| `npm run lint` / `npm run typecheck` | qualidade de código |

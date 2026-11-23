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
- Testes (Japa) usam um banco próprio, `lawd_test` (`DB_DATABASE` em `.env.test`, que sobrescreve o `.env`), migrado no início da execução (`tests/bootstrap.ts`) e com cada teste dentro de uma transação desfeita ao final (`testUtils.db().withGlobalTransaction()`). Motivo: com o banco de desenvolvimento, dados como os do seeder de demonstração (cargos únicos ocupados) quebravam os testes. Criar uma vez: `CREATE DATABASE lawd_test`. O `data` das respostas é lido com `responseData<T>(response)` (`tests/helpers/http.ts`), em vez de converter o corpo à mão em cada teste

## Comandos

| Comando | Uso |
|---|---|
| `node ace migration:run` | aplica migrations e regenera `database/schema.ts` |
| `node ace db:seed` | cadastra as diretorias e o primeiro administrador; em desenvolvimento, também as pessoas de demonstração |
| `node ace db:seed --files=./database/seeders/administration/3_demo_members_seeder.ts` | só as pessoas de demonstração |
| `node ace db:seed --files=./database/seeders/projects/1_demo_projects_seeder.ts` | só os projetos de demonstração (depois das pessoas) |
| `node ace test` | testes unitários e funcionais |
| `npm run lint` / `npm run typecheck` | qualidade de código |

## Dados de demonstração

O seeder `3_demo_members_seeder.ts` popula o banco de desenvolvimento para testar as telas com a liga "cheia": vice-presidente e secretário-geral no CORP (se os cargos estiverem livres) e, em cada diretoria comum, um diretor (se não houver) e 4 membros efetivos. Cada pessoa tem o perfil todo preenchido (curso, entrada, matrícula, disponibilidade, maturidade, carreira, atributos, tecnologias, áreas de interesse e objetivo) e uma nota técnica dada pelo primeiro administrador.

- Só roda com `NODE_ENV=development` (`static environment`), nunca em produção
- Usa os services, como os demais seeders, então passa pelas mesmas regras (cargos únicos, limite de 3 escolhas, catálogos)
- Os dados são variados, mas iguais a cada execução, e o seeder é idempotente: e-mails que já existem são pulados
- E-mails `nome.sobrenome@demo.lawd` e senha `lawd-demo-123`, para entrar como qualquer pessoa (ex.: um diretor) e ver a tela com as permissões dela
- Para remover: apagar os usuários `@demo.lawd` (vínculos, perfis, participações em projetos e interesses saem junto, por cascata)

O seeder `projects/1_demo_projects_seeder.ts` cria em seguida 7 projetos com equipes e interessados formados por essas pessoas (ver [projetos](projects/projects.md)).

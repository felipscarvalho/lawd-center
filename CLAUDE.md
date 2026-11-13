# Lawd Center

Monorepo com dois projetos e um único repositório git (raiz):

- `back/`: API em AdonisJS 7 (starter kit `api`, Lucid, VineJS)
- `front/`: aplicação web em Next.js 16 (App Router, TypeScript, Tailwind)

Gerenciador de pacotes: npm.

## Convenções gerais

- **Idioma do código: inglês.** Nomes de variáveis, funções, classes, arquivos, pastas, tabelas, colunas, rotas e chaves de API sempre em inglês (ex.: `getUser`, `users_controller.ts`). A única exceção são os comentários, que ficam em português
- Funções e variáveis em camelCase (`getUser`), classes e componentes em PascalCase (`UserCard`)

---

# Arquitetura do backend (`back/`)

## 1. Camadas

Todo fluxo segue **Controller → Service → Model**, sem exceção e sem pular camadas.

### Controller (`app/controllers/<module>/`)

Responsável exclusivamente pela camada HTTP:

- Recebe o `HttpContext` e valida a entrada com o validator do módulo (`request.validateUsing`)
- Extrai dados do contexto (params, usuário autenticado, etc.) e repassa ao service como DTO
- Converte o retorno do service em resposta (transformer / `ctx.serialize`) e define o status HTTP
- **Proibido**: importar models, montar queries, conter regra de negócio ou chamar outro controller

### Service (`app/services/<module>/`)

Responsável por toda regra de negócio e orquestração:

- Única camada que acessa models e o banco (queries, transações)
- **Não recebe `HttpContext`**: entradas e saídas são DTOs, para que o service seja reutilizável por controllers, commands, jobs, listeners e outros services
- Instanciado via container de IoC (`@inject()`), com dependências injetadas no construtor
- Pode chamar outros services (inclusive de outros módulos, ver seção 4); nunca chama controllers
- Falhas de negócio são lançadas como exceptions (`app/exceptions/<module>/`) e convertidas em HTTP pelo handler global (`app/exceptions/handler.ts`)
- Antes de criar um método novo, verificar se já existe service que resolve o caso. Lógica repetida em dois lugares deve ser extraída para um service

### Model (`app/models/<module>/`)

Representação Lucid da tabela:

- Colunas, relacionamentos, hooks, scopes e computed properties
- Sem regra de negócio que envolva múltiplas entidades ou fluxos (isso é service)

### DTOs (`app/dtos/<module>/`)

Contrato de dados entre camadas:

- Tipos/interfaces TypeScript que definem a entrada e a saída dos services
- Independentes de HTTP: não referenciam `HttpContext`, request ou validators
- O validator do controller deve produzir um objeto compatível com o DTO de entrada do service (o TypeScript garante isso na chamada)
- Import via alias `#dtos/*` (registrar em `imports` do `back/package.json` ao criar a pasta)

### Camadas de apoio

- `app/validators/<module>/`: schemas VineJS, usados apenas por controllers
- `app/transformers/<module>/`: formato de saída da API, usados apenas por controllers

## 2. Módulos

A aplicação é dividida em módulos de domínio. A divisão é **apenas por pasta**: cada tipo de artefato ganha uma subpasta com o nome do módulo. Não há estrutura extra por módulo (sem pacotes, providers ou configs próprios).

```
app/controllers/<module>/
app/services/<module>/
app/models/<module>/
app/dtos/<module>/
app/validators/<module>/
app/transformers/<module>/
app/exceptions/<module>/
database/migrations/<module>/
start/routes/<module>.ts
tests/functional/<module>/
tests/unit/<module>/
```

- Nome do módulo: `snake_case`, em inglês (ex.: `administration`)
- Imports seguem os aliases existentes com a subpasta: `#services/administration/xxx_service`
- No índice gerado, controllers ficam agrupados por módulo: `controllers.administration.Xxx`
- Generators sempre com o prefixo do módulo: `node ace make:controller <module>/<nome>` (idem `make:service`, `make:model`, `make:validator`, `make:transformer`, `make:test`). Migrations: `node ace make:migration <nome> --folder=database/migrations/<module>`

### Módulo `administration`

Primeiro módulo da aplicação. Contém tudo que é **comum a todos os módulos** (ex.: usuários, autenticação, permissões, cadastros compartilhados). Critério: se mais de um módulo precisa e não pertence ao domínio de nenhum deles especificamente, vai para `administration`.

Módulos novos são criados conforme a aplicação cresce, seguindo a mesma estrutura.

## 3. Rotas

- Cada módulo tem seu arquivo `start/routes/<module>.ts`, importado por `start/routes.ts` (que não define rotas de módulo, só importa os arquivos)
- Cada arquivo de módulo declara um único grupo com prefixo e nome do módulo:

```ts
router
  .group(() => {
    // rotas do módulo
  })
  .prefix('/api/v1/<module>')
  .as('<module>')
```

- Middlewares nomeados continuam centralizados em `start/kernel.ts`

## 4. Regras de dependência entre módulos

1. Qualquer módulo pode depender de `administration`.
2. `administration` não depende de nenhum outro módulo.
3. Um módulo acessa dados de outro **somente via service** do módulo dono, nunca importando o model alheio diretamente. Dependências circulares entre módulos são proibidas.
4. Migrations: cada pasta de módulo é registrada explicitamente em `config/database.ts` (`migrations.paths`), em ordem de dependência, com `administration` primeiro. Uma migration só pode referenciar (FK) tabelas de módulos registrados antes. Motivo: o Lucid ordena migrations pelo caminho relativo do arquivo, então pastas soltas em `database/migrations` rodariam em ordem alfabética de módulo, não cronológica.

---

# Arquitetura do frontend (`front/`)

## 1. Stack

- **UI base**: Untitled UI React (React Aria + Tailwind CSS 4). Componentes adicionados via CLI (`npx untitledui@latest add <componente>`), que copia o código para o projeto
- **HTTP**: axios, encapsulado em um client único
- **Dados do servidor**: TanStack Query (cache, revalidação, mutations)
- **Estado global do cliente**: Zustand
- **Formulários**: react-hook-form
- **Validação**: Zod (integrado ao react-hook-form via `zodResolver` de `@hookform/resolvers`)

## 2. Camada de API

Fluxo: **Componente → Hook (TanStack Query) → Service → API client → backend**. Componentes e stores nunca chamam axios diretamente, e componentes não chamam services diretamente para buscar dados (sempre via hook).

### API client (`lib/api.ts`)

Instância única de axios, configurada uma vez:

- `baseURL` vinda de `NEXT_PUBLIC_API_URL` (aponta para `/api/v1` do back)
- Interceptors de request (ex.: token de autenticação) e de response (normalização de erros em um formato único)
- É o único arquivo do front que importa `axios`

### Services (`services/<module>/`)

Funções tipadas que representam cada endpoint, reutilizadas por toda a aplicação:

- Uma função por operação: `getUser(id)` → `GET /<module>/users/:id`
- Usam exclusivamente o API client
- Retornam dados já tipados (desembrulhando o `data` da resposta do back)
- Módulos espelham os módulos do backend

### Hooks de dados (`hooks/<module>/`)

Camada fina de TanStack Query sobre os services; é por ela que componentes consomem dados do backend:

- Leitura com `useQuery`, escrita com `useMutation`. `queryFn`/`mutationFn` sempre chamam um service
- Um arquivo por recurso: `hooks/<module>/use_users.ts`, exportando hooks como `useUsers()`, `useUser(id)`, `useCreateUser()`
- Query keys centralizadas por recurso (ex.: `userKeys.all`, `userKeys.detail(id)`), nunca escritas como literal solto nos componentes
- Toda mutation invalida (`invalidateQueries`) as keys afetadas no `onSuccess`
- Cache apenas em memória, com as opções padrão; ajustes de `staleTime`, persistência ou prefetch no servidor só quando houver necessidade concreta
- `QueryClientProvider` configurado uma vez no layout raiz

### Tipos (`types/<module>/`)

Tipos das respostas e payloads da API, espelhando os DTOs/transformers do backend.

## 3. Estado global do cliente (`stores/`)

- Zustand apenas para estado **do próprio front compartilhado entre páginas/componentes** (ex.: sessão do usuário, preferências, UI global)
- Dados vindos do backend ficam no cache do TanStack Query, nunca copiados para stores
- Estado local de um componente fica em `useState`; não criar store para estado usado em um só lugar
- Um store por responsabilidade: `stores/<name>_store.ts`, exportando o hook `use<Name>Store`

## 4. Componentes

### Globais (`components/`)

- Componentes do Untitled UI ficam nas pastas criadas pelo CLI dentro de `components/` (ex.: `components/base/`, `components/application/`)
- Componentes próprios reutilizáveis em mais de uma página ficam em `components/`, fora das pastas do Untitled UI
- Antes de criar um componente, verificar se o Untitled UI já oferece um equivalente

### Locais (`app/<route>/_components/`)

- Componentes usados apenas por uma página ficam junto dela em `_components/`
- O prefixo `_` faz o Next.js tratar a pasta como privada (fora do roteamento)
- Componente local que passa a ser usado por outra página é promovido para `components/`

## 5. Formulários e validação

- Formulários com react-hook-form + Zod (`useForm({ resolver: zodResolver(schema) })`)
- Schemas compartilhados em `schemas/<module>/`; schema usado por um único formulário pode ficar junto da página
- Tipos derivados com `z.infer<typeof schema>`, sem duplicar tipo manualmente
- A validação do front é para UX; a validação de verdade continua no backend (VineJS)

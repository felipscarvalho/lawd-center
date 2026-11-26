# Arquitetura do frontend

Next.js 16 (App Router, `cacheComponents` ligado), TypeScript e Tailwind CSS 4, com componentes do Untitled UI adaptados à identidade visual da LAWD.

## Fluxo de dados

**Componente → Hook (TanStack Query) → Service → API client → backend**

| Camada | Pasta | Responsabilidade |
|---|---|---|
| API client | `lib/api.ts` | Única instância do axios: base URL (`NEXT_PUBLIC_API_URL`), envia o token, normaliza erros em `ApiError` (mensagem, status, código e erros por campo) e trata 401 |
| Services | `services/<module>/` | Uma função por endpoint (`getUsers`, `assignMembership`...), devolvendo dados tipados sem o envelope `data` |
| Hooks | `hooks/<module>/` | `useQuery`/`useMutation` sobre os services; query keys centralizadas por recurso (`userKeys`, `membershipKeys`...); mutations invalidam as keys afetadas |
| Tipos | `types/<module>/` | Espelham os transformers do backend |
| Schemas | `schemas/<module>/` | Zod para os formulários (react-hook-form + `zodResolver`) |

Erros de mutation passam por `handleApiError` (`lib/form_errors.ts`): erros de validação do backend vão para os campos do formulário; os demais viram toast.

Formulários sempre começam limpos. Nos modais, o componente exportado conta as aberturas com `useOpenSession` e usa a contagem como `key` do conteúdo: cada abertura monta um `useForm` novo com os valores iniciais em `defaultValues`. A versão anterior chamava `reset` num `useEffect` ao abrir, mas os campos controlados montavam antes do efeito e mantinham os valores do preenchimento anterior (ex.: a diretoria aparecia selecionada com o cargo desabilitado). Fechar não muda a contagem, então o formulário não pisca durante a animação de saída. Formulários de página que criam algo (ex.: troca de senha) chamam `reset` no `onSuccess`.

## Usuário autenticado (`stores/user_store.ts`)

Os dados do backend ficam no cache do TanStack Query, com uma exceção: o usuário logado, que é usado em quase toda tela (menus, permissões, nome no rodapé da sidebar). Ele fica num store Zustand persistido no `localStorage`:

| Campo / método | Descrição |
|---|---|
| `token`, `user`, `permissions` | sessão (persistidos) |
| `status`, `error` | situação da última revalidação (não persistidos) |
| `login(payload)` | autentica, guarda o token e revalida |
| `logout()` | revoga o token no backend e limpa a sessão |
| `revalidate()` | busca `/auth/me` de novo e atualiza usuário e permissões |
| `can(permission, directorateId?)` / `canAnywhere(permission)` | mesma regra de escopo do backend |

A revalidação acontece ao abrir a área logada e depois de ações que mudam cargos (atribuir/encerrar vínculo) ou o próprio cadastro. O hook `usePermissions()` expõe `can`/`canAnywhere` e re-renderiza quando as permissões mudam.

## Área logada (`app/(app)/`)

O route group `(app)` agrupa as páginas autenticadas sob o layout `AppShell`:

- **Só no navegador**: como a sessão fica no `localStorage`, o `AppShell` usa `use(browser())` dentro de `Suspense` (padrão do Next 16 para conteúdo que depende de APIs do navegador). No servidor é renderizado só o carregamento
- **Proteção**: sem token, redireciona para `/login`; um 401 em qualquer requisição limpa a sessão e volta ao login
- **Navegação**: sidebar do Untitled UI em seções com título, uma por módulo (hoje "Pessoal" e "Administração"), definidas em `navigation` no `AppShell`. Cada item pode exigir uma permissão (`canAnywhere`); item sem permissão aparece para todo usuário logado, e seção sem nenhum item visível some. As seções viram itens `divider` com `label`, que o `NavList` desenha como título (alteração autorizada no componente base; divider sem label continua sendo linha). Nome, troca de tema e "Sair" ficam no rodapé da sidebar (também no menu do celular)
- **Instant navigation**: o layout e cada página exportam `instant = false`. O Next 16 valida em desenvolvimento se a navegação mostra conteúdo imediatamente, o que uma área dependente do navegador não consegue fazer
- **Logout** usa `window.location.href` (recarga completa), porque com `cacheComponents` o Next mantém rotas visitadas montadas em segundo plano e o estado do usuário anterior ficaria na memória

## Visual

Componentes do Untitled UI em `components/base`, `components/application`, `components/foundations` e `components/shared-assets`, com as formas originais e as cores, transparências e glassmorphism do SimMAP (`styles/lawd-theme.css`). Modo claro/escuro com `next-themes` (padrão escuro). Esses componentes e estilos são congelados: mudanças só com autorização (ver `CLAUDE.md`).

## Peças reutilizáveis

Padrões que se repetiam pelas telas viraram componentes e hooks, para telas novas já nascerem iguais:

| Peça | Onde | Para quê |
|---|---|---|
| `apiGet`, `apiPost`, `apiPut`, `apiDelete` | `lib/api.ts` | services chamam o endpoint e recebem o `data` da resposta já tipado |
| `apiGetPage`, `Paginated`, `PaginationMeta` | `lib/api.ts` | listas paginadas: devolvem os itens (`data`) junto com a paginação (`metadata`) |
| `ListPagination` | `components/layout/list_pagination.tsx` | rodapé de paginação das tabelas, em português, montado sobre o `Pagination` base do Untitled UI (os prontos têm textos em inglês) |
| `useDebouncedValue` | `hooks/use_debounced_value.ts` | busca que vai ao backend só depois que a pessoa para de digitar |
| `pluralize` | `lib/format.ts` | quantidade com singular ou plural ("1 pessoa", "3 pessoas") |
| `UserSearchComboBox` | `components/administration/user_search_combobox.tsx` | escolher uma pessoa ativa buscando no backend (a lista de usuários é paginada) |
| `FormInput`, `FormSelect` | `components/forms/` | campo ligado ao react-hook-form (valor, validação e erro no lugar da dica), sem repetir o `Controller` |
| `useEditForm` | `hooks/use_edit_form.ts` | formulário de edição direta: carrega os dados salvos, recarrega quando mudam e oferece `discard` |
| `useOpenSession` | `hooks/use_open_session.ts` | formulário de modal remontado a cada abertura (começa limpo) |
| `Card`, `SplitCard` | `components/layout/card.tsx` | card de vidro padrão e card em duas colunas (Meu perfil, detalhe do usuário) |
| `Section`, `DetailField`, `DetailTags` | `components/layout/detail_section.tsx` | seções com divisória e campos só de leitura |
| `LoadingState`, `ErrorState`, `ListContent`, `ListToolbar` | `components/layout/` | estados de carregamento, erro e vazio; barra de filtros e busca das listas |
| `FormActions` | `components/layout/form_actions.tsx` | Descartar/Salvar das telas editáveis |
| `PersonLink`, `UserAvatar`, `avatarProps` | `components/administration/person_link.tsx` | pessoa com foto ou iniciais, com link para o detalhe |
| `ImageCropModal` | `components/overlays/image_crop_modal.tsx` | recortar uma imagem antes de usar: moldura com o fora escurecido, arrastar, zoom (controle deslizante `Slider` do Untitled UI, roda, pinça, teclado) e prévias nos tamanhos em que a imagem aparece; devolve o recorte como `File` (WebP, maior lado até 1024 px). Peças soltas: `ImageCropper`/`ImageCropPreview` em `components/media/image_cropper.tsx` e `cropImage` em `lib/image_crop.ts` |
| `EndMembershipModal`, `useCanEndMembership` | `components/administration/`, `hooks/administration/use_memberships.ts` | confirmar e autorizar o encerramento de vínculos (organograma e histórico) |

A busca que vinha na sidebar do Untitled UI foi removida (alteração autorizada no componente base), porque não havia o que buscar nela.

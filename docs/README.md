# Documentação do Lawd Center

Registro de como cada parte do sistema foi definida e por quê. Cada documento é escrito depois que a funcionalidade é aprovada e implementada.

- [`back/`](back/): API em AdonisJS (arquitetura, módulos, autenticação, permissões, regras de negócio)
- [`front/`](front/): aplicação web em Next.js (componentes, identidade visual, camada de dados, telas)

As regras curtas que os agentes de código precisam seguir ficam no `CLAUDE.md` da raiz; aqui fica a explicação completa das decisões.

## Deploy

- [Imagens Docker](deploy.md): como construir e rodar o back e o front em containers
- [Implantação no Easypanel](easypanel.md): serviços, domínio único com `/api`, variáveis, bind mount das fotos e problemas conhecidos

## Backend

- [Arquitetura](back/architecture.md): camadas, módulos, rotas, respostas e erros, banco e comandos
- Módulo `administration`
  - [Autenticação e usuários](back/administration/auth.md)
  - [Organização: diretorias, cargos e vínculos](back/administration/organization.md)
  - [Permissões](back/administration/permissions.md)
  - [Perfil do usuário](back/administration/profile.md): dados acadêmicos, interesses, foto e nota técnica
- Módulo `projects`
  - [Projetos](back/projects/projects.md): projetos, equipes com histórico, interessados, análise e radar de alocação
- Módulo `recruitment`
  - [Aviso do processo seletivo](back/recruitment/selection_subscribers.md): e-mails de quem pediu o aviso na página inicial (rota pública)

## Frontend

- [Arquitetura](front/architecture.md): fluxo de dados, usuário autenticado (`user_store`), área logada e visual
- [Página inicial](front/landing.md): landing com o logo em 3D (canvas) e o formulário de aviso do processo seletivo
- [Telas do módulo administration](front/administration.md): login, organograma, usuários, diretorias e perfil
- [Telas do módulo projects](front/projects.md): lista, detalhe com equipe e interessados, análise e radar

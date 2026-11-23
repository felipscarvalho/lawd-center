# Documentação do Lawd Center

Registro de como cada parte do sistema foi definida e por quê. Cada documento é escrito depois que a funcionalidade é aprovada e implementada.

- [`back/`](back/): API em AdonisJS (arquitetura, módulos, autenticação, permissões, regras de negócio)
- [`front/`](front/): aplicação web em Next.js (componentes, identidade visual, camada de dados, telas)

As regras curtas que os agentes de código precisam seguir ficam no `CLAUDE.md` da raiz; aqui fica a explicação completa das decisões.

## Backend

- [Arquitetura](back/architecture.md): camadas, módulos, rotas, respostas e erros, banco e comandos
- Módulo `administration`
  - [Autenticação e usuários](back/administration/auth.md)
  - [Organização: diretorias, cargos e vínculos](back/administration/organization.md)
  - [Permissões](back/administration/permissions.md)
  - [Perfil do usuário](back/administration/profile.md): dados acadêmicos, interesses, foto e nota técnica
- Módulo `projects`
  - [Projetos](back/projects/projects.md): projetos, equipes com histórico, interessados, análise e radar de alocação

## Frontend

- [Arquitetura](front/architecture.md): fluxo de dados, usuário autenticado (`user_store`), área logada e visual
- [Telas do módulo administration](front/administration.md): login, organograma, usuários, diretorias e perfil

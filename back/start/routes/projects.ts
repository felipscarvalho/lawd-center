/*
|--------------------------------------------------------------------------
| Rotas do módulo projects
|--------------------------------------------------------------------------
|
| Projetos, equipes, interessados e análise. A gestão pode ser só da própria
| diretoria (diretor) ou do próprio projeto (coordenador): o middleware `can`
| exige a permissão em algum escopo e os services conferem o projeto.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router
  .group(() => {
    // Projetos
    router
      .get('projects', [controllers.projects.Projects, 'index'])
      .as('projects.index')
      .use(middleware.can('projects.project.view'))
    router
      .get('projects/:id', [controllers.projects.Projects, 'show'])
      .as('projects.show')
      .use(middleware.can('projects.project.view'))
    router
      .post('projects', [controllers.projects.Projects, 'store'])
      .as('projects.store')
      .use(middleware.can('projects.project.manage'))
    router
      .put('projects/:id', [controllers.projects.Projects, 'update'])
      .as('projects.update')
      .use(middleware.can('projects.project.manage'))

    // Equipe: o coordenador gerencia a do próprio projeto sem ter a permissão, então o service confere
    router
      .get('projects/:id/members', [controllers.projects.ProjectMembers, 'index'])
      .as('projectMembers.index')
      .use(middleware.can('projects.project.view'))
    router
      .post('projects/:id/members', [controllers.projects.ProjectMembers, 'store'])
      .as('projectMembers.store')
    router
      .post('project-members/:id/end', [controllers.projects.ProjectMembers, 'end'])
      .as('projectMembers.end')
    router
      .get('users/:id/projects', [controllers.projects.ProjectMembers, 'forUser'])
      .as('projectMembers.forUser')
      .use(middleware.can('projects.project.view'))

    // Interesse: cada pessoa marca o próprio
    router
      .get('projects/:id/interests', [controllers.projects.ProjectInterests, 'index'])
      .as('projectInterests.index')
      .use(middleware.can('projects.project.view'))
    router
      .post('projects/:id/interest', [controllers.projects.ProjectInterests, 'store'])
      .as('projectInterests.store')
      .use(middleware.can('projects.project.view'))
    router
      .delete('projects/:id/interest', [controllers.projects.ProjectInterests, 'destroy'])
      .as('projectInterests.destroy')
      .use(middleware.can('projects.project.view'))

    // Análise
    router
      .get('analytics', [controllers.projects.ProjectAnalytics, 'summary'])
      .as('analytics.summary')
      .use(middleware.can('projects.project.view'))
    router
      .get('radar', [controllers.projects.ProjectAnalytics, 'radar'])
      .as('analytics.radar')
      .use(middleware.can('projects.project.manage'))
  })
  .use(middleware.auth())
  // Todo parâmetro :id do módulo é numérico
  .where('id', router.matchers.number())
  .prefix('/api/v1/projects')
  .as('projects')

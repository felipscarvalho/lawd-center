/*
|--------------------------------------------------------------------------
| Rotas do módulo administration
|--------------------------------------------------------------------------
|
| Autenticação, convites, usuários, diretorias e vínculos (cargos). Permissões globais
| são exigidas aqui pelo middleware `can`; permissões com escopo de diretoria
| são verificadas novamente nos services.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { throttleInvitationAcceptance } from '#start/limiter'

router
  .group(() => {
    // Autenticação
    router.post('auth/login', [controllers.administration.Auth, 'login']).as('auth.login')

    // Convite (público): quem recebeu o link por e-mail confere o convite e cria a senha
    router
      .get('auth/invitations/:token', [controllers.administration.Invitations, 'show'])
      .as('invitations.show')
    router
      .post('auth/invitations/:token/accept', [controllers.administration.Invitations, 'accept'])
      .as('invitations.accept')
      .use(throttleInvitationAcceptance)

    router
      .group(() => {
        router.post('auth/logout', [controllers.administration.Auth, 'logout']).as('auth.logout')
        router.get('auth/me', [controllers.administration.Auth, 'me']).as('auth.me')
        router
          .put('auth/password', [controllers.administration.Auth, 'changePassword'])
          .as('auth.changePassword')
      })
      .use(middleware.auth())

    router
      .group(() => {
        // Usuários
        router
          .get('users', [controllers.administration.Users, 'index'])
          .as('users.index')
          .use(middleware.can('administration.user.view'))
        router
          .get('users/:id', [controllers.administration.Users, 'show'])
          .as('users.show')
          .use(middleware.can('administration.user.view'))
        router
          .post('users', [controllers.administration.Users, 'store'])
          .as('users.store')
          .use(middleware.can('administration.user.create'))
        router
          .post('users/:id/invitation', [controllers.administration.Users, 'resendInvitation'])
          .as('users.resendInvitation')
          .use(middleware.can('administration.user.create'))
        router
          .put('users/:id', [controllers.administration.Users, 'update'])
          .as('users.update')
          .use(middleware.can('administration.user.update'))
        router
          .post('users/:id/deactivate', [controllers.administration.Users, 'deactivate'])
          .as('users.deactivate')
          .use(middleware.can('administration.user.deactivate'))

        // Diretorias
        router
          .get('directorates', [controllers.administration.Directorates, 'index'])
          .as('directorates.index')
          .use(middleware.can('administration.directorate.view'))
        router
          .post('directorates', [controllers.administration.Directorates, 'store'])
          .as('directorates.store')
          .use(middleware.can('administration.directorate.manage'))
        router
          .put('directorates/:id', [controllers.administration.Directorates, 'update'])
          .as('directorates.update')
          .use(middleware.can('administration.directorate.manage'))

        // Vínculos e organograma
        router
          .get('organization-chart', [controllers.administration.Memberships, 'organizationChart'])
          .as('organizationChart')
          .use(middleware.can('administration.membership.view'))
        router
          .get('users/:id/memberships', [controllers.administration.Memberships, 'history'])
          .as('memberships.history')
          .use(middleware.can('administration.membership.view'))
        // Perfis: a própria pessoa sempre vê e edita o seu (mesmo sem vínculo); o service confere o resto
        router
          .get('users/:id/profile', [controllers.administration.Profiles, 'show'])
          .as('profiles.show')
        router
          .put('users/:id/profile', [controllers.administration.Profiles, 'update'])
          .as('profiles.update')
        router
          .post('users/:id/profile/photo', [controllers.administration.Profiles, 'updatePhoto'])
          .as('profiles.updatePhoto')
        router
          .delete('users/:id/profile/photo', [controllers.administration.Profiles, 'removePhoto'])
          .as('profiles.removePhoto')
        router
          .put('users/:id/technical-score', [
            controllers.administration.Profiles,
            'updateTechnicalScore',
          ])
          .as('profiles.updateTechnicalScore')
          .use(middleware.can('administration.profile.evaluate'))
        router
          .get('technologies', [controllers.administration.ProfileCatalogs, 'technologies'])
          .as('profileCatalogs.technologies')
        router
          .get('interest-areas', [controllers.administration.ProfileCatalogs, 'interestAreas'])
          .as('profileCatalogs.interestAreas')

        // membership.manage pode ser só da própria diretoria (diretor); o service confere a diretoria do vínculo
        router
          .post('memberships', [controllers.administration.Memberships, 'store'])
          .as('memberships.store')
          .use(middleware.can('administration.membership.manage'))
        router
          .post('memberships/:id/end', [controllers.administration.Memberships, 'end'])
          .as('memberships.end')
          .use(middleware.can('administration.membership.manage'))
      })
      .use(middleware.auth())
  })
  // Todo parâmetro :id do módulo é numérico
  .where('id', router.matchers.number())
  .prefix('/api/v1/administration')
  .as('administration')

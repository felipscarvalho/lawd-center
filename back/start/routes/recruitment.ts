/*
|--------------------------------------------------------------------------
| Rotas do módulo recruitment
|--------------------------------------------------------------------------
|
| Processo seletivo. Por enquanto só a inscrição no aviso de abertura, feita
| pelo formulário da página inicial: rota pública, sem autenticação, com um
| limite de requisições por IP.
|
*/

import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { throttleSelectionSubscription } from '#start/limiter'

router
  .group(() => {
    router
      .post('selection-subscribers', [controllers.recruitment.SelectionSubscribers, 'store'])
      .as('selectionSubscribers.store')
      .use(throttleSelectionSubscription)
  })
  // Todo parâmetro :id do módulo é numérico
  .where('id', router.matchers.number())
  .prefix('/api/v1/recruitment')
  .as('recruitment')

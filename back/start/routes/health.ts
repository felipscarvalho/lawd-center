/*
|--------------------------------------------------------------------------
| Rotas de health check
|--------------------------------------------------------------------------
|
| Infraestrutura, fora dos módulos de domínio: /api/v1/health/live (processo no ar) e
| /api/v1/health/ready (banco, memória e disco). Públicas, sem autenticação.
|
*/

import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router
  .group(() => {
    router.get('live', [controllers.administration.HealthChecks, 'live']).as('live')
    router.get('ready', [controllers.administration.HealthChecks, 'ready']).as('ready')
  })
  .prefix('/api/v1/health')
  .as('health')

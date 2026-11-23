/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Apenas importa os arquivos de rotas de cada módulo (start/routes/<module>.ts).
|
*/

import router from '@adonisjs/core/services/router'
import '#start/routes/administration'
import '#start/routes/projects'

router.get('/', () => {
  return { hello: 'world' }
})

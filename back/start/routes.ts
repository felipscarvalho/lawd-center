/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Apenas importa os arquivos de rotas de cada módulo (start/routes/<module>.ts) e o de health check.
| Toda rota da API fica sob /api/v1, para não conflitar com o front.
|
*/

import '#start/routes/health'
import '#start/routes/administration'
import '#start/routes/projects'
import '#start/routes/recruitment'

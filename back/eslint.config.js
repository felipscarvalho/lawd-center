import { configApp } from '@adonisjs/eslint-config'

export default configApp({
  // Gerado automaticamente pelo Lucid a cada migration:run
  ignores: ['database/schema.ts'],
})

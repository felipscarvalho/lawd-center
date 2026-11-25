/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // CORS: origens do front aceitas fora do desenvolvimento, separadas por vírgula (com https://)
  CORS_ORIGIN: Env.schema.string.optional(),

  // Health check: segredo opcional exigido em /api/v1/health/ready (cabeçalho x-monitoring-secret)
  HEALTH_SECRET: Env.schema.string.optional(),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  // Database
  DB_CONNECTION: Env.schema.enum(['postgres'] as const),
  // Sem format 'host': nomes de serviço do Docker (ex.: projeto_servico) têm _ e não são hostnames válidos
  DB_HOST: Env.schema.string(),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  // Primeiro administrador, criado pelo seeder (opcional fora do seeder)
  ADMIN_NAME: Env.schema.string.optional(),
  ADMIN_EMAIL: Env.schema.string.optional({ format: 'email' }),
  ADMIN_PASSWORD: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['fs'] as const),

  // Front: endereço público usado nos links enviados por e-mail (ex.: convite para criar a senha)
  FRONT_URL: Env.schema.string({ format: 'url', tld: false }),

  // E-mail (SMTP). Produção: smtp.gmail.com, porta 465 ou 587, com a senha de app da conta Google
  MAIL_MAILER: Env.schema.enum(['smtp'] as const),
  MAIL_FROM_NAME: Env.schema.string(),
  MAIL_FROM_ADDRESS: Env.schema.string({ format: 'email' }),
  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.number(),
  SMTP_USERNAME: Env.schema.string.optional(),
  SMTP_PASSWORD: Env.schema.secret.optional(),
})

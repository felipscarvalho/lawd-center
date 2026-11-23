import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: env.get('DB_CONNECTION'),

  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },

      migrations: {
        naturalSort: true,
        /**
         * Uma pasta por módulo, em ordem de dependência (administration primeiro).
         * Uma migration só pode referenciar tabelas de módulos registrados antes.
         */
        paths: [
          'database/migrations/administration',
          'database/migrations/projects',
          'database/migrations/recruitment',
        ],
      },

      seeders: {
        paths: ['database/seeders/administration', 'database/seeders/projects'],
      },

      schemaGeneration: {
        enabled: true,
        rulesPaths: ['./database/schema_rules.js'],
      },

      debug: app.inDev,
    },
  },
})

export default dbConfig

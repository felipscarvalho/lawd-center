import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

export default {
  tables: {
    /**
     * Colunas que precisam de conversão (decimal devolvido como texto pelo Postgres, listas em jsonb)
     * são declaradas à mão no model Profile, com prepare/consume
     */
    profiles: {
      skipColumns: ['technical_score', 'career_paths', 'soft_skills'],
    },
  },
} satisfies SchemaRules

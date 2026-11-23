import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'project_members'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('project_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('projects')
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      // Valores de projectRoles (app/models/projects/project_member.ts)
      table.string('role', 20).notNullable()
      table.date('starts_at').notNullable()
      // Nulo enquanto a pessoa está na equipe
      table.date('ends_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['user_id', 'ends_at'])
      table.index(['project_id', 'ends_at'])
    })

    // Segunda barreira (além do ProjectTeamService): um coordenador ativo por projeto
    this.schema.raw(`
      CREATE UNIQUE INDEX project_members_unique_active_coordinator
      ON project_members (project_id)
      WHERE ends_at IS NULL AND role = 'coordinator'
    `)
    // E uma participação ativa por pessoa em cada projeto
    this.schema.raw(`
      CREATE UNIQUE INDEX project_members_unique_active_user
      ON project_members (project_id, user_id)
      WHERE ends_at IS NULL
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

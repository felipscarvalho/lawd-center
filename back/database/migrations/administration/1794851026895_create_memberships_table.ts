import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'memberships'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('directorate_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('directorates')
        .onDelete('RESTRICT')
      // Valores do enum Position (app/permissions/positions.ts)
      table.string('position', 50).notNullable()
      table.date('starts_at').notNullable()
      // Nulo enquanto o vínculo está ativo
      table.date('ends_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['user_id', 'ends_at'])
    })

    // Segunda barreira (além do MembershipService): cargos únicos só podem ter um vínculo ativo
    this.schema.raw(`
      CREATE UNIQUE INDEX memberships_unique_active_core_position
      ON memberships (position)
      WHERE ends_at IS NULL AND position IN ('president', 'vice_president', 'general_secretary')
    `)
    this.schema.raw(`
      CREATE UNIQUE INDEX memberships_unique_active_director
      ON memberships (directorate_id)
      WHERE ends_at IS NULL AND position = 'director'
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

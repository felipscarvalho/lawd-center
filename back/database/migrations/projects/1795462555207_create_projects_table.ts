import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      // Nome não é único: projetos diferentes podem ter o mesmo nome (ex.: edições)
      table.string('name', 255).notNullable()
      table.text('description').nullable()
      // Valores de projectStatuses e projectPriorities (app/models/projects/project.ts)
      table.string('status', 30).notNullable().defaultTo('not_started')
      // Nulo: sem prioridade definida
      table.string('priority', 20).nullable()
      table
        .integer('directorate_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('directorates')
        .onDelete('RESTRICT')
      table.date('starts_at').nullable()
      // Previsão de término
      table.date('expected_end_at').nullable()
      // Preenchido quando o projeto é finalizado
      table.date('ended_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['status'])
      table.index(['directorate_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

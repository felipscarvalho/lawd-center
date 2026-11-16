import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'directorates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      // Identificador estável usado pelo código (ex.: corp, projects, hr)
      table.string('key', 50).notNullable().unique()
      table.string('name').notNullable()
      // core: núcleo institucional (CORP); standard: diretorias
      table.enum('kind', ['core', 'standard']).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

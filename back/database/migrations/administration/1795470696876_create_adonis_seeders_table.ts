import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Registro dos seeders já executados neste banco, como o adonis_schema das migrations:
 * `node ace db:seed:pending` roda só os que ainda não estão aqui
 */
export default class extends BaseSchema {
  protected tableName = 'adonis_seeders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      // Caminho do seeder sem extensão (ex.: database/seeders/administration/1_directorate_seeder)
      table.string('name', 255).notNullable().unique()
      table.timestamp('ran_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

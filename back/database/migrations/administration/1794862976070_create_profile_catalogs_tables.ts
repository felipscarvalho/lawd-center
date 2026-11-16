import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Catálogos abertos do perfil (crescem com o uso) e as ligações com os usuários:
 * tecnologias e áreas de interesse. O nome é único sem diferenciar maiúsculas.
 */
export default class extends BaseSchema {
  async up() {
    for (const [catalog, pivot, foreignKey] of [
      ['technologies', 'user_technologies', 'technology_id'],
      ['interest_areas', 'user_interest_areas', 'interest_area_id'],
    ]) {
      this.schema.createTable(catalog, (table) => {
        table.increments('id').notNullable()
        table.string('name', 100).notNullable()
        table.timestamp('created_at').notNullable()
        table.timestamp('updated_at').nullable()
      })
      this.schema.raw(`CREATE UNIQUE INDEX ${catalog}_name_unique ON ${catalog} (lower(name))`)

      this.schema.createTable(pivot, (table) => {
        table
          .integer('user_id')
          .notNullable()
          .unsigned()
          .references('id')
          .inTable('users')
          .onDelete('CASCADE')
        table
          .integer(foreignKey)
          .notNullable()
          .unsigned()
          .references('id')
          .inTable(catalog)
          .onDelete('CASCADE')
        table.primary(['user_id', foreignKey])
      })
    }
  }

  async down() {
    this.schema.dropTable('user_interest_areas')
    this.schema.dropTable('interest_areas')
    this.schema.dropTable('user_technologies')
    this.schema.dropTable('technologies')
  }
}

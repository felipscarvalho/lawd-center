import { BaseSchema } from '@adonisjs/lucid/schema'

/** "Já me formei" saiu do perfil */
export default class extends BaseSchema {
  protected tableName = 'profiles'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('graduated')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('graduated').notNullable().defaultTo(false)
    })
  }
}

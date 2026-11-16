import { BaseSchema } from '@adonisjs/lucid/schema'

/** Matrícula na UFS: única entre os perfis, opcional */
export default class extends BaseSchema {
  protected tableName = 'profiles'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('registration_number', 20).nullable().unique()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('registration_number')
    })
  }
}

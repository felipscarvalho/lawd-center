import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Usuários passam a ser cadastrados só pelo e-mail: a pessoa recebe um convite e informa o nome e
 * a senha ao aceitar. Até lá (convite pendente), nome e senha ficam vazios.
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('full_name').nullable().alter()
      table.string('password').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('full_name').notNullable().alter()
      table.string('password').notNullable().alter()
    })
  }
}

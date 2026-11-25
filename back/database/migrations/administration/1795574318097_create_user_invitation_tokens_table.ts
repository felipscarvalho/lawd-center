import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Tokens dos convites enviados por e-mail para a pessoa criar a senha. Mesmo formato da tabela de
 * access tokens, porque são gerados e conferidos pelo mesmo provider do @adonisjs/auth (só o hash
 * do token fica no banco).
 */
export default class extends BaseSchema {
  protected tableName = 'user_invitation_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('tokenable_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.string('type').notNullable()
      table.string('name').nullable()
      table.string('hash').notNullable()
      table.text('abilities').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('last_used_at').nullable()
      table.timestamp('expires_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .unique()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.date('birth_date').nullable()
      // Valores dos enums em app/models/administration/profile.ts
      table.string('course', 50).nullable()
      // Período de entrada na UFS, no formato AAAA.S (ex.: 2022.1)
      table.string('university_entry_period', 6).nullable()
      table.boolean('graduated').notNullable().defaultTo(false)
      table.string('photo_path').nullable()
      table.string('weekly_availability', 50).nullable()
      table.string('maturity', 50).nullable()
      table.jsonb('career_paths').notNullable().defaultTo('[]')
      table.jsonb('soft_skills').notNullable().defaultTo('[]')
      table.text('goal').nullable()

      // Nota técnica: definida por avaliadores, com registro de quem e quando
      table.decimal('technical_score', 4, 2).nullable()
      table
        .integer('technical_score_updated_by')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('technical_score_updated_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

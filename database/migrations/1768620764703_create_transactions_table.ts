import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('client_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('clients')
        .onDelete('RESTRICT')
      table
        .integer('gateway_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('gateways')
        .onDelete('RESTRICT')
      table.string('external_id').nullable()
      table
        .enum('status', ['pending', 'approved', 'rejected', 'refunded', 'error'])
        .notNullable()
        .defaultTo('pending')
      table.integer('amount').notNullable().unsigned()
      table.string('card_last_numbers', 4).nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['client_id'], 'idx_transactions_client_id')
      table.index(['gateway_id'], 'idx_transactions_gateway_id')
      table.index(['status'], 'idx_transactions_status')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transaction_products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('transaction_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('transactions')
        .onDelete('CASCADE')
      table
        .integer('product_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('RESTRICT')
      table.integer('quantity').notNullable().unsigned().defaultTo(1)
      table.integer('price_at_time').notNullable().unsigned()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['transaction_id'], 'idx_tp_transaction_id')
      table.index(['product_id'], 'idx_tp_product_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

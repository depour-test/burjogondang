import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const config = sqliteTable('shop_config', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  revision: integer('revision').notNull().default(1),
})
export const orders = sqliteTable('shop_orders', {
  id: text('id').primaryKey(),
  lookup: text('lookup').notNull(),
  created: integer('created').notNull(),
  method: text('method').notNull(),
  state: text('state').notNull(),
  payment: text('payment').notNull(),
  mode: text('mode').notNull(),
  total: integer('total').notNull(),
  details: text('details').notNull(),
  qr: text('qr'),
  paymentReference: text('payment_reference'),
}, (table) => [index('shop_orders_created_idx').on(table.created), uniqueIndex('shop_orders_payment_reference_idx').on(table.paymentReference)])

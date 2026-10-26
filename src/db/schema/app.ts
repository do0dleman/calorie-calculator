import { numeric, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth'

export const mealSourceEnum = pgEnum('meal_source', ['manual', 'picture'])

export const meal = pgTable('meal', {
  id: text('id').primaryKey(),
  userId: text('id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  calories_kcal: numeric('calories_kcal', {
    precision: 10,
    scale: 2,
  }).notNull(),
  protein_g: numeric('protein_g', { precision: 10, scale: 2 }).notNull(),
  fat_g: numeric('fat_g', { precision: 10, scale: 2 }).notNull(),
  carbs_g: numeric('carbs_g', { precision: 10, scale: 2 }).notNull(),
  source: mealSourceEnum('source'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

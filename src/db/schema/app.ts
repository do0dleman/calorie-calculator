import {
  index,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import { user } from './auth'

export const mealSourceEnum = pgEnum('meal_source', ['manual', 'picture'])
export const chatRoleEnum = pgEnum('chat_role', ['user', 'assistant'])

export type StoredChatPart = Record<string, unknown>

export const meal = pgTable(
  'meal',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
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
    imageHash: text('image_hash'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('meal_userId_createdAt_idx').on(table.userId, table.createdAt),
  ],
)

export const chatThread = pgTable(
  'chat_thread',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [unique('chat_thread_userId_unique').on(table.userId)],
)

export const chatMessage = pgTable(
  'chat_message',
  {
    id: text('id').primaryKey(),
    threadId: text('thread_id')
      .references(() => chatThread.id, { onDelete: 'cascade' })
      .notNull(),
    role: chatRoleEnum('role').notNull(),
    parts: jsonb('parts').$type<Array<StoredChatPart>>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('chat_message_threadId_createdAt_idx').on(
      table.threadId,
      table.createdAt,
    ),
  ],
)

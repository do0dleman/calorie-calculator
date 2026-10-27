import '@tanstack/react-start/server-only'

import { toolDefinition } from '@tanstack/ai'
import { and, asc, eq, gte, lt } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { meal } from '#/db/schema/app'
import { mealFieldsSchema } from '#/modules/meal/meal.schema'
import { insertMeal } from '#/modules/meal/meal.store'

export type MealChatContext = {
  userId: string
  imageHash: string | null
  dayFrom: string
  dayTo: string
}

export const logMealDef = toolDefinition({
  name: 'logMeal',
  description:
    'Save a meal the user ate. Call this when you can estimate the food from a photo or description. Always create a new meal, even if the photo looks like one you have seen before. After calling, do not write a confirmation or list macros — the client renders a meal card.',
  inputSchema: mealFieldsSchema,
  outputSchema: mealFieldsSchema.extend({
    id: z.string(),
  }),
})

export const getTodaysMealsDef = toolDefinition({
  name: 'getTodaysMeals',
  description: 'List meals the user already logged for the current local day.',
  inputSchema: z.object({}),
  outputSchema: z.object({
    meals: z.array(
      mealFieldsSchema.extend({
        id: z.string(),
        createdAt: z.string(),
      }),
    ),
  }),
})

export const logMeal = logMealDef.server<MealChatContext>(
  async (fields, ctx) => {
    const context = ctx.context
    const source = context.imageHash ? 'picture' : 'manual'

    return insertMeal({
      userId: context.userId,
      fields,
      source,
      imageHash: context.imageHash,
    })
  },
)

export const getTodaysMeals = getTodaysMealsDef.server<MealChatContext>(
  async (_args, ctx) => {
    const context = ctx.context

    const rows = await db
      .select({
        id: meal.id,
        name: meal.name,
        calories: meal.calories_kcal,
        protein: meal.protein_g,
        fat: meal.fat_g,
        carbs: meal.carbs_g,
        createdAt: meal.createdAt,
      })
      .from(meal)
      .where(
        and(
          eq(meal.userId, context.userId),
          gte(meal.createdAt, new Date(context.dayFrom)),
          lt(meal.createdAt, new Date(context.dayTo)),
        ),
      )
      .orderBy(asc(meal.createdAt))

    return {
      meals: rows.map((row) => ({
        id: row.id,
        name: row.name,
        caloriesKcal: Number(row.calories),
        proteinG: Number(row.protein),
        fatG: Number(row.fat),
        carbsG: Number(row.carbs),
        createdAt: row.createdAt.toISOString(),
      })),
    }
  },
)

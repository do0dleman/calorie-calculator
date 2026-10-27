import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { meal } from '#/db/schema/app'
import { auth } from '#/lib/auth'

import { mealFieldsSchema } from './meal.schema'
import type { LoggedMeal } from './meal.schema'

export { mealFieldsSchema } from './meal.schema'
export type { LoggedMeal, MealFields } from './meal.schema'

export const createManualMeal = createServerFn({ method: 'POST' })
  .validator((input: unknown) => mealFieldsSchema.parse(input))
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      throw new Error('Unauthorized')
    }

    const id = crypto.randomUUID()

    await db.insert(meal).values({
      id,
      userId: session.user.id,
      name: data.name,
      calories_kcal: data.caloriesKcal.toString(),
      protein_g: data.proteinG.toString(),
      fat_g: data.fatG.toString(),
      carbs_g: data.carbsG.toString(),
      source: 'manual',
    })

    return { id, ...data } satisfies LoggedMeal
  })

const updateMealSchema = mealFieldsSchema.extend({
  id: z.string().min(1),
})

export const updateMeal = createServerFn({ method: 'POST' })
  .validator((input: unknown) => updateMealSchema.parse(input))
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      throw new Error('Unauthorized')
    }

    const updated = await db
      .update(meal)
      .set({
        name: data.name,
        calories_kcal: data.caloriesKcal.toString(),
        protein_g: data.proteinG.toString(),
        fat_g: data.fatG.toString(),
        carbs_g: data.carbsG.toString(),
      })
      .where(and(eq(meal.id, data.id), eq(meal.userId, session.user.id)))
      .returning({ id: meal.id })

    if (updated.length === 0) {
      throw new Error('Meal not found')
    }

    return {
      id: data.id,
      name: data.name,
      caloriesKcal: data.caloriesKcal,
      proteinG: data.proteinG,
      fatG: data.fatG,
      carbsG: data.carbsG,
    } satisfies LoggedMeal
  })

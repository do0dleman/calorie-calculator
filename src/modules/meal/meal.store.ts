import '@tanstack/react-start/server-only'

import { db } from '#/db'
import { meal } from '#/db/schema/app'

import type { LoggedMeal, MealFields } from './meal.schema'

export async function insertMeal(params: {
  userId: string
  fields: MealFields
  source: 'manual' | 'picture'
  imageHash?: string | null
}): Promise<LoggedMeal> {
  const id = crypto.randomUUID()

  await db.insert(meal).values({
    id,
    userId: params.userId,
    name: params.fields.name,
    calories_kcal: params.fields.caloriesKcal.toString(),
    protein_g: params.fields.proteinG.toString(),
    fat_g: params.fields.fatG.toString(),
    carbs_g: params.fields.carbsG.toString(),
    source: params.source,
    imageHash: params.imageHash ?? null,
  })

  return { id, ...params.fields }
}

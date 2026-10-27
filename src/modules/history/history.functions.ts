import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { desc, eq } from 'drizzle-orm'

import { db } from '#/db'
import { meal } from '#/db/schema/app'
import { auth } from '#/lib/auth'
import type { DailyMeal } from '#/modules/overview/types'

// All of the user's meals, newest first. Grouping into days happens in the
// browser, so day boundaries follow the user's timezone.
export const getMealHistory = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<DailyMeal>> => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      throw new Error('Unauthorized')
    }

    const meals = await db
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
      .where(eq(meal.userId, session.user.id))
      .orderBy(desc(meal.createdAt))

    // numeric columns arrive as strings from Postgres
    return meals.map((row) => ({
      ...row,
      calories: Number(row.calories),
      protein: Number(row.protein),
      fat: Number(row.fat),
      carbs: Number(row.carbs),
    }))
  },
)

export const mealHistoryQueryOptions = () =>
  queryOptions({
    queryKey: ['meal-history'],
    queryFn: () => getMealHistory(),
  })

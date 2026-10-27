import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { and, asc, count, eq, gte, lt, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { meal } from '#/db/schema/app'
import { auth } from '#/lib/auth'
import type { DailyMeal, DailyTotals, DayRange } from '#/modules/overview/types'
import { todayRange } from '#/modules/overview/utils'

// The client sends its local day bounds, so "today" follows the user's timezone
// instead of the server's (UTC on Vercel).
const dayRangeSchema = z.object({
  from: z.iso.datetime(),
  to: z.iso.datetime(),
}) satisfies z.ZodType<DayRange>

export const getDailyTotals = createServerFn({ method: 'GET' })
  .validator(dayRangeSchema)
  .handler(async ({ data }): Promise<DailyTotals> => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      throw new Error('Unauthorized')
    }

    const [totals] = await db
      .select({
        calories: sql<number>`coalesce(sum(${meal.calories_kcal}), 0)`.mapWith(
          Number,
        ),
        protein: sql<number>`coalesce(sum(${meal.protein_g}), 0)`.mapWith(
          Number,
        ),
        fat: sql<number>`coalesce(sum(${meal.fat_g}), 0)`.mapWith(Number),
        carbs: sql<number>`coalesce(sum(${meal.carbs_g}), 0)`.mapWith(Number),
        mealCount: count(),
      })
      .from(meal)
      .where(
        and(
          eq(meal.userId, session.user.id),
          gte(meal.createdAt, new Date(data.from)),
          lt(meal.createdAt, new Date(data.to)),
        ),
      )

    return totals
  })

export const dailyTotalsQueryOptions = (range: DayRange) =>
  queryOptions({
    queryKey: ['daily-totals', range.from, range.to],
    queryFn: () => getDailyTotals({ data: range }),
  })

export const getDailyMeals = createServerFn({ method: 'GET' })
  .validator(dayRangeSchema)
  .handler(async ({ data }): Promise<Array<DailyMeal>> => {
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
      .where(
        and(
          eq(meal.userId, session.user.id),
          gte(meal.createdAt, new Date(data.from)),
          lt(meal.createdAt, new Date(data.to)),
        ),
      )
      .orderBy(asc(meal.createdAt))

    // numeric columns arrive as strings from Postgres
    return meals.map((row) => ({
      ...row,
      calories: Number(row.calories),
      protein: Number(row.protein),
      fat: Number(row.fat),
      carbs: Number(row.carbs),
    }))
  })

export const dailyMealsQueryOptions = (range: DayRange) =>
  queryOptions({
    queryKey: ['daily-meals', range.from, range.to],
    queryFn: () => getDailyMeals({ data: range }),
  })

// Route loader: fetch both queries in parallel and hand the day range to the page.
export async function loadOverview(queryClient: QueryClient) {
  const range = todayRange()
  await Promise.all([
    queryClient.ensureQueryData(dailyTotalsQueryOptions(range)),
    queryClient.ensureQueryData(dailyMealsQueryOptions(range)),
  ])
  return { range }
}

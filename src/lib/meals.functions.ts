import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { and, count, eq, gte, lt, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '#/db'
import { meal } from '#/db/schema/app'
import { auth } from '#/lib/auth'

// The client sends its local day bounds, so "today" follows the user's timezone
// instead of the server's (UTC on Vercel).
const dayRangeSchema = z.object({
  from: z.iso.datetime(),
  to: z.iso.datetime(),
})

export type DayRange = z.infer<typeof dayRangeSchema>

export const getDailyTotals = createServerFn({ method: 'GET' })
  .validator(dayRangeSchema)
  .handler(async ({ data }) => {
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

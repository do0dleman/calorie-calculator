import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { z } from 'zod'

import { db } from '#/db'
import { meal } from '#/db/schema/app'
import { auth } from '#/lib/auth'

const amountSchema = z.number().nonnegative()

const manualMealSchema = z.object({
  name: z.string().trim().min(1),
  caloriesKcal: amountSchema,
  proteinG: amountSchema,
  fatG: amountSchema,
  carbsG: amountSchema,
})

export const createManualMeal = createServerFn({ method: 'POST' })
  .validator((input: unknown) => manualMealSchema.parse(input))
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

    return { id }
  })

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { chatMessage, chatThread, meal } from '#/db/schema/app'
import { auth } from '#/lib/auth'
import { storedLoggedMealMessage } from '#/modules/chat/common/stored_parts'
import type { StoredChatMessage } from '#/modules/chat/common/types'

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
    const logged = { id, ...data } satisfies LoggedMeal
    const message = storedLoggedMealMessage(logged)
    const thread = await ensureChatThread(session.user.id)

    await db.transaction(async (tx) => {
      await tx.insert(meal).values({
        id,
        userId: session.user.id,
        name: data.name,
        calories_kcal: data.caloriesKcal.toString(),
        protein_g: data.proteinG.toString(),
        fat_g: data.fatG.toString(),
        carbs_g: data.carbsG.toString(),
        source: 'manual',
      })

      await tx.insert(chatMessage).values({
        id: message.id,
        threadId: thread.id,
        role: message.role,
        parts: message.parts,
        createdAt: new Date(message.createdAt),
      })
    })

    return { meal: logged, message } satisfies {
      meal: LoggedMeal
      message: StoredChatMessage
    }
  })

async function ensureChatThread(userId: string) {
  const existing = await db
    .select()
    .from(chatThread)
    .where(eq(chatThread.userId, userId))
    .limit(1)

  if (existing[0]) return existing[0]

  const created = {
    id: crypto.randomUUID(),
    userId,
  }

  await db.insert(chatThread).values(created)
  return created
}

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

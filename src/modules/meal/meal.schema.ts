import { z } from 'zod'

const amountSchema = z.number().nonnegative()

export const mealFieldsSchema = z.object({
  name: z.string().trim().min(1),
  caloriesKcal: amountSchema,
  proteinG: amountSchema,
  fatG: amountSchema,
  carbsG: amountSchema,
})

export type MealFields = z.infer<typeof mealFieldsSchema>

export type LoggedMeal = MealFields & { id: string }

import type { DailyMeal } from '#/modules/overview/types'

export type MealDay = {
  key: string
  date: Date
  calories: number
  meals: Array<DailyMeal>
}

// Local calendar day as YYYY-MM-DD.
export function dayKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// Expects meals newest first. Days stay newest first; meals inside a day run in
// the order they were eaten.
export function groupMealsByDay(meals: Array<DailyMeal>): Array<MealDay> {
  const days: Array<MealDay> = []

  for (const meal of meals) {
    const key = dayKey(meal.createdAt)
    let day = days.at(-1)
    if (day?.key !== key) {
      day = { key, date: meal.createdAt, calories: 0, meals: [] }
      days.push(day)
    }
    day.meals.unshift(meal)
    day.calories += meal.calories
  }

  return days
}

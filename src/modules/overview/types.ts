export type Nutrient = 'calories' | 'protein' | 'fat' | 'carbs'

// Local day bounds as ISO strings, computed in the browser.
export type DayRange = { from: string; to: string }

export type DailyTotals = Record<Nutrient, number> & { mealCount: number }

export type DailyMeal = Record<Nutrient, number> & {
  id: string
  name: string
  createdAt: Date
}

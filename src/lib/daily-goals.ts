// Fixed daily goals until users can set their own in Settings.
// Values are the EU reference intakes for an average adult (Regulation (EU) No 1169/2011).
export const DAILY_GOALS = {
  calories: 2000,
  protein: 50,
  fat: 70,
  carbs: 260,
} as const

export type Nutrient = keyof typeof DAILY_GOALS

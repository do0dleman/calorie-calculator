export type TextPart = { type: 'text'; content: string }
export type ImagePart = { type: 'image'; url: string }

export type MealMessage = {
  id: string
  role: 'user'
  parts: Array<TextPart | ImagePart>
}

export type PendingImage = {
  file: File
  url: string
}

export type ManualMeal = {
  name: string
  caloriesKcal: number
  proteinG: number
  fatG: number
  carbsG: number
}

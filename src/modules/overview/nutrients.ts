import { m } from '#/paraglide/messages'

import type { Nutrient } from '#/modules/overview/types'

// One fixed color per nutrient, shared by every chart on the page.
// Categorical slots 1-4, validated for CVD separation on the light and dark card surfaces.
export const NUTRIENTS = [
  {
    key: 'calories',
    unit: 'kcal',
    label: m.overview_calories,
    color: { light: '#2a78d6', dark: '#3987e5' },
  },
  {
    key: 'protein',
    unit: 'g',
    label: m.overview_protein,
    color: { light: '#eb6834', dark: '#d95926' },
  },
  {
    key: 'fat',
    unit: 'g',
    label: m.overview_fat,
    color: { light: '#1baf7a', dark: '#199e70' },
  },
  {
    key: 'carbs',
    unit: 'g',
    label: m.overview_carbs,
    color: { light: '#eda100', dark: '#c98500' },
  },
] as const satisfies ReadonlyArray<{
  key: Nutrient
  unit: string
  label: () => string
  color: { light: string; dark: string }
}>

export type NutrientInfo = (typeof NUTRIENTS)[number]

// CSS color that follows the page theme (the theme toggle sets color-scheme).
export function nutrientColor(nutrient: NutrientInfo) {
  return `light-dark(${nutrient.color.light}, ${nutrient.color.dark})`
}

export const [CALORIES, ...MACROS] = NUTRIENTS

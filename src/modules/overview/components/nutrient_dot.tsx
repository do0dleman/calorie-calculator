import { nutrientColor } from '#/modules/overview/nutrients'
import type { NutrientInfo } from '#/modules/overview/nutrients'

// Small colored dot matching the nutrient's ring color on Overview.
export function NutrientDot({ nutrient }: { nutrient: NutrientInfo }) {
  return (
    <span
      aria-hidden
      className="size-2 shrink-0 rounded-full"
      style={{ backgroundColor: nutrientColor(nutrient) }}
    />
  )
}

import type { NutrientInfo } from '#/modules/overview/nutrients'
import { formatAmount, percentOf } from '#/modules/overview/utils'

import { GoalRing } from './goal_ring'

export function MacroRow({
  nutrient,
  eaten,
  goal,
}: {
  nutrient: NutrientInfo
  eaten: number
  goal: number
}) {
  return (
    <li className="flex items-center gap-3">
      <GoalRing
        nutrient={nutrient}
        eaten={eaten}
        goal={goal}
        className="size-10 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{nutrient.label()}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatAmount(eaten)} / {formatAmount(goal)} {nutrient.unit}
        </p>
      </div>
      <p className="shrink-0 text-sm font-semibold tabular-nums">
        {percentOf(eaten, goal)}%
      </p>
    </li>
  )
}

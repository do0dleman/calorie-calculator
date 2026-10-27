import { CALORIES } from '#/modules/overview/nutrients'
import { formatAmount } from '#/modules/overview/utils'
import { m } from '#/paraglide/messages'

import { GoalRing } from './goal_ring'

export function CaloriesSummary({
  eaten,
  goal,
}: {
  eaten: number
  goal: number
}) {
  const left = goal - eaten

  return (
    <div className="flex items-center gap-3 min-[360px]:gap-4 sm:gap-6">
      <GoalRing
        nutrient={CALORIES}
        eaten={eaten}
        goal={goal}
        className="size-24 min-[360px]:size-28 sm:size-32"
        showPercent
      />
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{CALORIES.label()}</p>
        <p className="mt-0.5 leading-tight">
          <span className="text-2xl font-semibold tabular-nums min-[360px]:text-3xl">
            {formatAmount(eaten)}
          </span>{' '}
          <span className="text-sm text-muted-foreground">{CALORIES.unit}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {m.overview_of_goal({
            goal: formatAmount(goal),
            unit: CALORIES.unit,
          })}
        </p>
        <p className="mt-0.5 text-sm font-medium">
          {left >= 0
            ? m.overview_left({
                amount: formatAmount(left),
                unit: CALORIES.unit,
              })
            : m.overview_over({
                amount: formatAmount(-left),
                unit: CALORIES.unit,
              })}
        </p>
      </div>
    </div>
  )
}

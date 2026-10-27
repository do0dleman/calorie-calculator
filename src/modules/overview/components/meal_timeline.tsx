import { MACROS } from '#/modules/overview/nutrients'
import type { DailyMeal } from '#/modules/overview/types'
import { formatAmount } from '#/modules/overview/utils'
import { getLocale } from '#/paraglide/runtime'

import { NutrientDot } from './nutrient_dot'

// Phone layout of a day's meals as a timeline. Shared by Overview and History.
export function MealTimeline({ meals }: { meals: Array<DailyMeal> }) {
  const timeFormat = new Intl.DateTimeFormat(getLocale(), {
    timeStyle: 'short',
  })

  return (
    <ol className="mt-4">
      {meals.map((meal) => (
        <li key={meal.id} className="group grid grid-cols-[3.75rem_1fr]">
          <time
            dateTime={meal.createdAt.toISOString()}
            className="pt-0.5 text-xs text-muted-foreground tabular-nums"
          >
            {timeFormat.format(meal.createdAt)}
          </time>
          <div className="relative border-l border-border pb-4 pl-4 group-last:pb-0">
            <span
              aria-hidden
              className="absolute top-1.5 -left-[5px] size-2.5 rounded-full border-2 border-card bg-muted-foreground"
            />
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 font-medium break-words">{meal.name}</p>
              <p className="shrink-0 whitespace-nowrap tabular-nums">
                <span className="font-semibold">
                  {formatAmount(meal.calories)}
                </span>{' '}
                <span className="text-xs text-muted-foreground">kcal</span>
              </p>
            </div>
            <p className="mt-1 flex flex-wrap gap-x-3.5 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
              {MACROS.map((macro) => (
                <span
                  key={macro.key}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <NutrientDot nutrient={macro} />
                  <span className="sr-only">{macro.label()}</span>
                  {formatAmount(meal[macro.key])} g
                </span>
              ))}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

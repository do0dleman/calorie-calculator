import { MACROS } from '#/modules/overview/nutrients'
import type { DailyMeal } from '#/modules/overview/types'
import { formatAmount } from '#/modules/overview/utils'
import { getLocale } from '#/paraglide/runtime'

// One meal: name and calories, then time and macros. Shared by Overview and History.
export function MealItem({ meal }: { meal: DailyMeal }) {
  const time = new Intl.DateTimeFormat(getLocale(), {
    timeStyle: 'short',
  }).format(meal.createdAt)

  return (
    <li className="py-3 last:pb-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 font-medium break-words">{meal.name}</p>
        <p className="shrink-0 whitespace-nowrap tabular-nums">
          <span className="font-semibold">{formatAmount(meal.calories)}</span>{' '}
          <span className="text-xs text-muted-foreground">kcal</span>
        </p>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
        <time
          dateTime={meal.createdAt.toISOString()}
          className="whitespace-nowrap"
        >
          {time}
        </time>
        {MACROS.map((macro) => (
          <span key={macro.key} className="whitespace-nowrap">
            {macro.label()} {formatAmount(meal[macro.key])} {macro.unit}
          </span>
        ))}
      </div>
    </li>
  )
}

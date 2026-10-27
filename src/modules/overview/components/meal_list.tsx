import { Card } from '#/components/ui/card'
import { MACROS } from '#/modules/overview/nutrients'
import type { DailyMeal } from '#/modules/overview/types'
import { formatAmount } from '#/modules/overview/utils'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'

export function MealList({ meals }: { meals: Array<DailyMeal> }) {
  const timeFormat = new Intl.DateTimeFormat(getLocale(), {
    timeStyle: 'short',
  })

  return (
    <Card className="mt-6 gap-0 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">{m.overview_meals_title()}</h2>
        {meals.length > 0 ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
            {meals.length}
          </span>
        ) : null}
      </div>
      {meals.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {m.overview_empty()}
        </p>
      ) : (
        <ol className="mt-1 divide-y divide-border">
          {meals.map((meal) => (
            <li key={meal.id} className="py-3 last:pb-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 font-medium break-words">{meal.name}</p>
                <p className="shrink-0 whitespace-nowrap tabular-nums">
                  <span className="font-semibold">
                    {formatAmount(meal.calories)}
                  </span>{' '}
                  <span className="text-xs text-muted-foreground">kcal</span>
                </p>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
                <time
                  dateTime={meal.createdAt.toISOString()}
                  className="whitespace-nowrap"
                >
                  {timeFormat.format(meal.createdAt)}
                </time>
                {MACROS.map((macro) => (
                  <span key={macro.key} className="whitespace-nowrap">
                    {macro.label()} {formatAmount(meal[macro.key])} {macro.unit}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

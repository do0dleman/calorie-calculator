import { MACROS } from '#/modules/overview/nutrients'
import type { DailyMeal, Nutrient } from '#/modules/overview/types'
import { formatAmount } from '#/modules/overview/utils'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'

import { NutrientDot } from './nutrient_dot'

const MACRO_COLUMNS = ['col-start-3', 'col-start-4', 'col-start-5'] as const

// Wide-screen layout of a day's meals: one line per meal. Rows share the
// parent's columns (subgrid), so the numbers line up like a table. Fixed column
// widths keep separate cards aligned with each other. Shared by Overview and
// History; phones use MealTimeline instead. With `totals`, a bold total row
// closes the table (History).
export function MealTable({
  meals,
  totals,
}: {
  meals: Array<DailyMeal>
  totals?: Record<Nutrient, number>
}) {
  const timeFormat = new Intl.DateTimeFormat(getLocale(), {
    timeStyle: 'short',
  })

  return (
    <div
      role="table"
      className="mt-2 grid grid-cols-[4.5rem_minmax(0,1fr)_repeat(3,5.5rem)_4.5rem] gap-x-4 text-sm"
    >
      <div
        role="row"
        className="col-span-full grid grid-cols-subgrid pb-1.5 text-xs text-muted-foreground"
      >
        {MACROS.map((macro, index) => (
          <span
            key={macro.key}
            role="columnheader"
            className={`${MACRO_COLUMNS[index]} flex items-center justify-end gap-1.5`}
          >
            <NutrientDot nutrient={macro} />
            {macro.label()}
          </span>
        ))}
        <span role="columnheader" className="col-start-6 text-right">
          kcal
        </span>
      </div>

      {meals.map((meal) => (
        <div
          key={meal.id}
          role="row"
          className="col-span-full grid grid-cols-subgrid items-baseline border-t border-border py-2.5 tabular-nums last:pb-0"
        >
          <time
            role="cell"
            dateTime={meal.createdAt.toISOString()}
            className="text-xs whitespace-nowrap text-muted-foreground"
          >
            {timeFormat.format(meal.createdAt)}
          </time>
          <span role="cell" className="min-w-0 font-medium break-words">
            {meal.name}
          </span>
          {MACROS.map((macro) => (
            <span
              key={macro.key}
              role="cell"
              className="text-right whitespace-nowrap"
            >
              {formatAmount(meal[macro.key])}
              <span className="text-xs text-muted-foreground"> g</span>
            </span>
          ))}
          <span
            role="cell"
            className="text-right font-semibold whitespace-nowrap"
          >
            {formatAmount(meal.calories)}
          </span>
        </div>
      ))}

      {totals ? (
        <div
          role="row"
          className="col-span-full mt-1 grid grid-cols-subgrid items-baseline border-t-2 border-foreground/70 pt-3 text-base font-bold tabular-nums"
        >
          <span role="rowheader" className="col-start-2">
            {m.history_total()}
          </span>
          {MACROS.map((macro) => (
            <span
              key={macro.key}
              role="cell"
              className="text-right whitespace-nowrap"
            >
              {formatAmount(totals[macro.key])}
              <span className="text-xs font-normal text-muted-foreground">
                {' '}
                g
              </span>
            </span>
          ))}
          <span role="cell" className="text-right whitespace-nowrap">
            {formatAmount(totals.calories)}
          </span>
        </div>
      ) : null}
    </div>
  )
}

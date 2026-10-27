import { MACROS } from '#/modules/overview/nutrients'
import type { DailyMeal } from '#/modules/overview/types'
import { formatAmount } from '#/modules/overview/utils'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'

const SHORT_LABELS = {
  protein: m.overview_protein_short,
  fat: m.overview_fat_short,
  carbs: m.overview_carbs_short,
} as const

// Phones: name + kcal on the first line, time + macros on the second.
// md and up: one line per meal. Rows share the parent's columns (subgrid), so
// the numbers line up from meal to meal like a table.
const MACRO_COLUMNS = [
  'col-start-2 md:col-start-3',
  'col-start-3 md:col-start-4',
  'col-start-4 md:col-start-5',
] as const

// Meals of one day as a simple table. Shared by Overview and History.
export function MealTable({ meals }: { meals: Array<DailyMeal> }) {
  const timeFormat = new Intl.DateTimeFormat(getLocale(), {
    timeStyle: 'short',
  })

  return (
    <div
      role="table"
      className="mt-2 grid grid-cols-[3.25rem_repeat(3,minmax(0,1fr))] gap-x-3 text-sm md:grid-cols-[4.5rem_minmax(0,1fr)_repeat(3,5.5rem)_4.5rem] md:gap-x-4"
    >
      <div
        role="row"
        className="col-span-full grid grid-cols-subgrid pb-1.5 text-xs text-muted-foreground"
      >
        {MACROS.map((macro, index) => (
          <span
            key={macro.key}
            role="columnheader"
            className={`${MACRO_COLUMNS[index]} row-start-1 text-right`}
          >
            <span className="md:hidden">{SHORT_LABELS[macro.key]()}</span>
            <span className="hidden md:inline">{macro.label()}</span>
          </span>
        ))}
        <span
          role="columnheader"
          className="col-start-6 row-start-1 hidden text-right md:block"
        >
          kcal
        </span>
      </div>

      {meals.map((meal) => (
        <div
          key={meal.id}
          role="row"
          className="col-span-full grid grid-cols-subgrid items-baseline gap-y-0.5 border-t border-border py-2.5 tabular-nums last:pb-0"
        >
          <span
            role="cell"
            className="col-span-3 row-start-1 min-w-0 font-medium break-words md:col-span-1 md:col-start-2"
          >
            {meal.name}
          </span>
          <span
            role="cell"
            className="col-start-4 row-start-1 text-right whitespace-nowrap md:col-start-6"
          >
            <span className="font-semibold">{formatAmount(meal.calories)}</span>
            <span className="text-xs text-muted-foreground md:hidden">
              {' '}
              kcal
            </span>
          </span>
          <time
            role="cell"
            dateTime={meal.createdAt.toISOString()}
            className="col-start-1 row-start-2 text-xs whitespace-nowrap text-muted-foreground md:row-start-1"
          >
            {timeFormat.format(meal.createdAt)}
          </time>
          {MACROS.map((macro, index) => (
            <span
              key={macro.key}
              role="cell"
              className={`${MACRO_COLUMNS[index]} row-start-2 text-right whitespace-nowrap md:row-start-1`}
            >
              {formatAmount(meal[macro.key])}
              <span className="text-xs text-muted-foreground"> g</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

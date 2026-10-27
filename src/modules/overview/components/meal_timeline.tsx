import { MACROS, nutrientColor } from '#/modules/overview/nutrients'
import type { NutrientInfo } from '#/modules/overview/nutrients'
import type { DailyMeal, Nutrient } from '#/modules/overview/types'
import { formatAmount } from '#/modules/overview/utils'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'

const SHORT_LABELS = {
  protein: m.overview_protein_short,
  fat: m.overview_fat_short,
  carbs: m.overview_carbs_short,
} as const

// Phone layout of a day's meals as a timeline. Shared by Overview and History.
// With `totals`, a macro summary (also the color key) comes first; Overview
// leaves it out because its summary card already shows the day's macros.
export function MealTimeline({
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
    <>
      {totals ? (
        <dl className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-muted/60 px-3 py-2">
          {MACROS.map((macro) => (
            <div key={macro.key}>
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Dot nutrient={macro} />
                {SHORT_LABELS[macro.key]()}
              </dt>
              <dd className="mt-0.5 pl-3.5 text-sm font-semibold tabular-nums">
                {formatAmount(totals[macro.key])} g
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

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
                    <Dot nutrient={macro} />
                    <span className="sr-only">{macro.label()}</span>
                    {formatAmount(meal[macro.key])} g
                  </span>
                ))}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}

function Dot({ nutrient }: { nutrient: NutrientInfo }) {
  return (
    <span
      aria-hidden
      className="size-2 shrink-0 rounded-full"
      style={{ backgroundColor: nutrientColor(nutrient) }}
    />
  )
}

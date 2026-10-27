import { Card } from '#/components/ui/card'
import type { DailyMeal } from '#/modules/overview/types'
import { m } from '#/paraglide/messages'

import { MealItem } from './meal_item'

export function MealList({ meals }: { meals: Array<DailyMeal> }) {
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
            <MealItem key={meal.id} meal={meal} />
          ))}
        </ol>
      )}
    </Card>
  )
}

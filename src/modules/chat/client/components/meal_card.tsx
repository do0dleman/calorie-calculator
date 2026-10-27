import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'

import { formatAmount } from '#/modules/overview/utils'
import { updateMeal } from '#/modules/meal/meal.functions'
import type { LoggedMeal } from '#/modules/meal/meal.functions'

import { ManualMealDialog } from './manual_meal_dialog'

export function MealCard({ meal }: { meal: LoggedMeal }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(meal)
  const queryClient = useQueryClient()
  const saveMeal = useServerFn(updateMeal)

  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2 text-foreground">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 font-medium break-words">{current.name}</p>
        <p className="shrink-0 tabular-nums">
          <span className="font-semibold">
            {formatAmount(current.caloriesKcal)}
          </span>{' '}
          <span className="text-xs text-muted-foreground">kcal</span>
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground tabular-nums">
        P {formatAmount(current.proteinG)}g · F {formatAmount(current.fatG)}g ·
        C {formatAmount(current.carbsG)}g
      </p>
      <button
        type="button"
        className="mt-1 text-xs underline underline-offset-2"
        onClick={() => setOpen(true)}
      >
        Edit
      </button>
      <ManualMealDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit meal"
        submitLabel="Save changes"
        initial={current}
        onSubmit={async (fields) => {
          const updated = await saveMeal({
            data: { id: current.id, ...fields },
          })
          setCurrent(updated)
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['daily-meals'] }),
            queryClient.invalidateQueries({ queryKey: ['daily-totals'] }),
          ])
        }}
      />
    </div>
  )
}

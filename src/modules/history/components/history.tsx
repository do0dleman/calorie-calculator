import { useSuspenseQuery } from '@tanstack/react-query'

import { Card } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { mealHistoryQueryOptions } from '#/modules/history/history.functions'
import { dayKey, groupMealsByDay } from '#/modules/history/utils'
import type { MealDay } from '#/modules/history/utils'
import { MacroTotals } from '#/modules/overview/components/macro_totals'
import { MealTable } from '#/modules/overview/components/meal_table'
import { MealTimeline } from '#/modules/overview/components/meal_timeline'
import {
  formatAmount,
  formatDate,
  formatFullDate,
  formatWeekday,
} from '#/modules/overview/utils'
import { m } from '#/paraglide/messages'

export function History() {
  const { data: meals } = useSuspenseQuery(mealHistoryQueryOptions())
  const days = groupMealsByDay(meals)

  return (
    <HistoryLayout>
      {days.length === 0 ? (
        <p className="text-sm text-muted-foreground">{m.history_empty()}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {days.map((day) => (
            <DayCard key={day.key} day={day} />
          ))}
        </div>
      )}
    </HistoryLayout>
  )
}

function DayCard({ day }: { day: MealDay }) {
  const isToday = day.key === dayKey(new Date())

  return (
    <Card className="gap-0 p-4 sm:p-6">
      {/* Date on top, weekday underneath, so long Latvian dates don't wrap mid-phrase.
          On very narrow screens the day total drops below instead of squeezing the date. */}
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div>
          <h2 className="font-semibold">
            {isToday ? m.history_today() : formatDate(day.date)}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isToday ? formatFullDate(day.date) : formatWeekday(day.date)}
          </p>
        </div>
        <p className="whitespace-nowrap tabular-nums">
          <span className="text-lg font-semibold">
            {formatAmount(day.totals.calories)}
          </span>{' '}
          <span className="text-xs text-muted-foreground">kcal</span>
        </p>
      </div>
      {/* Phones get a timeline; wider screens keep the aligned table. */}
      <div className="md:hidden">
        <MacroTotals totals={day.totals} />
        <MealTimeline meals={day.meals} />
      </div>
      <div className="hidden md:block">
        <MealTable meals={day.meals} totals={day.totals} />
      </div>
    </Card>
  )
}

export function HistorySkeleton() {
  return (
    <HistoryLayout>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </HistoryLayout>
  )
}

function HistoryLayout({ children }: { children: React.ReactNode }) {
  return (
    // Bottom padding keeps the last card clear of the phone navigation bar.
    <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-24 sm:px-6 sm:pt-6 sm:pb-10">
      <h1 className="mb-4 text-xl font-semibold">{m.history_title()}</h1>
      {children}
    </main>
  )
}

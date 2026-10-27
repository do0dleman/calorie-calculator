import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'

import { Card } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { DAILY_GOALS } from '#/modules/overview/daily_goals'
import { MACROS } from '#/modules/overview/nutrients'
import {
  dailyMealsQueryOptions,
  dailyTotalsQueryOptions,
} from '#/modules/overview/overview.functions'
import { formatFullDate, todayRange } from '#/modules/overview/utils'
import { m } from '#/paraglide/messages'

import { CaloriesSummary } from './calories_summary'
import { MacroRow } from './macro_row'
import { MealList } from './meal_list'

const route = getRouteApi('/_protected/overview')

export function Overview() {
  const { range } = route.useLoaderData()
  const { data: totals } = useSuspenseQuery(dailyTotalsQueryOptions(range))
  const { data: meals } = useSuspenseQuery(dailyMealsQueryOptions(range))

  return (
    <OverviewLayout date={range.from}>
      <Card className="gap-0 p-4 sm:p-6">
        <CaloriesSummary eaten={totals.calories} goal={DAILY_GOALS.calories} />
        <ul className="mt-4 grid gap-3 border-t border-border pt-4 md:grid-cols-3 md:gap-4">
          {MACROS.map((macro) => (
            <MacroRow
              key={macro.key}
              nutrient={macro}
              eaten={totals[macro.key]}
              goal={DAILY_GOALS[macro.key]}
            />
          ))}
        </ul>
      </Card>
      <p className="mt-2 px-1 text-xs text-muted-foreground">
        {m.overview_goal_note()}
      </p>
      <MealList meals={meals} />
    </OverviewLayout>
  )
}

export function OverviewSkeleton() {
  return (
    <OverviewLayout date={todayRange().from}>
      <Skeleton className="h-64 rounded-xl md:h-52" />
      <Skeleton className="mt-8 h-48 rounded-xl" />
    </OverviewLayout>
  )
}

function OverviewLayout({
  date,
  children,
}: {
  date: string
  children: React.ReactNode
}) {
  return (
    // Bottom padding keeps the last card clear of the phone navigation bar.
    <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-24 sm:px-6 sm:pt-6 sm:pb-10">
      <h1 className="text-xl font-semibold">{m.overview_title()}</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {formatFullDate(new Date(date))}
      </p>
      {children}
    </main>
  )
}

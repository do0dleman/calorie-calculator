import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { dailyTotalsQueryOptions } from '#/lib/meals.functions'
import type { DayRange } from '#/lib/meals.functions'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/overview')({
  // Run the loader in the browser so "today" uses the user's local timezone.
  ssr: false,
  loader: async ({ context }) => {
    const range = todayRange()
    await context.queryClient.ensureQueryData(dailyTotalsQueryOptions(range))
    return { range }
  },
  pendingComponent: OverviewSkeleton,
  component: OverviewPage,
})

function todayRange(): DayRange {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return { from: start.toISOString(), to: end.toISOString() }
}

function OverviewPage() {
  const { range } = Route.useLoaderData()
  const { data: totals } = useSuspenseQuery(dailyTotalsQueryOptions(range))

  const stats = [
    { label: m.overview_calories(), value: totals.calories, unit: 'kcal' },
    { label: m.overview_protein(), value: totals.protein, unit: 'g' },
    { label: m.overview_fat(), value: totals.fat, unit: 'g' },
    { label: m.overview_carbs(), value: totals.carbs, unit: 'g' },
  ]

  return (
    <OverviewLayout date={range.from}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.label}
            className={index === 0 ? 'border-primary' : undefined}
          >
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-semibold tabular-nums">
                {formatAmount(stat.value)}
              </span>{' '}
              <span className="text-muted-foreground">{stat.unit}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {totals.mealCount === 0
          ? m.overview_empty()
          : m.overview_meals_count({ count: totals.mealCount })}
      </p>
    </OverviewLayout>
  )
}

function OverviewSkeleton() {
  return (
    <OverviewLayout date={todayRange().from}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
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
    <main className="container mx-auto mt-2 px-1">
      <h1 className="text-lg">{m.overview_title()}</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {new Intl.DateTimeFormat(getLocale(), { dateStyle: 'full' }).format(
          new Date(date),
        )}
      </p>
      {children}
    </main>
  )
}

function formatAmount(value: number) {
  return new Intl.NumberFormat(getLocale(), {
    maximumFractionDigits: 1,
  }).format(value)
}

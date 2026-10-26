import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '#/components/ui/chart'
import type { ChartConfig } from '#/components/ui/chart'
import { Skeleton } from '#/components/ui/skeleton'
import { DAILY_GOALS } from '#/lib/daily-goals'
import type { Nutrient } from '#/lib/daily-goals'
import {
  dailyMealsQueryOptions,
  dailyTotalsQueryOptions,
} from '#/lib/meals.functions'
import type { DayRange, getDailyMeals } from '#/lib/meals.functions'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Label, Pie, PieChart } from 'recharts'

export const Route = createFileRoute('/_protected/overview')({
  // Run the loader in the browser so "today" uses the user's local timezone.
  ssr: false,
  loader: async ({ context }) => {
    const range = todayRange()
    await Promise.all([
      context.queryClient.ensureQueryData(dailyTotalsQueryOptions(range)),
      context.queryClient.ensureQueryData(dailyMealsQueryOptions(range)),
    ])
    return { range }
  },
  pendingComponent: OverviewSkeleton,
  component: OverviewPage,
})

// One fixed color per nutrient, shared by every chart on the page.
// Categorical slots 1-4, validated for CVD separation on the light and dark card surfaces.
const NUTRIENTS = [
  {
    key: 'calories',
    unit: 'kcal',
    label: m.overview_calories,
    color: { light: '#2a78d6', dark: '#3987e5' },
  },
  {
    key: 'protein',
    unit: 'g',
    label: m.overview_protein,
    color: { light: '#eb6834', dark: '#d95926' },
  },
  {
    key: 'fat',
    unit: 'g',
    label: m.overview_fat,
    color: { light: '#1baf7a', dark: '#199e70' },
  },
  {
    key: 'carbs',
    unit: 'g',
    label: m.overview_carbs,
    color: { light: '#eda100', dark: '#c98500' },
  },
] as const satisfies ReadonlyArray<{
  key: Nutrient
  unit: string
  label: () => string
  color: { light: string; dark: string }
}>

type NutrientInfo = (typeof NUTRIENTS)[number]

const MACROS = NUTRIENTS.filter((nutrient) => nutrient.key !== 'calories')

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
  const { data: meals } = useSuspenseQuery(dailyMealsQueryOptions(range))

  return (
    <OverviewLayout date={range.from}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {NUTRIENTS.map((nutrient) => (
          <GoalRing
            key={nutrient.key}
            nutrient={nutrient}
            eaten={totals[nutrient.key]}
            goal={DAILY_GOALS[nutrient.key]}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {m.overview_goal_note()}
      </p>
      <MealList meals={meals} />
    </OverviewLayout>
  )
}

function GoalRing({
  nutrient,
  eaten,
  goal,
}: {
  nutrient: NutrientInfo
  eaten: number
  goal: number
}) {
  const percent = percentOf(eaten, goal)
  const config = {
    eaten: { label: m.overview_eaten(), theme: nutrient.color },
    // Track uses a faint step of the same hue, so the ring reads as progress toward the goal.
    remaining: {
      label: m.overview_remaining(),
      color: 'color-mix(in oklab, var(--color-eaten) 18%, transparent)',
    },
  } satisfies ChartConfig
  // Past the goal the ring is simply full; the label still shows the real percentage.
  const data = [
    { part: 'eaten', value: Math.min(eaten, goal), amount: eaten },
    {
      part: 'remaining',
      value: Math.max(goal - eaten, 0),
      amount: Math.max(goal - eaten, 0),
    },
  ].map((slice) => ({ ...slice, fill: `var(--color-${slice.part})` }))

  return (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {nutrient.label()}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-40"
        >
          <PieChart accessibilityLayer>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="part"
                  formatter={(_value, _name, item) => (
                    <TooltipRow
                      color={item.payload.fill}
                      label={
                        config[item.payload.part as keyof typeof config].label
                      }
                      value={`${formatAmount(item.payload.amount)} ${nutrient.unit}`}
                    />
                  )}
                />
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="part"
              innerRadius="68%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              cornerRadius={4}
              stroke="var(--card)"
              strokeWidth={2}
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) {
                    return null
                  }
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-2xl font-semibold"
                    >
                      {percent}%
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <p className="mt-2 text-center text-sm">
          <span className="font-semibold">{formatAmount(eaten)}</span>
          <span className="text-muted-foreground">
            {' / '}
            {formatAmount(goal)} {nutrient.unit}
          </span>
        </p>
      </CardContent>
    </Card>
  )
}

type DailyMeal = Awaited<ReturnType<typeof getDailyMeals>>[number]

function MealList({ meals }: { meals: Array<DailyMeal> }) {
  const timeFormat = new Intl.DateTimeFormat(getLocale(), {
    timeStyle: 'short',
  })

  return (
    <Card className="mt-4 gap-4">
      <CardHeader>
        <CardTitle>{m.overview_meals_title()}</CardTitle>
        {meals.length > 0 ? (
          <CardDescription>
            {m.overview_meals_count({ count: meals.length })}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        {meals.length === 0 ? (
          <p className="text-sm text-muted-foreground">{m.overview_empty()}</p>
        ) : (
          <ol className="divide-y divide-border">
            {meals.map((meal) => (
              <li
                key={meal.id}
                className="flex items-start gap-4 py-3 first:pt-0 last:pb-0"
              >
                <time
                  dateTime={meal.createdAt.toISOString()}
                  className="min-w-16 shrink-0 pt-0.5 text-sm whitespace-nowrap text-muted-foreground tabular-nums"
                >
                  {timeFormat.format(meal.createdAt)}
                </time>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{meal.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {MACROS.map(
                      (macro) =>
                        `${macro.label()} ${formatAmount(meal[macro.key])} ${macro.unit}`,
                    ).join(' · ')}
                  </p>
                </div>
                <p className="shrink-0 tabular-nums">
                  <span className="font-semibold">
                    {formatAmount(meal.calories)}
                  </span>{' '}
                  <span className="text-sm text-muted-foreground">kcal</span>
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

function TooltipRow({
  color,
  label,
  value,
}: {
  color: string
  label: React.ReactNode
  value: string
}) {
  return (
    <div className="flex w-full items-center gap-2">
      <span
        className="size-2.5 shrink-0 rounded-[2px]"
        style={{ backgroundColor: color }}
      />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto pl-4 font-mono font-medium tabular-nums">
        {value}
      </span>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <OverviewLayout date={todayRange().from}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {NUTRIENTS.map((nutrient) => (
          <Skeleton key={nutrient.key} className="h-60 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-8 h-64 rounded-xl" />
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

function percentOf(eaten: number, goal: number) {
  return Math.round((eaten / goal) * 100)
}

function formatAmount(value: number) {
  return new Intl.NumberFormat(getLocale(), {
    maximumFractionDigits: 1,
  }).format(value)
}

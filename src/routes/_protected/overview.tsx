import { Card } from '#/components/ui/card'
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

const [CALORIES, ...MACROS] = NUTRIENTS

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

function CaloriesSummary({ eaten, goal }: { eaten: number; goal: number }) {
  const left = goal - eaten

  return (
    <div className="flex items-center gap-3 min-[360px]:gap-4 sm:gap-6">
      <GoalRing
        nutrient={CALORIES}
        eaten={eaten}
        goal={goal}
        className="size-24 min-[360px]:size-28 sm:size-32"
        showPercent
      />
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{CALORIES.label()}</p>
        <p className="mt-0.5 leading-tight">
          <span className="text-2xl font-semibold tabular-nums min-[360px]:text-3xl">
            {formatAmount(eaten)}
          </span>{' '}
          <span className="text-sm text-muted-foreground">{CALORIES.unit}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {m.overview_of_goal({
            goal: formatAmount(goal),
            unit: CALORIES.unit,
          })}
        </p>
        <p className="mt-0.5 text-sm font-medium">
          {left >= 0
            ? m.overview_left({
                amount: formatAmount(left),
                unit: CALORIES.unit,
              })
            : m.overview_over({
                amount: formatAmount(-left),
                unit: CALORIES.unit,
              })}
        </p>
      </div>
    </div>
  )
}

function MacroRow({
  nutrient,
  eaten,
  goal,
}: {
  nutrient: NutrientInfo
  eaten: number
  goal: number
}) {
  return (
    <li className="flex items-center gap-3">
      <GoalRing
        nutrient={nutrient}
        eaten={eaten}
        goal={goal}
        className="size-10 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{nutrient.label()}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatAmount(eaten)} / {formatAmount(goal)} {nutrient.unit}
        </p>
      </div>
      <p className="shrink-0 text-sm font-semibold tabular-nums">
        {percentOf(eaten, goal)}%
      </p>
    </li>
  )
}

function GoalRing({
  nutrient,
  eaten,
  goal,
  className,
  showPercent = false,
}: {
  nutrient: NutrientInfo
  eaten: number
  goal: number
  className: string
  showPercent?: boolean
}) {
  const config = {
    eaten: { label: m.overview_eaten(), theme: nutrient.color },
    // Track uses a faint step of the same hue, so the ring reads as progress toward the goal.
    remaining: {
      label: m.overview_remaining(),
      color: 'color-mix(in oklab, var(--color-eaten) 24%, transparent)',
    },
  } satisfies ChartConfig
  // Past the goal the ring is simply full; the text next to it shows the real numbers.
  const data = [
    { part: 'eaten', value: Math.min(eaten, goal), amount: eaten },
    {
      part: 'remaining',
      value: Math.max(goal - eaten, 0),
      amount: Math.max(goal - eaten, 0),
    },
  ].map((slice) => ({ ...slice, fill: `var(--color-${slice.part})` }))

  return (
    <ChartContainer config={config} className={`aspect-square ${className}`}>
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
                  label={config[item.payload.part as keyof typeof config].label}
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
          innerRadius="70%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          cornerRadius={4}
          stroke="var(--card)"
          strokeWidth={2}
        >
          {showPercent ? (
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
                    className="fill-foreground text-xl font-semibold"
                  >
                    {percentOf(eaten, goal)}%
                  </text>
                )
              }}
            />
          ) : null}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

type DailyMeal = Awaited<ReturnType<typeof getDailyMeals>>[number]

function MealList({ meals }: { meals: Array<DailyMeal> }) {
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

import { Label, Pie, PieChart } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '#/components/ui/chart'
import type { ChartConfig } from '#/components/ui/chart'
import type { NutrientInfo } from '#/modules/overview/nutrients'
import { formatAmount, percentOf } from '#/modules/overview/utils'
import { m } from '#/paraglide/messages'

export function GoalRing({
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

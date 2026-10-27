import { MACROS } from '#/modules/overview/nutrients'
import type { Nutrient } from '#/modules/overview/types'
import { formatAmount } from '#/modules/overview/utils'
import { m } from '#/paraglide/messages'

import { NutrientDot } from './nutrient_dot'

const SHORT_LABELS = {
  protein: m.overview_protein_short,
  fat: m.overview_fat_short,
  carbs: m.overview_carbs_short,
} as const

// A day's protein, fat and carbs totals on phones. The dots double as the color
// key for the timeline below.
export function MacroTotals({ totals }: { totals: Record<Nutrient, number> }) {
  return (
    <dl className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-muted/60 px-3 py-2">
      {MACROS.map((macro) => (
        <div key={macro.key}>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <NutrientDot nutrient={macro} />
            {SHORT_LABELS[macro.key]()}
          </dt>
          <dd className="mt-0.5 pl-3.5 text-sm font-semibold tabular-nums">
            {formatAmount(totals[macro.key])} g
          </dd>
        </div>
      ))}
    </dl>
  )
}

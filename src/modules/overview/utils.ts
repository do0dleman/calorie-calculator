import { getLocale } from '#/paraglide/runtime'

import type { DayRange } from '#/modules/overview/types'

export function todayRange(): DayRange {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return { from: start.toISOString(), to: end.toISOString() }
}

export function percentOf(eaten: number, goal: number) {
  return Math.round((eaten / goal) * 100)
}

export function formatAmount(value: number) {
  return new Intl.NumberFormat(getLocale(), {
    maximumFractionDigits: 1,
  }).format(value)
}

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

// Full date with weekday. Latvian uses our own order instead of the browser's
// "pirmdiena, 2026. gada 26. oktobris": "Pirmdiena, 26. oktobris 2026. gads".
export function formatFullDate(date: Date) {
  const locale = getLocale()

  if (locale !== 'lv') {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date)
  }

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('lv', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  )
  const weekday = parts.weekday.charAt(0).toUpperCase() + parts.weekday.slice(1)

  return `${weekday}, ${parts.day}. ${parts.month} ${parts.year}. gads`
}

export function formatAmount(value: number) {
  return new Intl.NumberFormat(getLocale(), {
    maximumFractionDigits: 1,
  }).format(value)
}

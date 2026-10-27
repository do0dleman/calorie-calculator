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

  return `${formatWeekday(date)}, ${formatDate(date)}`
}

// Date without the weekday: "26. oktobris 2026. gads" / "October 26, 2026".
export function formatDate(date: Date) {
  const locale = getLocale()

  if (locale !== 'lv') {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date)
  }

  const parts = latvianDateParts(date)
  return `${parts.day}. ${parts.month} ${parts.year}. gads`
}

// Capitalised weekday: "Pirmdiena" / "Monday".
export function formatWeekday(date: Date) {
  const weekday = new Intl.DateTimeFormat(getLocale(), {
    weekday: 'long',
  }).format(date)

  return weekday.charAt(0).toUpperCase() + weekday.slice(1)
}

function latvianDateParts(date: Date) {
  return Object.fromEntries(
    new Intl.DateTimeFormat('lv', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  )
}

export function formatAmount(value: number) {
  return new Intl.NumberFormat(getLocale(), {
    maximumFractionDigits: 1,
  }).format(value)
}

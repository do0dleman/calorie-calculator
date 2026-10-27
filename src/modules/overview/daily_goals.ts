import { useState } from 'react'

import type { Nutrient } from '#/modules/overview/types'

// EU reference intakes for an average adult (Regulation (EU) No 1169/2011).
// Used until the browser has its own saved goals.
export const DEFAULT_DAILY_GOALS = {
  calories: 2000,
  protein: 50,
  fat: 70,
  carbs: 260,
} as const satisfies Record<Nutrient, number>

const STORAGE_KEY = 'daily-goals'
const NUTRIENTS = ['calories', 'protein', 'fat', 'carbs'] as const

export type DailyGoals = Record<Nutrient, number>

function isGoal(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function readDailyGoals(): DailyGoals {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_DAILY_GOALS }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DAILY_GOALS }

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_DAILY_GOALS }
    }

    const record = parsed as Record<string, unknown>
    const goals: DailyGoals = { ...DEFAULT_DAILY_GOALS }
    for (const key of NUTRIENTS) {
      if (!isGoal(record[key])) return { ...DEFAULT_DAILY_GOALS }
      goals[key] = record[key]
    }
    return goals
  } catch {
    return { ...DEFAULT_DAILY_GOALS }
  }
}

export function writeDailyGoals(goals: DailyGoals) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

// Client-only. Settings and overview both disable SSR, so the first read
// can use localStorage without a hydration mismatch.
export function useDailyGoals() {
  const [goals, setGoals] = useState(readDailyGoals)

  function saveGoals(next: DailyGoals) {
    writeDailyGoals(next)
    setGoals(next)
  }

  return { goals, saveGoals }
}

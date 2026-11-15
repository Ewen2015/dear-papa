import { byDay, byYear, letters, maxDayCount } from './archive'
import { MONTHS } from './calendar'
import type { Letter } from '../types'

export interface MonthStat {
  month: number
  zh: string
  en: string
  short: string
  letters: Letter[]
  count: number
  dayCount: number
  years: number[]
  firstKey: string | null
  lastKey: string | null
  counts: Map<string, number>
  yearsByDay: Map<string, number[]>
  leapCount: number
}

export const monthStats: MonthStat[] = MONTHS.map((month) => {
  const monthLetters = letters.filter((letter) => letter.month === month.month)
  const counts = new Map<string, number>()
  const yearsByDay = new Map<string, number[]>()

  for (const letter of monthLetters) {
    counts.set(letter.dateKey, (counts.get(letter.dateKey) ?? 0) + 1)
    const years = yearsByDay.get(letter.dateKey) ?? []
    if (!years.includes(letter.year)) years.push(letter.year)
    yearsByDay.set(letter.dateKey, years.sort((a, b) => a - b))
  }

  const dayKeys = [...counts.keys()].sort()
  const years = [...new Set(monthLetters.map((letter) => letter.year))].sort((a, b) => a - b)

  return {
    ...month,
    letters: monthLetters,
    count: monthLetters.length,
    dayCount: dayKeys.length,
    years,
    firstKey: dayKeys[0] ?? null,
    lastKey: dayKeys[dayKeys.length - 1] ?? null,
    counts,
    yearsByDay,
    leapCount: month.month === 2 ? (byDay.get('02-29')?.length ?? 0) : 0,
  }
})

export const globalMaxDayCount = maxDayCount
export const activeYearCount = byYear.size
export const multiYearDayCount = [...byDay.values()].filter(
  (group) => new Set(group.map((letter) => letter.year)).size > 1,
).length
export const sectionStats = [...new Map(letters.map((letter) => [letter.sectionKey, letter.section])).entries()]
  .map(([key, label]) => {
    const sectionLetters = letters.filter((letter) => letter.sectionKey === key)
    return {
      key,
      label,
      count: sectionLetters.length,
      first: sectionLetters[0]?.year ?? null,
      last: sectionLetters[sectionLetters.length - 1]?.year ?? null,
    }
  })

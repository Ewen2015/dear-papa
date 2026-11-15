import raw from '../data/letters.json'
import type { Archive, Letter, SenderRole } from '../types'

export const archive = raw as unknown as Archive
export const letters = archive.letters

export const byDay = new Map<string, Letter[]>()
export const byYear = new Map<number, Letter[]>()

for (const letter of letters) {
  const day = byDay.get(letter.dateKey)
  if (day) day.push(letter)
  else byDay.set(letter.dateKey, [letter])

  const year = byYear.get(letter.year)
  if (year) year.push(letter)
  else byYear.set(letter.year, [letter])
}

for (const group of byDay.values()) {
  group.sort((a, b) => a.year - b.year || a.order - b.order)
}

export const dayKeys = [...byDay.keys()].sort()
export const activeYears = [...byYear.keys()].sort((a, b) => a - b)
export const allYears = Array.from(
  { length: archive.meta.yearRange[1] - archive.meta.yearRange[0] + 1 },
  (_, index) => archive.meta.yearRange[0] + index,
)

export const maxDayCount = Math.max(1, ...[...byDay.values()].map((group) => group.length))

export const multiYearDayKeys = dayKeys.filter((key) => {
  const years = new Set((byDay.get(key) ?? []).map((letter) => letter.year))
  return years.size > 1
})

export const emptyYears = allYears.filter((year) => !byYear.has(year))

export function lettersOn(dayKey: string): Letter[] {
  return byDay.get(dayKey) ?? []
}

export function yearsOn(dayKey: string): number[] {
  return [...new Set(lettersOn(dayKey).map((letter) => letter.year))]
}

export function senderRole(letter: Letter): SenderRole {
  if (letter.sectionKey === 'intro') return 'other'
  return letter.sender.includes('帕特里克') ? 'son' : 'father'
}

export function roleLabel(letter: Letter): string {
  const role = senderRole(letter)
  if (role === 'father') return '父亲'
  if (role === 'son') return '儿子'
  return '引子'
}

export function nearestActiveDay(dayKey: string, direction: 1 | -1): string {
  if (direction > 0) {
    return dayKeys.find((key) => key > dayKey) ?? dayKeys[0]
  }
  const previous = [...dayKeys].reverse().find((key) => key < dayKey)
  return previous ?? dayKeys[dayKeys.length - 1]
}

const now = new Date()
export const todayKey = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(
  now.getDate(),
).padStart(2, '0')}`
export const todayLabel = `${now.getMonth() + 1}月${now.getDate()}日`

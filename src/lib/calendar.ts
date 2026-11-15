export const REFERENCE_YEAR = 2026

export interface MonthInfo {
  month: number
  zh: string
  en: string
  short: string
}

export const MONTHS: MonthInfo[] = [
  { month: 1, zh: '一月', en: 'JANUARY', short: '1月' },
  { month: 2, zh: '二月', en: 'FEBRUARY', short: '2月' },
  { month: 3, zh: '三月', en: 'MARCH', short: '3月' },
  { month: 4, zh: '四月', en: 'APRIL', short: '4月' },
  { month: 5, zh: '五月', en: 'MAY', short: '5月' },
  { month: 6, zh: '六月', en: 'JUNE', short: '6月' },
  { month: 7, zh: '七月', en: 'JULY', short: '7月' },
  { month: 8, zh: '八月', en: 'AUGUST', short: '8月' },
  { month: 9, zh: '九月', en: 'SEPTEMBER', short: '9月' },
  { month: 10, zh: '十月', en: 'OCTOBER', short: '10月' },
  { month: 11, zh: '十一月', en: 'NOVEMBER', short: '11月' },
  { month: 12, zh: '十二月', en: 'DECEMBER', short: '12月' },
]

export const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

export const pad2 = (value: number): string => String(value).padStart(2, '0')

export interface DayCell {
  key: string
  month: number
  day: number
  dayOfYear: number
}

export function dayKey(month: number, day: number): string {
  return `${pad2(month)}-${pad2(day)}`
}

export function daysInMonth(month: number): number {
  return new Date(REFERENCE_YEAR, month, 0).getDate()
}

/** Monday = 0 … Sunday = 6, using the fixed non-leap skeleton year. */
export function weekdayIndex(month: number, day: number): number {
  return (new Date(REFERENCE_YEAR, month - 1, day).getDay() + 6) % 7
}

export function weekdayLabel(month: number, day: number): string {
  return WEEKDAY_LABELS[weekdayIndex(month, day)]
}

export const ALL_DAYS: DayCell[] = MONTHS.flatMap(({ month }) => {
  const days = daysInMonth(month)
  return Array.from({ length: days }, (_, index) => {
    const day = index + 1
    const previous = MONTHS.slice(0, month - 1).reduce(
      (sum, item) => sum + daysInMonth(item.month),
      0,
    )
    return {
      key: dayKey(month, day),
      month,
      day,
      dayOfYear: previous + day,
    }
  })
})

export const DAY_OF_YEAR = new Map(ALL_DAYS.map((day) => [day.key, day.dayOfYear]))

export function monthCells(month: number): Array<DayCell | null> {
  const offset = weekdayIndex(month, 1)
  const days = daysInMonth(month)
  const cells: Array<DayCell | null> = Array.from({ length: offset }, () => null)
  for (let day = 1; day <= days; day += 1) {
    cells.push({
      key: dayKey(month, day),
      month,
      day,
      dayOfYear: DAY_OF_YEAR.get(dayKey(month, day)) ?? 0,
    })
  }
  return cells
}

export interface HeatmapCell extends DayCell {
  week: number
  weekday: number
}

export interface Heatmap {
  cells: Array<HeatmapCell | null>
  weeks: number
  monthLabels: Array<MonthInfo & { week: number }>
}

export function buildHeatmap(): Heatmap {
  const leading = weekdayIndex(1, 1)
  const total = leading + ALL_DAYS.length
  const weeks = Math.ceil(total / 7)
  const flat: Array<HeatmapCell | null> = Array.from({ length: weeks * 7 }, () => null)

  ALL_DAYS.forEach((day, index) => {
    const position = leading + index
    flat[position] = {
      ...day,
      week: Math.floor(position / 7),
      weekday: position % 7,
    }
  })

  const cells: Array<HeatmapCell | null> = []
  for (let week = 0; week < weeks; week += 1) {
    for (let weekday = 0; weekday < 7; weekday += 1) {
      cells.push(flat[week * 7 + weekday])
    }
  }

  const monthLabels = MONTHS.map((month) => {
    const first = ALL_DAYS.find((day) => day.month === month.month)!
    return {
      ...month,
      week: Math.floor((leading + first.dayOfYear - 1) / 7),
    }
  })

  return { cells, weeks, monthLabels }
}

export const heatmap = buildHeatmap()

/** Absolute density: 0 = no letters, 1–3 = that many letters, 4 = four or more. */
export function heatLevel(count: number): number {
  if (count <= 0) return 0
  return Math.min(4, count)
}

export function monthOfDayKey(key: string): number | null {
  const match = key.match(/^(\d{2})-(\d{2})$/)
  if (!match) return null
  const month = Number(match[1])
  const day = Number(match[2])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return month
}

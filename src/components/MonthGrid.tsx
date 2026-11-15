import { heatLevel, monthCells, WEEKDAY_LABELS } from '../lib/calendar'
import { href } from '../lib/router'

interface MonthMiniGridProps {
  month: number
  counts: Map<string, number>
  leapCount: number
}

export function MonthMiniGrid({ month, counts, leapCount }: MonthMiniGridProps) {
  const cells = monthCells(month)

  return (
    <div className="mini-cal" aria-hidden="true">
      {cells.map((cell, index) => {
        if (!cell) return <span key={`blank-${index}`} className="mini-cell is-blank" />
        const count = counts.get(cell.key) ?? 0
        return (
          <span
            key={cell.key}
            className={`mini-cell level-${heatLevel(count)}${
              cell.day === 1 || cell.day === 15 ? ' is-rule-day' : ''
            }`}
            title={`${cell.month}月${cell.day}日${count ? ` · ${count} 封` : ''}`}
          />
        )
      })}
      {month === 2 && leapCount > 0 && (
        <span className="mini-cell is-leap" title="闰日 2 月 29 日">
          闰
        </span>
      )}
    </div>
  )
}

interface MonthCalendarProps {
  month: number
  counts: Map<string, number>
  yearsByDay: Map<string, number[]>
  leapCount: number
}

export function MonthCalendar({
  month,
  counts,
  yearsByDay,
  leapCount,
}: MonthCalendarProps) {
  const cells = monthCells(month)

  return (
    <div className="month-calendar">
      <div className="month-calendar-head" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="month-calendar-grid">
        {cells.map((cell, index) => {
          if (!cell) {
            return <span key={`blank-${index}`} className="day-cell is-blank" aria-hidden="true" />
          }
          const count = counts.get(cell.key) ?? 0
          const years = yearsByDay.get(cell.key) ?? []
          const ruleDay = cell.day === 1 || cell.day === 15
          return (
            <a
              key={cell.key}
              className={`day-cell level-${heatLevel(count)}${count ? ' has-letters' : ''}${
                ruleDay ? ' is-rule-day' : ''
              }`}
              href={href(`/day/${cell.key}`)}
              aria-label={`${cell.month}月${cell.day}日，${
                count ? `${count} 封信，${years.join('、')} 年` : '没有信'
              }`}
            >
              <span className="day-number">{cell.day}</span>
              {count > 0 && (
                <>
                  <span className="day-count">{count}</span>
                  <span className="day-years">
                    {years.slice(0, 3).map((year) => (
                      <span key={year}>{year}</span>
                    ))}
                    {years.length > 3 && <span>+{years.length - 3}</span>}
                  </span>
                </>
              )}
              {ruleDay && <span className="rule-tick" aria-hidden="true" />}
            </a>
          )
        })}
        {month === 2 && leapCount > 0 && (
          <a
            className="day-cell is-leap has-letters"
            href={href('/day/02-29')}
            aria-label={`闰日 2 月 29 日，${leapCount} 封信`}
          >
            <span className="day-number">29</span>
            <span className="day-count">{leapCount}</span>
            <span className="day-years">
              <span>闰日</span>
            </span>
          </a>
        )}
      </div>
    </div>
  )
}

import { roleLabel, senderRole } from '../lib/archive'
import type { Letter } from '../types'
import { MONTHS, weekdayLabel } from '../lib/calendar'
import { letterExcerpt } from '../lib/excerpt'
import { href } from '../lib/router'
import { monthStats } from '../lib/stats'
import { MonthCalendar } from './MonthGrid'

export function MonthView({ month }: { month: number }) {
  const info = MONTHS[month - 1]
  const stat = monthStats[month - 1]
  const prevMonth = month === 1 ? 12 : month - 1
  const nextMonth = month === 12 ? 1 : month + 1

  const groups = new Map<string, Letter[]>()
  for (const letter of stat.letters) {
    const group = groups.get(letter.dateKey)
    if (group) group.push(letter)
    else groups.set(letter.dateKey, [letter])
  }
  const days = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))

  return (
    <>
      <section className="container page-head month-head">
        <div className="month-head-main">
          <p className="eyebrow">MONTH · {info.en}</p>
          <h1 className="month-title">
            <span className="month-title-num">{String(month).padStart(2, '0')}</span>
            <span className="month-title-zh">{info.zh}</span>
          </h1>
          <p className="page-lede">
            {stat.count > 0 ? (
              <>
                这个月有 {stat.count} 封信，落在 {stat.dayCount} 天里，横跨{' '}
                {stat.years.length} 个年份（{stat.years[0]}—{stat.years[stat.years.length - 1]}）。
              </>
            ) : (
              <>这个月没有收入信件。换一个月，或者回到一年。</>
            )}
          </p>
        </div>

        <div className="month-head-side">
          <div className="month-head-stats">
            <div>
              <strong>{stat.count}</strong>
              <span>封</span>
            </div>
            <div>
              <strong>{stat.dayCount}</strong>
              <span>天有信</span>
            </div>
            <div>
              <strong>{stat.years.length}</strong>
              <span>个年份</span>
            </div>
          </div>
          <div className="month-switch">
            <a href={href(`/month/${prevMonth}`)}>← {MONTHS[prevMonth - 1].short}</a>
            <a href={href(`/month/${nextMonth}`)}>{MONTHS[nextMonth - 1].short} →</a>
          </div>
        </div>
      </section>

      <nav className="container month-nav" aria-label="按月份切换">
        {MONTHS.map((item) => (
          <a
            key={item.month}
            className={`month-nav-item${item.month === month ? ' is-active' : ''}`}
            href={href(`/month/${item.month}`)}
            aria-current={item.month === month ? 'page' : undefined}
          >
            <span>{item.short}</span>
            <small>{monthStats[item.month - 1].count}</small>
          </a>
        ))}
      </nav>

      <section className="container panel month-cal-panel" aria-labelledby="month-cal-title">
        <div className="panel-head">
          <div>
            <p className="eyebrow">THE MONTH, OVERLAID</p>
            <h2 id="month-cal-title" className="panel-title">
              {info.zh}月历
            </h2>
            <p className="panel-note">
              每一格是所有年份里的同一天；数字是这一天收到的信数。带短横线的是 1 号、15
              号——海明威定下的写信日。
            </p>
          </div>
          {month === 2 && stat.leapCount > 0 && (
            <a className="leap-note" href={href('/day/02-29')}>
              闰日 2 月 29 日 · 另有 {stat.leapCount} 封 →
            </a>
          )}
        </div>
        <MonthCalendar
          month={month}
          counts={stat.counts}
          yearsByDay={stat.yearsByDay}
          leapCount={stat.leapCount}
        />
      </section>

      <section className="container month-letters" aria-labelledby="month-letters-title">
        <div className="section-head">
          <div>
            <p className="eyebrow">DAY BY DAY</p>
            <h2 id="month-letters-title" className="section-title">
              一天一天地读
            </h2>
          </div>
          <p className="section-head-note">
            {days.length} 个日子 · 按日期排列，不按年份
          </p>
        </div>

        {days.length === 0 && (
          <div className="empty-day panel">
            <p className="empty-day-mark" aria-hidden="true">
              （.）
            </p>
            <h3>这个月空着。</h3>
            <a className="button" href={href('/month')}>
              换一个月
            </a>
          </div>
        )}

        <div className="month-day-list">
          {days.map(([key, list]) => {
            const day = Number(key.slice(3, 5))
            const years = [...new Set(list.map((letter) => letter.year))]
            return (
              <section key={key} className="month-day-group">
                <header className="month-day-head">
                  <span className="month-day-num">{String(day).padStart(2, '0')}</span>
                  <div className="month-day-meta">
                    <h3>
                      {month} 月 {day} 日
                    </h3>
                    <p>
                      星期{weekdayLabel(month, day)} · {list.length} 封 ·{' '}
                      {years.join(' / ')}
                    </p>
                  </div>
                  <a className="month-day-open" href={href(`/day/${key}`)}>
                    打开这一天 →
                  </a>
                </header>

                <div className="month-letter-rows">
                  {list.map((letter) => (
                    <a key={letter.id} className="month-letter-row" href={href(`/day/${key}`)}>
                      <span className="month-letter-year">{letter.year}</span>
                      <span className="month-letter-body">
                        <span className="month-letter-title">{letter.title}</span>
                        <span className="month-letter-byline">
                          {letter.sender} → {letter.recipient}
                        </span>
                        <span className="month-letter-excerpt">
                          {letterExcerpt(letter.paragraphs)}
                        </span>
                      </span>
                      <span className={`month-letter-role is-${senderRole(letter)}`}>
                        {roleLabel(letter)}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </section>
    </>
  )
}

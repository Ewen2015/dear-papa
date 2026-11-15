import { archive } from '../lib/archive'
import { href } from '../lib/router'
import { monthStats } from '../lib/stats'
import { MonthMiniGrid } from './MonthGrid'

function busiestDay(counts: Map<string, number>): { key: string; count: number } | null {
  let best: { key: string; count: number } | null = null
  for (const [key, count] of counts) {
    if (!best || count > best.count || (count === best.count && key < best.key)) {
      best = { key, count }
    }
  }
  return best
}

function shortDate(key: string): string {
  const [month, day] = key.split('-').map(Number)
  return `${month}月${day}日`
}

export function MonthIndex() {
  return (
    <>
      <section className="container page-head">
        <p className="eyebrow">TWELVE MONTHS · ONE SKELETON</p>
        <h1 className="page-title">
          按月，重读一年。
        </h1>
        <p className="page-lede">
          同一个月份，装着不同年份的信。每一张月历都是固定的 365
          天骨架，颜色深的格子，是那一天收到或寄出的信更多。
        </p>
      </section>

      <div className="container month-index">
        {monthStats.map((month) => {
          const busiest = busiestDay(month.counts)
          return (
            <a
              key={month.month}
              className="month-card panel"
              href={href(`/month/${month.month}`)}
              aria-label={`${month.zh}，${month.count} 封信，${month.dayCount} 天有信`}
            >
              <div className="month-card-head">
                <span className="month-card-num">{String(month.month).padStart(2, '0')}</span>
                <div className="month-card-names">
                  <h2>{month.zh}</h2>
                  <p>{month.en}</p>
                </div>
                <span className="month-card-arrow" aria-hidden="true">
                  →
                </span>
              </div>

              <MonthMiniGrid
                month={month.month}
                counts={month.counts}
                leapCount={month.leapCount}
              />

              <div className="month-card-foot">
                <span>
                  <strong>{month.count}</strong> 封
                </span>
                <span>{month.dayCount} 天</span>
                <span>{month.years.length} 个年份</span>
              </div>

              <p className="month-card-busiest">
                {busiest && busiest.count > 0
                  ? `最密 · ${shortDate(busiest.key)}，${busiest.count} 封`
                  : '这个月没有信'}
              </p>
            </a>
          )
        })}
      </div>

      <div className="container">
        <p className="section-note">
          共 {archive.meta.totalLetters} 封 · {archive.meta.activeDays} 个有信的日子 ·{' '}
          {archive.meta.leapLetters} 封落在闰日 2 月 29 日
        </p>
      </div>
    </>
  )
}

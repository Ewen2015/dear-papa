import { daysInMonth, weekdayLabel } from '../lib/calendar'
import {
  archive,
  lettersOn,
  nearestActiveDay,
  roleLabel,
  senderRole,
} from '../lib/archive'
import { href } from '../lib/router'
import { LetterReading } from './LetterReading'

function shortDate(key: string): string {
  const [month, day] = key.split('-').map(Number)
  return `${month}月${day}日`
}

function scrollToLetter(id: string) {
  document.getElementById(`letter-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function DayView({ dayKey }: { dayKey: string }) {
  const letters = lettersOn(dayKey)
  const month = Number(dayKey.slice(0, 2))
  const day = Number(dayKey.slice(3, 5))
  const isLeapDay = dayKey === '02-29'
  const valid =
    isLeapDay ||
    (month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(month))

  if (!valid) {
    return (
      <section className="container page-head">
        <p className="eyebrow">ONE DAY · ALL YEARS</p>
        <h1 className="page-title">这一天不在日历里。</h1>
        <p className="page-lede">
          「{dayKey}」不是一个真实的「月—日」。回到一年，从 365 天里挑一天。
        </p>
        <a className="button" href={href('/')}>
          回到一年
        </a>
      </section>
    )
  }

  const years = [...new Set(letters.map((letter) => letter.year))]
  const prev = nearestActiveDay(dayKey, -1)
  const next = nearestActiveDay(dayKey, 1)
  const showRail = letters.length > 1

  return (
    <>
      <section className="container page-head day-head">
        <p className="eyebrow">ONE DAY · ALL YEARS</p>
        <div className="day-headline">
          <h1 className="day-big" aria-label={`${month}月${day}日`}>
            <span>{String(month).padStart(2, '0')}</span>
            <i aria-hidden="true">·</i>
            <span>{String(day).padStart(2, '0')}</span>
          </h1>
          <div className="day-headmeta">
            <p className="day-head-date">{shortDate(dayKey)}</p>
            <p className="day-head-week">
              {isLeapDay ? '闰日 · 只在闰年出现' : `星期${weekdayLabel(month, day)}`}
            </p>
            <p className="day-head-count">
              {letters.length > 0
                ? `${letters.length} 封 · ${years.length} 个年份`
                : '这一天没有信'}
            </p>
          </div>
        </div>

        {years.length > 0 && (
          <p className="day-years-line">
            {years.map((year) => (
              <span key={year}>{year}</span>
            ))}
          </p>
        )}
      </section>

      <div className="container">
        {isLeapDay && letters.length > 0 && (
          <div className="leap-banner">
            <span className="leap-banner-mark">02 · 29</span>
            <p>
              这封信写于闰年。它不属于固定的 365 天骨架，所以单独放在这里——否则它会被
              2 月 28 日吞掉。
            </p>
          </div>
        )}

        {letters.length === 0 ? (
          <div className="empty-day panel">
            <p className="empty-day-mark" aria-hidden="true">
              （.）
            </p>
            <h2>这一天，没有留下信。</h2>
            <p>
              在 {archive.meta.years.length} 个有信的年份里，{shortDate(dayKey)}
              {isLeapDay ? ' 只属于闰年，而这一年没有写。' : ' 始终空着。'}
              换一天，或者回到热力图，看看信都落在哪些日子。
            </p>
            <div className="empty-day-links">
              <a className="button" href={href('/')}>
                回到一年
              </a>
              <a className="button is-ghost" href={href(`/month/${month}`)}>
                看整个 {month} 月
              </a>
            </div>
          </div>
        ) : (
          <div className={`day-layout${showRail ? ' has-rail' : ''}`}>
            {showRail && (
              <aside className="year-rail" aria-label="这一天的年份">
                <p className="rail-title">{letters.length} 封</p>
                <div className="rail-items">
                  {letters.map((letter) => (
                    <button
                      key={letter.id}
                      type="button"
                      className="rail-item"
                      onClick={() => scrollToLetter(letter.id)}
                    >
                      <span className="rail-year">{letter.year}</span>
                      <span className="rail-letter-title">{letter.title}</span>
                      <span className={`rail-role is-${senderRole(letter)}`}>
                        {roleLabel(letter)}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="rail-note">点一条，跳到那封信</p>
              </aside>
            )}

            <div className="day-letters">
              {letters.map((letter) => (
                <div key={letter.id} id={`letter-${letter.id}`} className="letter-anchor">
                  <LetterReading letter={letter} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <nav className="container day-nav" aria-label="前后有信的日子">
        <a className="day-nav-item" href={href(`/day/${prev}`)}>
          <span className="day-nav-label">← 上一个有信的日子</span>
          <strong>{shortDate(prev)}</strong>
          <span className="day-nav-count">{lettersOn(prev).length} 封</span>
        </a>
        <a className="day-nav-item is-next" href={href(`/day/${next}`)}>
          <span className="day-nav-label">下一个有信的日子 →</span>
          <strong>{shortDate(next)}</strong>
          <span className="day-nav-count">{lettersOn(next).length} 封</span>
        </a>
      </nav>
    </>
  )
}

import {
  activeYears,
  archive,
  letters,
  lettersOn,
  nearestActiveDay,
  todayKey,
  todayLabel,
} from '../lib/archive'
import { href } from '../lib/router'
import { activeYearCount, monthStats, multiYearDayCount } from '../lib/stats'
import { Heatmap } from './Heatmap'
import { Postmark } from './Postmark'

function shortDate(key: string): string {
  const [month, day] = key.split('-').map(Number)
  return `${month}月${day}日`
}

export function HomeView() {
  const todayLetters = lettersOn(todayKey)
  const nextKey = todayLetters.length === 0 ? nearestActiveDay(todayKey, 1) : null
  const nextLetters = nextKey ? lettersOn(nextKey) : []
  const maxMonth = Math.max(...monthStats.map((month) => month.count), 1)
  const firstLetter = letters[0]
  const lastLetter = letters[letters.length - 1]

  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">A BOOK, REBUILT AS A YEAR</p>
          <h1 className="hero-title">
            把二十九年的父子通信，
            <br />
            放回一年里的 <em>365</em> 天。
          </h1>
          <p className="hero-lede">
            《亲爱的老爸》不是一本按顺序读完就算的书。我们把书里的{' '}
            {archive.meta.totalLetters} 封信按「月—日」叠进同一个 365
            天的骨架：哪一天有人写信、哪一年写了什么，点开就能看见。
          </p>
          <div className="hero-actions">
            <a className="button" href={href('/month')}>
              从月份进入
            </a>
            <a className="button is-ghost" href={href('/about')}>
              这个项目怎么读
            </a>
          </div>
          <p className="hero-footnote">
            {firstLetter.year}—{lastLetter.year} · {activeYears.length} 个年份有信 ·{' '}
            {archive.meta.totalChars.toLocaleString('zh-CN')} 字
          </p>
        </div>

        <aside className="hero-side" aria-label="全书概览">
          <Postmark />
          <div className="stats">
            <div className="stat">
              <span className="stat-value">{archive.meta.totalLetters}</span>
              <span className="stat-label">封信</span>
            </div>
            <div className="stat">
              <span className="stat-value">{activeYearCount}</span>
              <span className="stat-label">个年份</span>
            </div>
            <div className="stat">
              <span className="stat-value">{archive.meta.activeDays}</span>
              <span className="stat-label">天有信</span>
            </div>
            <div className="stat">
              <span className="stat-value">{multiYearDayCount}</span>
              <span className="stat-label">天不止一年</span>
            </div>
          </div>
          <p className="hero-side-note">
            {archive.meta.fatherSonLetters} 封父子通信
            <br />+ {archive.meta.introLetters} 封引子
          </p>
        </aside>
      </section>

      <div className="container">
        <a className="today-card" href={href(`/day/${todayLetters.length ? todayKey : nextKey}`)}>
          <span className="today-card-kicker">今天 · {todayLabel}</span>
          {todayLetters.length > 0 ? (
            <>
              <span className="today-card-main">
                这一天有 {todayLetters.length} 封信
              </span>
              <span className="today-card-detail">
                {[...new Set(todayLetters.map((letter) => letter.year))].join(' / ')} ·{' '}
                {todayLetters[0].title}
              </span>
            </>
          ) : (
            <>
              <span className="today-card-main">今天没有落笔。</span>
              <span className="today-card-detail">
                下一封有信的日子是 {nextKey ? shortDate(nextKey) : ''}
                {nextLetters.length > 0 &&
                  ` · ${nextLetters[0].year} 年《${nextLetters[0].title}》`}
              </span>
            </>
          )}
          <span className="today-card-arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>

      <div className="container">
        <Heatmap />
      </div>

      <section className="container month-overview" aria-labelledby="months-title">
        <div className="section-head">
          <div>
            <p className="eyebrow">MONTH BY MONTH</p>
            <h2 id="months-title" className="section-title">
              十二个月
            </h2>
          </div>
          <a className="text-link" href={href('/month')}>
            按月阅读 →
          </a>
        </div>
        <div className="month-strip">
          {monthStats.map((month) => (
            <a key={month.month} className="month-pill" href={href(`/month/${month.month}`)}>
              <span className="month-pill-count">{month.count}</span>
              <span className="month-pill-track" aria-hidden="true">
                <span
                  className="month-pill-bar"
                  style={{ height: `${Math.max(8, (month.count / maxMonth) * 100)}%` }}
                />
              </span>
              <span className="month-pill-name">{month.short}</span>
              <span className="month-pill-days">{month.dayCount} 天</span>
            </a>
          ))}
        </div>
        <p className="section-note">
          十月、十一月、八月最密；二月、三月、十二月最疏。日期是固定的，信是断断续续来的。
        </p>
      </section>

      <section className="container home-lower">
        <div className="quote-panel panel">
          <p className="eyebrow">THE RULE · 1946</p>
          <blockquote>
            「我希望在全年里每个月的 1 号和 15
            号能收到你、格格和邦姆比的来信。这些信不应该是敷衍了事的，不应该是诉苦的，也不应该是强迫的，应该是你们尽全力写出来的好信。」
          </blockquote>
          <p className="quote-source">1946 年 6 月 21 日 · 海明威致帕特里克</p>
          <a className="text-link" href={href('/day/06-21')}>
            打开这一天 →
          </a>
        </div>

        <div className="sections-panel panel">
          <p className="eyebrow">THE SHAPE OF THE BOOK</p>
          <h2 className="panel-title">四个部分</h2>
          <div className="section-rows">
            {archive.meta.sections.map((section) => (
              <div key={section.key} className="section-row">
                <div className="section-row-head">
                  <span className="section-row-label">{section.label}</span>
                  <span className="section-row-count">{section.count} 封</span>
                </div>
                <p>{section.caption}</p>
                <span className="section-row-range">{section.range}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

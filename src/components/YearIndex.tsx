import { allYears, archive, byYear, emptyYears } from '../lib/archive'
import type { Letter } from '../types'
import { href } from '../lib/router'

function groupByDay(list: Letter[]): Array<[string, Letter[]]> {
  const map = new Map<string, Letter[]>()
  for (const letter of list) {
    const group = map.get(letter.dateKey)
    if (group) group.push(letter)
    else map.set(letter.dateKey, [letter])
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
}

const decades = [...new Set(allYears.map((year) => Math.floor(year / 10) * 10))]

export function YearIndex() {
  return (
    <>
      <section className="container page-head">
        <p className="eyebrow">THE LONG VIEW · 1925—1961</p>
        <h1 className="page-title">二十九年，二十四个年份有信。</h1>
        <p className="page-lede">
          按原书的顺序，这些信从帕特里克出生前一直写到海明威去世前。可它们不是连续日记：
          有些年份整年空白，有些年份一个月里写好几封。年表把断与续一起摊开。
        </p>
        <div className="year-summary">
          <div>
            <strong>{allYears.length}</strong>
            <span>个年份</span>
          </div>
          <div>
            <strong>{allYears.length - emptyYears.length}</strong>
            <span>年有信</span>
          </div>
          <div>
            <strong>{emptyYears.length}</strong>
            <span>年空白</span>
          </div>
          <div>
            <strong>{archive.meta.activeDays}</strong>
            <span>天有信</span>
          </div>
        </div>
      </section>

      <div className="container year-list">
        {decades.map((decade) => {
          const years = allYears.filter((year) => Math.floor(year / 10) * 10 === decade)
          return (
            <section key={decade} className="decade" aria-labelledby={`decade-${decade}`}>
              <header className="decade-head">
                <h2 id={`decade-${decade}`}>{decade}s</h2>
                <span>
                  {years[0]}—{years[years.length - 1]}
                </span>
              </header>

              <div className="year-rows">
                {years.map((year) => {
                  const list = byYear.get(year) ?? []
                  const days = groupByDay(list)
                  const intro = list.find((letter) => letter.sectionKey === 'intro')
                  const age = year >= 1929 ? year - 1928 : null

                  return (
                    <article key={year} className={`year-row${list.length === 0 ? ' is-empty' : ''}`}>
                      <div className="year-row-head">
                        <h3 className="year-row-year">{year}</h3>
                        {age !== null && <p className="year-row-age">约 {age} 岁</p>}
                      </div>

                      {list.length === 0 ? (
                        <p className="year-row-empty">这一年没有收入信件。</p>
                      ) : (
                        <div className="year-row-main">
                          <p className="year-row-meta">
                            {list.length} 封 · {days.length} 天
                          </p>
                          <div className="year-chips">
                            {days.map(([key, group]) => {
                              const month = Number(key.slice(0, 2))
                              const day = Number(key.slice(3, 5))
                              return (
                                <a
                                  key={key}
                                  className={`year-chip${group.length > 1 ? ' is-multi' : ''}`}
                                  href={href(`/day/${key}`)}
                                  title={`${month}月${day}日 · ${group.length} 封`}
                                >
                                  <span className="year-chip-date">
                                    {month}/{day}
                                  </span>
                                  {group.length > 1 && (
                                    <span className="year-chip-count">{group.length}</span>
                                  )}
                                </a>
                              )
                            })}
                          </div>
                          {intro && (
                            <p className="year-row-note">引子 · {intro.title}</p>
                          )}
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <div className="container">
        <p className="section-note">
          空白年份：{emptyYears.join('、')}。这些年份没有收入父子通信，不代表没有发生事情。
        </p>
      </div>
    </>
  )
}

import { useMemo, useState } from 'react'
import { archive, letters } from '../lib/archive'
import { heatLevel, heatmap, WEEKDAY_LABELS } from '../lib/calendar'
import { href } from '../lib/router'
import type { Letter, SenderRole } from '../types'

type YearFilter = 'all' | number
type SenderFilter = 'all' | SenderRole

function roleOf(letter: Letter): SenderRole {
  if (letter.sectionKey === 'intro') return 'other'
  return letter.sender.includes('帕特里克') ? 'son' : 'father'
}

export function Heatmap() {
  const [yearFilter, setYearFilter] = useState<YearFilter>('all')
  const [senderFilter, setSenderFilter] = useState<SenderFilter>('all')
  const [hovered, setHovered] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      letters.filter((letter) => {
        if (yearFilter !== 'all' && letter.year !== yearFilter) return false
        if (senderFilter !== 'all' && roleOf(letter) !== senderFilter) return false
        return true
      }),
    [yearFilter, senderFilter],
  )

  const groups = useMemo(() => {
    const map = new Map<string, Letter[]>()
    for (const letter of filtered) {
      const group = map.get(letter.dateKey)
      if (group) group.push(letter)
      else map.set(letter.dateKey, [letter])
    }
    return map
  }, [filtered])

  const leapLetters = filtered.filter((letter) => letter.dateKey === '02-29')

  const hoveredGroup = hovered ? (groups.get(hovered) ?? []) : null
  const hoveredDate = hovered
    ? (() => {
        const [month, day] = hovered.split('-').map(Number)
        return `${month}月${day}日`
      })()
    : null
  const hoveredLeap =
    hovered === '02-28' && leapLetters.length > 0
      ? `；闰日 2 月 29 日另有 ${leapLetters.length} 封`
      : ''

  const readout = hoveredDate
    ? hoveredGroup && hoveredGroup.length > 0
      ? `${hoveredDate} · ${hoveredGroup.length} 封 · ${[...new Set(hoveredGroup.map((letter) => letter.year))].join(' / ')}${hoveredLeap}`
      : `${hoveredDate} · 没有信${hoveredLeap}`
    : `共 ${filtered.length} 封 · ${groups.size} 个有信的日子 · 点一格看这一天的所有年份`

  const filterActive = yearFilter !== 'all' || senderFilter !== 'all'

  return (
    <section className="heatmap-panel panel" aria-labelledby="heatmap-title">
      <div className="panel-head heatmap-head">
        <div>
          <p className="eyebrow">THE YEAR, OVERLAID</p>
          <h2 id="heatmap-title" className="panel-title">
            一年 · 365 天
          </h2>
          <p className="panel-note">
            每一格不是某一年的一天，而是所有年份里的同一天。颜色越深，这一天收到的信越多。
          </p>
        </div>
        <div className="heatmap-summary">
          <strong>{filtered.length}</strong>
          <span>封信</span>
          <i aria-hidden="true">/</i>
          <strong>{groups.size}</strong>
          <span>天有信</span>
        </div>
      </div>

      <div className="heatmap-toolbar">
        <label className="filter-control">
          <span>年份</span>
          <select
            value={yearFilter}
            onChange={(event) =>
              setYearFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))
            }
          >
            <option value="all">全部年份</option>
            {archive.meta.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <div className="segmented" role="group" aria-label="按写信人筛选">
          {(
            [
              ['all', '全部'],
              ['father', '父亲'],
              ['son', '儿子'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={senderFilter === value ? 'is-active' : ''}
              aria-pressed={senderFilter === value}
              onClick={() => setSenderFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {filterActive && (
          <button
            type="button"
            className="reset-filter"
            onClick={() => {
              setYearFilter('all')
              setSenderFilter('all')
            }}
          >
            清除筛选
          </button>
        )}
      </div>

      <p className={`heatmap-readout${hovered ? ' is-live' : ''}`} aria-live="polite">
        {readout}
      </p>

      <div className="heatmap-scroll">
        <div className="heatmap-inner">
          <div className="heatmap-months" aria-hidden="true">
            {heatmap.monthLabels.map((month) => (
              <span
                key={month.month}
                className="heatmap-month-label"
                style={{ gridColumn: `${month.week + 1} / span 4` }}
              >
                {month.short}
              </span>
            ))}
          </div>
          <div className="heatmap-body">
            <div className="heatmap-weekdays" aria-hidden="true">
              {WEEKDAY_LABELS.map((label, index) => (
                <span key={label}>{index === 0 || index === 2 || index === 4 ? label : ''}</span>
              ))}
            </div>
            <div className="heatmap-grid" role="grid" aria-label="365 天里的写信日子">
              {heatmap.cells.map((cell, index) => {
                if (!cell) {
                  return <span key={`empty-${index}`} className="heat-cell is-outside" />
                }
                const group = groups.get(cell.key) ?? []
                const count = group.length
                const years = [...new Set(group.map((letter) => letter.year))]
                const level = heatLevel(count)
                const ruleDay = cell.day === 1 || cell.day === 15
                const multi = years.length > 1
                const leapMarker = cell.key === '02-28' && leapLetters.length > 0
                const label = `${cell.month}月${cell.day}日，${
                  count === 0 ? '没有信' : `${count} 封信，${years.join('、')} 年`
                }${leapMarker ? `；另有闰日 2 月 29 日的 ${leapLetters.length} 封信` : ''}`

                return (
                  <a
                    key={cell.key}
                    className={[
                      'heat-cell',
                      `level-${level}`,
                      ruleDay ? 'is-rule-day' : '',
                      multi ? 'is-multi' : '',
                      leapMarker ? 'has-leap' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    href={href(`/day/${cell.key}`)}
                    aria-label={label}
                    title={label}
                    onMouseEnter={() => setHovered(cell.key)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(cell.key)}
                    onBlur={() => setHovered(null)}
                  >
                    {ruleDay && <span className="rule-tick" aria-hidden="true" />}
                    {multi && <span className="multi-pip" aria-hidden="true" />}
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="heatmap-foot">
        <div className="legend" aria-label="颜色图例">
          <span className="legend-label">少</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} className={`legend-cell level-${level}`} aria-hidden="true" />
          ))}
          <span className="legend-label">多</span>
        </div>
        <span className="legend-note">
          <span className="rule-tick is-static" aria-hidden="true" /> 每月 1 / 15 日 · 海明威的写信规矩
        </span>
        <span className="legend-note">
          <span className="multi-pip is-static" aria-hidden="true" /> 这一天不止一个年份
        </span>
        {leapLetters.length > 0 && (
          <>
            <span className="legend-note">
              <span className="leap-swatch" aria-hidden="true" /> 虚线格：2 月另有闰日来信
            </span>
            <a className="leap-note" href={href('/day/02-29')}>
              闰日 2 月 29 日 · 另有 {leapLetters.length} 封 →
            </a>
          </>
        )}
      </div>
    </section>
  )
}

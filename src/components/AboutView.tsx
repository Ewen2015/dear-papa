import { archive, letters, multiYearDayKeys, senderRole } from '../lib/archive'
import { href } from '../lib/router'

const approximate = letters.filter((letter) => letter.precision !== 'day')
const fatherCount = letters.filter((letter) => senderRole(letter) === 'father').length
const sonCount = letters.filter((letter) => senderRole(letter) === 'son').length
const longest = [...letters].sort((a, b) => b.charCount - a.charCount)[0]
const shortest = [...letters].sort((a, b) => a.charCount - b.charCount)[0]
const average = Math.round(archive.meta.totalChars / archive.meta.totalLetters)

const ENTRY_KEYS = ['1946-06-21', '1952-09-22', '1961-03-22'] as const
const ENTRY_LABELS = ['一条规矩', '一次勘察', '最后一封'] as const
const ENTRY_EXCERPTS = [
  '我希望在全年里每个月的 1 号和 15 号能收到你、格格和邦姆比的来信。',
  '地面侦察值一千条新闻报道。比如，你能够在报纸上读到在某地一切都安稳平静，而对两个月里发生的两次持枪抢劫绝口不提。',
  '这里的情况不好，观景庄的情况也不好，我的心情也不好，不过，写这封信也许能使我的心情有所好转。',
] as const

const entries = ENTRY_KEYS.flatMap((key, index) => {
  const letter = letters.find((item) => item.date === key)
  return letter ? [{ letter, label: ENTRY_LABELS[index], excerpt: ENTRY_EXCERPTS[index] }] : []
})

function landedOn(key: string): string {
  const month = Number(key.slice(0, 2))
  const day = Number(key.slice(3, 5))
  return `${month} 月 ${day} 日`
}

export function AboutView() {
  return (
    <>
      <section className="container page-head">
        <p className="eyebrow">ABOUT · 一年</p>
        <h1 className="page-title">把书摊开，重新按日子读。</h1>
        <p className="page-lede">
          《亲爱的老爸》原本按年份编排。这个站点把它拆成 {archive.meta.totalLetters}{' '}
          封信，再按「月—日」叠回一个固定的 365 天。它不是原书的替代品，只是给重读换一个入口。
        </p>
      </section>

      <div className="container about-grid">
        <section className="about-panel panel">
          <p className="eyebrow">WHY A YEAR</p>
          <h2 className="panel-title">为什么是 365 天</h2>
          <p>
            父子通信跨了二十九年（1925—1961）。按年份读，日子是线性的；按一年读，同一天会在不同年份里反复出现。
            有些日子只写过一次，有些日子在三个年份里都有信——把它们并排，才能看见这种重复。
          </p>
          <p>
            固定骨架取 2026 年（平年），星期几只作参照，不对应原信真实的星期。
            2 月 29 日不在这 365 格里，单独收在闰日页，否则它会被 2 月 28 日吞掉。
          </p>
        </section>

        <section className="about-panel panel">
          <p className="eyebrow">HOW TO READ</p>
          <h2 className="panel-title">四种读法</h2>
          <ol className="mode-list">
            <li>
              <span className="mode-index">01</span>
              <div>
                <h3>热力图</h3>
                <p>
                  一格是「一年里的同一天」。颜色越深，这一天信越多；角上的小点表示不止一个年份。
                  点开一格，这一天的所有年份都在里面。
                </p>
              </div>
            </li>
            <li>
              <span className="mode-index">02</span>
              <div>
                <h3>一天</h3>
                <p>
                  一页里按年份从上往下排。左边年份栏可以跳到任意一封；没有信的日子会指向最近的有信日。
                </p>
              </div>
            </li>
            <li>
              <span className="mode-index">03</span>
              <div>
                <h3>一个月</h3>
                <p>
                  月历给出这一月的密度，下面再按日期逐天列出。先看形状，再读文字。
                </p>
              </div>
            </li>
            <li>
              <span className="mode-index">04</span>
              <div>
                <h3>年表</h3>
                <p>
                  1925—1961 的断与续。哪几年整年空白，哪几年一天写好几封，一眼能看到。
                </p>
              </div>
            </li>
          </ol>
        </section>
      </div>

      <section className="container about-panel panel" aria-labelledby="precision-title">
        <p className="eyebrow">DATES & PRECISION</p>
        <h2 id="precision-title" className="panel-title">
          日期不是全都确切
        </h2>
        <p>
          大部分信有确切日期；{approximate.length} 封只能推定到月末、季节或邮戳。为了放进 365
          天，每封取一个落点，并在页面上标「日期推定」。落点不是伪造的日期，只是索引的位置。
        </p>
        <div className="precision-list">
          {approximate.map((letter) => (
            <a key={letter.id} className="precision-row" href={href(`/day/${letter.dateKey}`)}>
              <span className="precision-date">{letter.displayDate}</span>
              <span className="precision-body">
                <span className="precision-title">{letter.title}</span>
                <span className="precision-note">{letter.dateNote}</span>
              </span>
              <span className="precision-landing">落点 {landedOn(letter.dateKey)}</span>
            </a>
          ))}
        </div>
        {archive.meta.leapLetters > 0 && (
          <p className="precision-leap">
            另有 {archive.meta.leapLetters} 封写于闰日：
            <a href={href('/day/02-29')}>1952 年 2 月 29 日 →</a>
          </p>
        )}
      </section>

      <section className="container about-panel panel" aria-labelledby="numbers-title">
        <p className="eyebrow">BY THE NUMBERS</p>
        <h2 id="numbers-title" className="panel-title">
          这本档案的几个数字
        </h2>
        <div className="figure-grid">
          <div className="figure">
            <strong>{archive.meta.totalLetters}</strong>
            <span>封信</span>
            <small>
              {archive.meta.fatherSonLetters} 封父子通信 + {archive.meta.introLetters} 封引子
            </small>
          </div>
          <div className="figure">
            <strong>
              {fatherCount} / {sonCount}
            </strong>
            <span>父亲 / 儿子</span>
            <small>按写信人统计</small>
          </div>
          <div className="figure">
            <strong>{archive.meta.totalChars.toLocaleString('zh-CN')}</strong>
            <span>字</span>
            <small>平均约 {average.toLocaleString('zh-CN')} 字一封</small>
          </div>
          <div className="figure">
            <strong>{archive.meta.activeDays}</strong>
            <span>天有信</span>
            <small>{multiYearDayKeys.length} 天不止一个年份</small>
          </div>
          <div className="figure">
            <strong>
              {archive.meta.years.length} / {archive.meta.yearRange[1] - archive.meta.yearRange[0] + 1}
            </strong>
            <span>年有信</span>
            <small>
              {archive.meta.yearRange[0]}—{archive.meta.yearRange[1]}
            </small>
          </div>
          <div className="figure">
            <strong>
              {longest.charCount.toLocaleString('zh-CN')} / {shortest.charCount}
            </strong>
            <span>最长 / 最短（字）</span>
            <small>
              <a href={href(`/day/${longest.dateKey}`)}>{longest.displayDate}</a>
              {' · '}
              <a href={href(`/day/${shortest.dateKey}`)}>{shortest.displayDate}</a>
            </small>
          </div>
        </div>
      </section>

      <section className="container about-panel panel" aria-labelledby="entries-title">
        <p className="eyebrow">THREE DOORS IN</p>
        <h2 id="entries-title" className="panel-title">
          如果不知道从哪一天开始
        </h2>
        <div className="entry-list">
          {entries.map(({ letter, label, excerpt }) => (
            <a key={letter.id} className="entry-card" href={href(`/day/${letter.dateKey}`)}>
              <span className="entry-label">{label}</span>
              <span className="entry-date">{letter.displayDate}</span>
              <strong>{letter.title}</strong>
              <span className="entry-excerpt">{excerpt}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="container about-panel panel" aria-labelledby="source-title">
        <p className="eyebrow">SOURCE & CREDIT</p>
        <h2 id="source-title" className="panel-title">
          来源与版权
        </h2>
        <div className="source-grid">
          <div>
            <h3>中文版</h3>
            <p>
              《{archive.meta.title}》
              <br />
              {archive.meta.authors.join('、')} 著
              <br />
              布伦丹·海明威、斯蒂芬·亚当斯 编
              <br />
              {archive.meta.translator} 译
              <br />
              {archive.meta.publisher}，{archive.meta.edition}
            </p>
          </div>
          <div>
            <h3>英文原书</h3>
            <p>
              {archive.meta.originalTitle}
              <br />
              Edited by Brendan Hemingway and Stephen Adams
            </p>
            <h3>文本处理</h3>
            <p>
              正文由 EPUB 提取后解析，保留原书注（标为「原书注」）与编者补注（方括号［］）。
              排版与纸书可能有出入，引用请以正式出版物为准。
            </p>
          </div>
        </div>
        <p className="source-copy">
          仓库为私有，全文仅作个人阅读与研究，不对外分发。本站代码与结构化数据由 Vite + React +
          TypeScript 构建；解析脚本见 <code>scripts/parse-book.mjs</code>，可运行{' '}
          <code>npm run parse</code> 重新生成 <code>src/data/letters.json</code>。
        </p>
        <p className="source-mark" aria-hidden="true">
          （.）
        </p>
      </section>
    </>
  )
}

import type { Letter } from '../types'

function renderInline(text: string, letter: Letter) {
  const parts = text.split(/(\[\d+\]|［[^］]*］)/g)
  return parts.map((part, index) => {
    const footnote = part.match(/^\[(\d+)\]$/)
    if (footnote) {
      const number = Number(footnote[1])
      const note = letter.footnotes.find((item) => item.n === number)
      if (note) {
        return (
          <sup key={index} className="fn-ref" title={note.text}>
            {number}
          </sup>
        )
      }
      return <span key={index}>{part}</span>
    }
    if (part.startsWith('［') && part.endsWith('］')) {
      return (
        <span key={index} className="editorial">
          {part}
        </span>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export function LetterReading({ letter }: { letter: Letter }) {
  const approximate = letter.precision !== 'day'

  return (
    <article className="letter-card" aria-labelledby={`letter-title-${letter.id}`}>
      <div className="letter-kicker">
        <span>{letter.section}</span>
        {approximate && <span className="badge">日期推定</span>}
        {letter.age && <span className="badge badge-quiet">帕特里克 {letter.age} 岁</span>}
      </div>

      <h2 className="letter-title" id={`letter-title-${letter.id}`}>
        {letter.title}
      </h2>

      <p className="letter-byline">
        <strong>{letter.sender}</strong>
        <span className="byline-arrow" aria-hidden="true">
          →
        </span>
        <span>{letter.recipient}</span>
      </p>

      <p className="letter-place">
        {letter.displayDate}
        {letter.place && (
          <>
            <span className="dot-sep" aria-hidden="true">
              ·
            </span>
            {letter.place}
          </>
        )}
      </p>

      {letter.dateNote && <p className="date-note">{letter.dateNote}</p>}

      {letter.headnote.length > 0 && (
        <p className="letter-headnote">{letter.headnote.join(' · ')}</p>
      )}

      <div className="letter-body">
        {letter.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={/^(最?亲爱的|我亲爱的)/.test(paragraph) ? 'letter-salutation' : undefined}
          >
            {renderInline(paragraph, letter)}
          </p>
        ))}
      </div>

      {letter.footnotes.length > 0 && (
        <div className="letter-footnotes">
          <p className="footnotes-title">原书注</p>
          {letter.footnotes.map((note) => (
            <p key={note.n}>
              <sup>{note.n}</sup>
              {note.text}
            </p>
          ))}
        </div>
      )}

      <p className="letter-endnote">
        <span>约 {Math.round(letter.charCount / 100) / 10} 千字</span>
        <span className="dot-sep" aria-hidden="true">
          ·
        </span>
        <span>原信 {letter.displayDate}</span>
        <span className="endmark" aria-hidden="true">
          （.）
        </span>
      </p>
    </article>
  )
}

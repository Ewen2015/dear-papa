const TICKS = Array.from({ length: 24 }, (_, index) => {
  const angle = (index * 15 * Math.PI) / 180
  const inner = 47
  const outer = 55
  return {
    x1: 70 + Math.cos(angle) * inner,
    y1: 70 + Math.sin(angle) * inner,
    x2: 70 + Math.cos(angle) * outer,
    y2: 70 + Math.sin(angle) * outer,
  }
})

export function Postmark() {
  return (
    <div className="postmark" aria-hidden="true">
      <svg viewBox="0 0 140 140" role="presentation">
        <circle cx="70" cy="70" r="63" className="postmark-ring" />
        <circle cx="70" cy="70" r="58" className="postmark-ring-inner" />
        {TICKS.map((tick, index) => (
          <line key={index} {...tick} className="postmark-tick" />
        ))}
        <text x="70" y="18" textAnchor="middle" className="postmark-cap">
          每月
        </text>
        <text x="70" y="72" textAnchor="middle" className="postmark-number">
          1·15
        </text>
        <text x="70" y="94" textAnchor="middle" className="postmark-cap">
          一年二十四封
        </text>
        <text x="70" y="128" textAnchor="middle" className="postmark-cap">
          DEAR PAPA
        </text>
      </svg>
    </div>
  )
}

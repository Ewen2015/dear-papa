import { href, type Route } from '../lib/router'
import { todayKey, todayLabel } from '../lib/archive'

const NAV = [
  { label: '一年', path: '/', section: 'year' },
  { label: '月份', path: '/month', section: 'month' },
  { label: '年表', path: '/years', section: 'years' },
  { label: '关于', path: '/about', section: 'about' },
] as const

function activeSection(route: Route): string {
  if (route.name === 'home' || route.name === 'day') return 'year'
  if (route.name === 'month' || route.name === 'monthIndex') return 'month'
  if (route.name === 'years') return 'years'
  if (route.name === 'about') return 'about'
  return ''
}

export function SiteHeader({ route }: { route: Route }) {
  const active = activeSection(route)

  return (
    <header className="site-header">
      <a className="brand" href={href('/')} aria-label="亲爱的老爸，回到一年">
        <span className="brand-en">DEAR PAPA</span>
        <span className="brand-zh">亲爱的老爸</span>
        <span className="brand-sub">海明威父子家书 · 1925—1961</span>
      </a>

      <nav className="nav" aria-label="主导航">
        {NAV.map((item) => (
          <a
            key={item.section}
            className={`nav-link${active === item.section ? ' is-active' : ''}`}
            href={href(item.path)}
            aria-current={active === item.section ? 'page' : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <a className="today-link" href={href(`/day/${todayKey}`)}>
        <span className="today-link-label">今天</span>
        <span>{todayLabel}</span>
      </a>
    </header>
  )
}

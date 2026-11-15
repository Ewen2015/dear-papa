import { useEffect, useState } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'day'; key: string }
  | { name: 'monthIndex' }
  | { name: 'month'; month: number }
  | { name: 'years' }
  | { name: 'about' }
  | { name: 'notFound'; path: string }

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '').split('?')[0] || '/'
  const parts = path.split('/').filter(Boolean)

  if (parts.length === 0) return { name: 'home' }

  if (parts[0] === 'day' && parts[1] && /^\d{2}-\d{2}$/.test(parts[1])) {
    return { name: 'day', key: parts[1] }
  }

  if (parts[0] === 'month') {
    if (!parts[1]) return { name: 'monthIndex' }
    const month = Number(parts[1])
    if (Number.isInteger(month) && month >= 1 && month <= 12) {
      return { name: 'month', month }
    }
  }

  if (parts[0] === 'years') return { name: 'years' }
  if (parts[0] === 'about') return { name: 'about' }

  return { name: 'notFound', path }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    parseRoute(typeof window === 'undefined' ? '/' : window.location.hash),
  )

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute(window.location.hash))
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}

export function href(path: string): string {
  return `#${path.startsWith('/') ? path : `/${path}`}`
}

import { useEffect } from 'react'
import { AboutView } from './components/AboutView'
import { DayView } from './components/DayView'
import { HomeView } from './components/HomeView'
import { MonthIndex } from './components/MonthIndex'
import { MonthView } from './components/MonthView'
import { NotFound } from './components/NotFound'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { YearIndex } from './components/YearIndex'
import { MONTHS } from './lib/calendar'
import { useRoute, type Route } from './lib/router'

function pageTitle(route: Route): string {
  switch (route.name) {
    case 'home':
      return '亲爱的老爸 · 一年'
    case 'day': {
      const month = Number(route.key.slice(0, 2))
      const day = Number(route.key.slice(3, 5))
      return `${month}月${day}日 · 亲爱的老爸`
    }
    case 'monthIndex':
      return '月份 · 亲爱的老爸'
    case 'month':
      return `${MONTHS[route.month - 1].zh} · 亲爱的老爸`
    case 'years':
      return '年表 · 亲爱的老爸'
    case 'about':
      return '关于 · 亲爱的老爸'
    case 'notFound':
      return '未找到 · 亲爱的老爸'
  }
}

function View({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <HomeView />
    case 'day':
      return <DayView dayKey={route.key} />
    case 'monthIndex':
      return <MonthIndex />
    case 'month':
      return <MonthView month={route.month} />
    case 'years':
      return <YearIndex />
    case 'about':
      return <AboutView />
    case 'notFound':
      return <NotFound path={route.path} />
  }
}

function App() {
  const route = useRoute()

  useEffect(() => {
    document.title = pageTitle(route)
  }, [route])

  return (
    <div className="site">
      <SiteHeader route={route} />
      <main className="site-main">
        <View route={route} />
      </main>
      <SiteFooter />
    </div>
  )
}

export default App

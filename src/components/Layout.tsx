import { NavLink, Outlet } from 'react-router-dom'
import { Bike, Gauge, Cog, Ruler, LayoutDashboard } from 'lucide-react'
import { useLang, type Lang } from '../lib/i18n/context'
import type { Dict } from '../lib/i18n/da'

function navItems(t: Dict) {
  return [
    { to: '/', label: t.nav.overview, icon: LayoutDashboard, end: true },
    { to: '/sliddele', label: t.nav.maintenance, icon: Bike, end: false },
    { to: '/daektryk', label: t.nav.tirePressure, icon: Gauge, end: false },
    { to: '/gear', label: t.nav.gear, icon: Cog, end: false },
    { to: '/bikefit', label: t.nav.bikefit, icon: Ruler, end: false },
  ]
}

function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const options: { value: Lang; label: string }[] = [
    { value: 'da', label: 'DA' },
    { value: 'en', label: 'EN' },
  ]
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-slate-900 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => setLang(o.value)}
          aria-pressed={lang === o.value}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            lang === o.value ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Layout() {
  const { t } = useLang()
  const NAV_ITEMS = navItems(t)

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Bike size={18} className="text-white" />
            </span>
            <span className="text-base font-semibold tracking-tight">Cykel-App</span>
          </div>
          <div className="flex items-center gap-3">
            <nav className="hidden gap-1 sm:flex">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand-600/20 text-brand-300' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-5 sm:pb-10">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-800 bg-slate-950/95 backdrop-blur sm:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                isActive ? 'text-brand-400' : 'text-slate-500'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

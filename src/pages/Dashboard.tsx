import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Bike, Gauge, Cog, Ruler, HeartPulse, ArrowRight } from 'lucide-react'
import { useAppStore, totalKmForBike, componentWearPct, componentDisplayLabel } from '../store/useAppStore'
import { Badge, Card, EmptyState, SectionTitle, Button } from '../components/ui'
import { fmtKm } from '../lib/format'
import { useLang } from '../lib/i18n/context'

export default function Dashboard() {
  const { t, locale } = useLang()
  const bikes = useAppStore((s) => s.bikes)
  const rides = useAppStore((s) => s.rides)
  const components = useAppStore((s) => s.components)

  const TOOLS = [
    { to: '/sliddele', label: t.dashboard.tools.maintenance.label, desc: t.dashboard.tools.maintenance.desc, icon: Bike },
    { to: '/daektryk', label: t.dashboard.tools.tirePressure.label, desc: t.dashboard.tools.tirePressure.desc, icon: Gauge },
    { to: '/gear', label: t.dashboard.tools.gear.label, desc: t.dashboard.tools.gear.desc, icon: Cog },
    { to: '/bikefit', label: t.dashboard.tools.bikefit.label, desc: t.dashboard.tools.bikefit.desc, icon: Ruler },
    { to: '/traening', label: t.dashboard.tools.training.label, desc: t.dashboard.tools.training.desc, icon: HeartPulse },
  ]

  const stats = useMemo(() => {
    const totalKm = bikes.reduce((sum, b) => sum + totalKmForBike(rides, b.id), 0)
    const attention = bikes.flatMap((b) => {
      const km = totalKmForBike(rides, b.id)
      return components
        .filter((c) => c.bikeId === b.id && c.active)
        .map((c) => ({ bike: b, component: c, pct: componentWearPct(km, c) }))
        .filter((x) => x.pct >= 80)
    })
    attention.sort((a, b) => b.pct - a.pct)
    return { totalKm, attention }
  }, [bikes, rides, components])

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle subtitle={t.dashboard.subtitle}>{t.dashboard.title}</SectionTitle>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.dashboard.bikesLabel}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-100">{bikes.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.dashboard.totalKmLabel}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-100">{fmtKm(stats.totalKm, locale)}</p>
        </Card>
      </div>

      <div>
        <SectionTitle>{t.dashboard.attentionTitle}</SectionTitle>
        {stats.attention.length === 0 ? (
          <EmptyState
            title={t.dashboard.allGoodTitle}
            description={bikes.length === 0 ? t.dashboard.allGoodDescNoBikes : t.dashboard.allGoodDescNoIssues}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {stats.attention.map(({ bike, component, pct }) => (
              <Link key={component.id} to={`/sliddele/${bike.id}`}>
                <Card className="flex items-center justify-between hover:border-brand-600">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={16} className={pct >= 100 ? 'text-red-400' : 'text-amber-400'} />
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        {componentDisplayLabel(component, t.componentTypes)} · {bike.name}
                      </p>
                      <p className="text-xs text-slate-500">{t.disciplines[bike.discipline]}</p>
                    </div>
                  </div>
                  <Badge tone={pct >= 100 ? 'danger' : 'warn'}>{Math.round(pct)}%</Badge>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionTitle>{t.dashboard.toolsTitle}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <Link key={tool.to} to={tool.to}>
              <Card className="flex items-center justify-between hover:border-brand-600">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600/15 text-brand-400">
                    <tool.icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{tool.label}</p>
                    <p className="text-xs text-slate-500">{tool.desc}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-600" />
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {bikes.length === 0 && (
        <Link to="/sliddele">
          <Button className="w-full sm:w-auto">{t.dashboard.getStarted}</Button>
        </Link>
      )}
    </div>
  )
}

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Bike, Gauge, Cog, Ruler, ArrowRight } from 'lucide-react'
import { useAppStore, totalKmForBike, componentWearPct, componentDisplayLabel } from '../store/useAppStore'
import { DISCIPLINES } from '../types'
import { Badge, Card, EmptyState, SectionTitle, Button } from '../components/ui'
import { fmtKm } from '../lib/format'

const TOOLS = [
  { to: '/sliddele', label: 'Sliddele', desc: 'Km-tracking på kæde, dæk, klodser m.m.', icon: Bike },
  { to: '/daektryk', label: 'Dæktryk', desc: 'Beregn dæktryk ud fra vægt og underlag', icon: Gauge },
  { to: '/gear', label: 'Gear', desc: 'Udveksling, udrulning og hastighed', icon: Cog },
  { to: '/bikefit', label: 'Bikefit', desc: 'Sadelhøjde og rammestørrelse', icon: Ruler },
]

export default function Dashboard() {
  const bikes = useAppStore((s) => s.bikes)
  const rides = useAppStore((s) => s.rides)
  const components = useAppStore((s) => s.components)

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
      <SectionTitle subtitle="Din samlede base for cykling: sliddele, dæktryk, gear og bikefit.">Oversigt</SectionTitle>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Cykler</p>
          <p className="mt-1 text-3xl font-semibold text-slate-100">{bikes.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Samlede km logget</p>
          <p className="mt-1 text-3xl font-semibold text-slate-100">{fmtKm(stats.totalKm)}</p>
        </Card>
      </div>

      <div>
        <SectionTitle>Kræver opmærksomhed</SectionTitle>
        {stats.attention.length === 0 ? (
          <EmptyState
            title="Alt ser fint ud"
            description={bikes.length === 0 ? 'Tilføj en cykel for at begynde at spore sliddele.' : 'Ingen sliddele nærmer sig deres forventede levetid lige nu.'}
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
                        {componentDisplayLabel(component)} · {bike.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {DISCIPLINES.find((d) => d.value === bike.discipline)?.label}
                      </p>
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
        <SectionTitle>Værktøjer</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOOLS.map((t) => (
            <Link key={t.to} to={t.to}>
              <Card className="flex items-center justify-between hover:border-brand-600">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600/15 text-brand-400">
                    <t.icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{t.label}</p>
                    <p className="text-xs text-slate-500">{t.desc}</p>
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
          <Button className="w-full sm:w-auto">Kom i gang — tilføj din første cykel</Button>
        </Link>
      )}
    </div>
  )
}

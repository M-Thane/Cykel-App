import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, AlertTriangle } from 'lucide-react'
import { useAppStore, totalKmForBike, componentWearPct } from '../store/useAppStore'
import { DISCIPLINES, type Discipline } from '../types'
import { Button, Card, EmptyState, Field, Input, Select, SectionTitle } from '../components/ui'
import { fmtKm } from '../lib/format'

export default function Maintenance() {
  const bikes = useAppStore((s) => s.bikes)
  const components = useAppStore((s) => s.components)
  const rides = useAppStore((s) => s.rides)
  const addBike = useAppStore((s) => s.addBike)

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [discipline, setDiscipline] = useState<Discipline>('landevej')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addBike(name.trim(), discipline)
    setName('')
    setDiscipline('landevej')
    setShowForm(false)
  }

  const bikeStats = useMemo(() => {
    return bikes.map((bike) => {
      const km = totalKmForBike(rides, bike.id)
      const bikeComponents = components.filter((c) => c.bikeId === bike.id && c.active)
      const overdue = bikeComponents.filter((c) => componentWearPct(km, c) >= 100).length
      const soon = bikeComponents.filter((c) => {
        const p = componentWearPct(km, c)
        return p >= 80 && p < 100
      }).length
      return { bike, km, overdue, soon, componentCount: bikeComponents.length }
    })
  }, [bikes, components, rides])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <SectionTitle subtitle="Hold styr på hvor mange km dine sliddele har kørt, cykel for cykel.">
          Mine cykler
        </SectionTitle>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} /> Ny cykel
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Navn">
              <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="fx Canyon Endurace" />
            </Field>
            <Field label="Type cykling">
              <Select value={discipline} onChange={(e) => setDiscipline(e.target.value as Discipline)}>
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex gap-2">
              <Button type="submit">Opret</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Annuller
              </Button>
            </div>
          </form>
        </Card>
      )}

      {bikes.length === 0 ? (
        <EmptyState
          title="Ingen cykler endnu"
          description="Tilføj din første cykel for at begynde at tracke km og sliddele."
          action={
            !showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus size={16} /> Tilføj cykel
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {bikeStats.map(({ bike, km, overdue, soon, componentCount }) => (
            <Link key={bike.id} to={`/sliddele/${bike.id}`}>
              <Card className="flex items-center justify-between transition-colors hover:border-brand-600">
                <div>
                  <p className="font-medium text-slate-100">{bike.name}</p>
                  <p className="text-sm text-slate-500">
                    {DISCIPLINES.find((d) => d.value === bike.discipline)?.label} · {fmtKm(km)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {componentCount} sliddele
                    {overdue > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 text-red-400">
                        <AlertTriangle size={12} /> {overdue} skal skiftes
                      </span>
                    )}
                    {overdue === 0 && soon > 0 && <span className="ml-2 text-amber-400">{soon} snart</span>}
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-600" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

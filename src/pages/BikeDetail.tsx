import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, RefreshCw, Trash2, Pencil, History } from 'lucide-react'
import {
  useAppStore,
  totalKmForBike,
  componentCurrentKm,
  componentWearPct,
  componentDisplayLabel,
} from '../store/useAppStore'
import { DISCIPLINES, type ComponentType, type Discipline } from '../types'
import { COMPONENT_DEFS, defaultLifespan } from '../lib/componentDefs'
import { Badge, Button, Card, EmptyState, Field, Input, ProgressBar, SectionTitle, Select } from '../components/ui'
import { fmtDate, fmtKm, todayIso } from '../lib/format'

function wearBadge(pct: number) {
  if (pct >= 100) return <Badge tone="danger">Skift nu</Badge>
  if (pct >= 80) return <Badge tone="warn">Snart</Badge>
  return <Badge tone="ok">OK</Badge>
}

export default function BikeDetail() {
  const { bikeId } = useParams()
  const navigate = useNavigate()
  const bike = useAppStore((s) => s.bikes.find((b) => b.id === bikeId))
  const allRides = useAppStore((s) => s.rides)
  const allComponents = useAppStore((s) => s.components)
  const { updateBike, removeBike, addRide, removeRide, addComponent, replaceComponent, removeComponent, updateComponent } =
    useAppStore()

  const rides = useMemo(() => allRides.filter((r) => r.bikeId === bikeId), [allRides, bikeId])
  const components = useMemo(() => allComponents.filter((c) => c.bikeId === bikeId), [allComponents, bikeId])

  const [rideKm, setRideKm] = useState('')
  const [rideDate, setRideDate] = useState(todayIso())
  const [rideNote, setRideNote] = useState('')

  const [showAddComponent, setShowAddComponent] = useState(false)
  const [newType, setNewType] = useState<ComponentType>('kaede')
  const [newLabel, setNewLabel] = useState('')
  const [newLifespan, setNewLifespan] = useState(String(defaultLifespan('kaede')))
  const [newInstalledKm, setNewInstalledKm] = useState('')
  const [newInstalledDate, setNewInstalledDate] = useState(todayIso())

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLifespan, setEditLifespan] = useState('')
  const [editLabel, setEditLabel] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const km = useMemo(() => (bikeId ? totalKmForBike(rides, bikeId) : 0), [rides, bikeId])
  const active = components.filter((c) => c.active)
  const inactive = components.filter((c) => !c.active)
  const sortedRides = [...rides].sort((a, b) => b.date.localeCompare(a.date))

  if (!bike || !bikeId) {
    return (
      <EmptyState
        title="Cykel ikke fundet"
        action={
          <Link to="/sliddele">
            <Button>Tilbage til cykler</Button>
          </Link>
        }
      />
    )
  }

  function submitRide(e: React.FormEvent) {
    e.preventDefault()
    const val = parseFloat(rideKm.replace(',', '.'))
    if (!val || val <= 0) return
    addRide(bikeId!, val, rideDate, rideNote.trim() || undefined)
    setRideKm('')
    setRideNote('')
  }

  function submitComponent(e: React.FormEvent) {
    e.preventDefault()
    const lifespan = parseFloat(newLifespan.replace(',', '.')) || defaultLifespan(newType)
    const installedOverride = newInstalledKm.trim() ? parseFloat(newInstalledKm.replace(',', '.')) : undefined
    addComponent(bikeId!, newType, {
      customLabel: newLabel.trim() || undefined,
      lifespanKm: lifespan,
      installedAtDate: newInstalledDate,
      installedAtKmOverride: installedOverride,
    })
    setShowAddComponent(false)
    setNewLabel('')
    setNewInstalledKm('')
    setNewInstalledDate(todayIso())
  }

  function startEdit(id: string, lifespanKm: number, label: string) {
    setEditingId(id)
    setEditLifespan(String(lifespanKm))
    setEditLabel(label)
  }

  function saveEdit(id: string) {
    const lifespan = parseFloat(editLifespan.replace(',', '.'))
    updateComponent(id, {
      lifespanKm: lifespan > 0 ? lifespan : undefined,
      customLabel: editLabel.trim() || undefined,
    })
    setEditingId(null)
  }

  function handleDeleteBike() {
    if (!bike) return
    if (confirm(`Slet "${bike.name}" og alt tilhørende data? Dette kan ikke fortrydes.`)) {
      removeBike(bike.id)
      navigate('/sliddele')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link to="/sliddele" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft size={14} /> Alle cykler
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">{bike.name}</h1>
            <p className="text-sm text-slate-500">
              {DISCIPLINES.find((d) => d.value === bike.discipline)?.label} · {fmtKm(km)} i alt
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={bike.discipline}
              onChange={(e) => updateBike(bike.id, { discipline: e.target.value as Discipline })}
              className="w-auto"
            >
              {DISCIPLINES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
            <Button variant="danger" onClick={handleDeleteBike}>
              <Trash2 size={15} />
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <SectionTitle subtitle="Log dine ture for at opdatere km på cyklen og alle aktive sliddele.">Kør log</SectionTitle>
        <form onSubmit={submitRide} className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end">
          <Field label="Km">
            <Input
              inputMode="decimal"
              placeholder="fx 42.5"
              value={rideKm}
              onChange={(e) => setRideKm(e.target.value)}
              required
            />
          </Field>
          <Field label="Dato">
            <Input type="date" value={rideDate} onChange={(e) => setRideDate(e.target.value)} />
          </Field>
          <Field label="Note (valgfri)">
            <Input placeholder="fx Søndagstur" value={rideNote} onChange={(e) => setRideNote(e.target.value)} />
          </Field>
          <Button type="submit">
            <Plus size={16} /> Tilføj
          </Button>
        </form>

        {sortedRides.length > 0 && (
          <div className="mt-4 max-h-56 divide-y divide-slate-800 overflow-y-auto rounded-lg border border-slate-800">
            {sortedRides.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <div>
                  <span className="text-slate-200">{fmtKm(r.km)}</span>
                  <span className="ml-2 text-slate-500">{fmtDate(r.date)}</span>
                  {r.note && <span className="ml-2 text-slate-600">· {r.note}</span>}
                </div>
                <button onClick={() => removeRide(r.id)} className="text-slate-600 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle subtitle="Se km-slid på kæde, dæk, klodser m.m. og hvornår de skal skiftes.">Sliddele</SectionTitle>
          <Button onClick={() => setShowAddComponent((v) => !v)}>
            <Plus size={16} /> Tilføj del
          </Button>
        </div>

        {showAddComponent && (
          <form onSubmit={submitComponent} className="mb-4 grid gap-3 rounded-xl border border-slate-800 p-3 sm:grid-cols-2">
            <Field label="Type">
              <Select
                value={newType}
                onChange={(e) => {
                  const t = e.target.value as ComponentType
                  setNewType(t)
                  setNewLifespan(String(defaultLifespan(t)))
                }}
              >
                {COMPONENT_DEFS.map((c) => (
                  <option key={c.type} value={c.type}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Eget navn (valgfri)">
              <Input placeholder="fx Continental GP5000" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
            </Field>
            <Field label="Forventet levetid (km)" hint="Redigér gerne til producentens anbefaling">
              <Input inputMode="decimal" value={newLifespan} onChange={(e) => setNewLifespan(e.target.value)} />
            </Field>
            <Field label="Monteret dato">
              <Input type="date" value={newInstalledDate} onChange={(e) => setNewInstalledDate(e.target.value)} />
            </Field>
            <Field
              label="Cykel-km ved montering"
              hint={`Lad stå tomt for at bruge nuværende km (${fmtKm(km)})`}
            >
              <Input
                inputMode="decimal"
                placeholder={String(Math.round(km))}
                value={newInstalledKm}
                onChange={(e) => setNewInstalledKm(e.target.value)}
              />
            </Field>
            <div className="flex items-end gap-2">
              <Button type="submit">Gem</Button>
              <Button type="button" variant="ghost" onClick={() => setShowAddComponent(false)}>
                Annuller
              </Button>
            </div>
          </form>
        )}

        {active.length === 0 ? (
          <EmptyState title="Ingen sliddele registreret endnu" description="Tilføj fx kæde, dæk eller bremseklodser for at spore slid." />
        ) : (
          <div className="flex flex-col gap-3">
            {active
              .slice()
              .sort((a, b) => componentWearPct(km, b) - componentWearPct(km, a))
              .map((c) => {
                const currentKm = componentCurrentKm(km, c)
                const pct = componentWearPct(km, c)
                const isEditing = editingId === c.id
                return (
                  <div key={c.id} className="rounded-xl border border-slate-800 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-100">{componentDisplayLabel(c)}</p>
                        <p className="text-xs text-slate-500">
                          {fmtKm(currentKm)} af {fmtKm(c.lifespanKm)} · monteret {fmtDate(c.installedAtDate)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {wearBadge(pct)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <ProgressBar pct={pct} />
                    </div>

                    {isEditing ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Eget navn" />
                        <Input
                          inputMode="decimal"
                          value={editLifespan}
                          onChange={(e) => setEditLifespan(e.target.value)}
                          placeholder="Levetid km"
                        />
                        <div className="flex gap-2">
                          <Button variant="secondary" onClick={() => saveEdit(c.id)}>
                            Gem
                          </Button>
                          <Button variant="ghost" onClick={() => setEditingId(null)}>
                            Fortryd
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => replaceComponent(c.id)}>
                          <RefreshCw size={13} /> Skiftet
                        </Button>
                        <Button variant="ghost" onClick={() => startEdit(c.id, c.lifespanKm, c.customLabel ?? '')}>
                          <Pencil size={13} /> Rediger
                        </Button>
                        <Button variant="ghost" onClick={() => removeComponent(c.id)}>
                          <Trash2 size={13} /> Slet
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}

        {inactive.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200"
            >
              <History size={14} /> Historik ({inactive.length}) {showHistory ? '▲' : '▼'}
            </button>
            {showHistory && (
              <div className="mt-2 flex flex-col gap-2">
                {inactive
                  .slice()
                  .sort((a, b) => (b.replacedAtDate ?? '').localeCompare(a.replacedAtDate ?? ''))
                  .map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2 text-sm">
                      <span className="text-slate-400">{componentDisplayLabel(c)}</span>
                      <span className="text-slate-600">
                        {fmtKm(componentCurrentKm(km, c))} · {fmtDate(c.installedAtDate)} → {fmtDate(c.replacedAtDate ?? '')}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

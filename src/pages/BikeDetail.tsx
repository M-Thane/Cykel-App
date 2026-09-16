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
import { useLang } from '../lib/i18n/context'
import type { Dict } from '../lib/i18n/da'

function wearBadge(pct: number, t: Dict) {
  if (pct >= 100) return <Badge tone="danger">{t.bikeDetail.wear.replaceNow}</Badge>
  if (pct >= 80) return <Badge tone="warn">{t.bikeDetail.wear.soon}</Badge>
  return <Badge tone="ok">{t.bikeDetail.wear.ok}</Badge>
}

export default function BikeDetail() {
  const { t, locale } = useLang()
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
        title={t.bikeDetail.notFoundTitle}
        action={
          <Link to="/sliddele">
            <Button>{t.bikeDetail.backToBikes}</Button>
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
    if (confirm(t.bikeDetail.deleteConfirm(bike.name))) {
      removeBike(bike.id)
      navigate('/sliddele')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link to="/sliddele" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft size={14} /> {t.bikeDetail.allBikes}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">{bike.name}</h1>
            <p className="text-sm text-slate-500">
              {t.disciplines[bike.discipline]} · {t.bikeDetail.totalKm(fmtKm(km, locale))}
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
                  {t.disciplines[d.value]}
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
        <SectionTitle subtitle={t.bikeDetail.rideLog.subtitle}>{t.bikeDetail.rideLog.title}</SectionTitle>
        <form onSubmit={submitRide} className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end">
          <Field label={t.bikeDetail.rideLog.km}>
            <Input
              inputMode="decimal"
              placeholder={`${t.common.eg} 42.5`}
              value={rideKm}
              onChange={(e) => setRideKm(e.target.value)}
              required
            />
          </Field>
          <Field label={t.bikeDetail.rideLog.date}>
            <Input type="date" value={rideDate} onChange={(e) => setRideDate(e.target.value)} />
          </Field>
          <Field label={t.bikeDetail.rideLog.note}>
            <Input placeholder={t.bikeDetail.rideLog.notePlaceholder} value={rideNote} onChange={(e) => setRideNote(e.target.value)} />
          </Field>
          <Button type="submit">
            <Plus size={16} /> {t.bikeDetail.rideLog.add}
          </Button>
        </form>

        {sortedRides.length > 0 && (
          <div className="mt-4 max-h-56 divide-y divide-slate-800 overflow-y-auto rounded-lg border border-slate-800">
            {sortedRides.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <div>
                  <span className="text-slate-200">{fmtKm(r.km, locale)}</span>
                  <span className="ml-2 text-slate-500">{fmtDate(r.date, locale)}</span>
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
          <SectionTitle subtitle={t.bikeDetail.components.subtitle}>{t.bikeDetail.components.title}</SectionTitle>
          <Button onClick={() => setShowAddComponent((v) => !v)}>
            <Plus size={16} /> {t.bikeDetail.components.addPart}
          </Button>
        </div>

        {showAddComponent && (
          <form onSubmit={submitComponent} className="mb-4 grid gap-3 rounded-xl border border-slate-800 p-3 sm:grid-cols-2">
            <Field label={t.bikeDetail.components.type}>
              <Select
                value={newType}
                onChange={(e) => {
                  const ty = e.target.value as ComponentType
                  setNewType(ty)
                  setNewLifespan(String(defaultLifespan(ty)))
                }}
              >
                {COMPONENT_DEFS.map((c) => (
                  <option key={c.type} value={c.type}>
                    {t.componentTypes[c.type]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.bikeDetail.components.customName}>
              <Input placeholder={t.bikeDetail.components.customNamePlaceholder} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
            </Field>
            <Field label={t.bikeDetail.components.expectedLifespan} hint={t.bikeDetail.components.expectedLifespanHint}>
              <Input inputMode="decimal" value={newLifespan} onChange={(e) => setNewLifespan(e.target.value)} />
            </Field>
            <Field label={t.bikeDetail.components.installedDate}>
              <Input type="date" value={newInstalledDate} onChange={(e) => setNewInstalledDate(e.target.value)} />
            </Field>
            <Field
              label={t.bikeDetail.components.installedKm}
              hint={t.bikeDetail.components.installedKmHint(fmtKm(km, locale))}
            >
              <Input
                inputMode="decimal"
                placeholder={String(Math.round(km))}
                value={newInstalledKm}
                onChange={(e) => setNewInstalledKm(e.target.value)}
              />
            </Field>
            <div className="flex items-end gap-2">
              <Button type="submit">{t.common.save}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowAddComponent(false)}>
                {t.common.cancel}
              </Button>
            </div>
          </form>
        )}

        {active.length === 0 ? (
          <EmptyState title={t.bikeDetail.components.emptyTitle} description={t.bikeDetail.components.emptyDesc} />
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
                        <p className="truncate font-medium text-slate-100">{componentDisplayLabel(c, t.componentTypes)}</p>
                        <p className="text-xs text-slate-500">
                          {t.bikeDetail.components.ofLifespan(fmtKm(currentKm, locale), fmtKm(c.lifespanKm, locale), fmtDate(c.installedAtDate, locale))}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">{wearBadge(pct, t)}</div>
                    </div>
                    <div className="mt-2">
                      <ProgressBar pct={pct} />
                    </div>

                    {isEditing ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder={t.bikeDetail.components.editNamePlaceholder} />
                        <Input
                          inputMode="decimal"
                          value={editLifespan}
                          onChange={(e) => setEditLifespan(e.target.value)}
                          placeholder={t.bikeDetail.components.editLifespanPlaceholder}
                        />
                        <div className="flex gap-2">
                          <Button variant="secondary" onClick={() => saveEdit(c.id)}>
                            {t.common.save}
                          </Button>
                          <Button variant="ghost" onClick={() => setEditingId(null)}>
                            {t.common.cancel}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => replaceComponent(c.id)}>
                          <RefreshCw size={13} /> {t.bikeDetail.components.replaced}
                        </Button>
                        <Button variant="ghost" onClick={() => startEdit(c.id, c.lifespanKm, c.customLabel ?? '')}>
                          <Pencil size={13} /> {t.common.edit}
                        </Button>
                        <Button variant="ghost" onClick={() => removeComponent(c.id)}>
                          <Trash2 size={13} /> {t.common.delete}
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
              <History size={14} /> {t.bikeDetail.components.history(inactive.length)} {showHistory ? '▲' : '▼'}
            </button>
            {showHistory && (
              <div className="mt-2 flex flex-col gap-2">
                {inactive
                  .slice()
                  .sort((a, b) => (b.replacedAtDate ?? '').localeCompare(a.replacedAtDate ?? ''))
                  .map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2 text-sm">
                      <span className="text-slate-400">{componentDisplayLabel(c, t.componentTypes)}</span>
                      <span className="text-slate-600">
                        {t.bikeDetail.components.historyRow(
                          fmtKm(componentCurrentKm(km, c), locale),
                          fmtDate(c.installedAtDate, locale),
                          fmtDate(c.replacedAtDate ?? '', locale),
                        )}
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

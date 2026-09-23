import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, AlertTriangle } from 'lucide-react'
import { useAppStore, totalKmForBike, componentWearPct } from '../store/useAppStore'
import { DISCIPLINES, type Discipline } from '../types'
import { Button, Card, EmptyState, Field, Input, Select, SectionTitle } from '../components/ui'
import { fmtKm } from '../lib/format'
import { BIKE_BRAND_LABELS, BIKE_MODEL_PRESETS, bikeModelLabel, type BikeMakeBrand } from '../lib/bikes'
import { useLang } from '../lib/i18n/context'

export default function Maintenance() {
  const { t, locale } = useLang()
  const bikes = useAppStore((s) => s.bikes)
  const components = useAppStore((s) => s.components)
  const rides = useAppStore((s) => s.rides)
  const addBike = useAppStore((s) => s.addBike)
  const defaultBikeId = useAppStore((s) => s.defaultBikeId)
  const setDefaultBike = useAppStore((s) => s.setDefaultBike)

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
        <SectionTitle subtitle={t.maintenance.subtitle}>{t.maintenance.title}</SectionTitle>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} /> {t.maintenance.newBike}
        </Button>
      </div>

      {showForm && (
        <Card>
          {BIKE_MODEL_PRESETS.length > 0 && (
            <Field label={t.maintenance.chooseModel} hint={t.maintenance.chooseModelHint}>
              <Select
                defaultValue=""
                onChange={(e) => {
                  const preset = BIKE_MODEL_PRESETS.find((p) => p.id === e.target.value)
                  if (!preset) return
                  setName(bikeModelLabel(preset))
                  setDiscipline(preset.discipline)
                }}
                className="mb-3"
              >
                <option value="">{t.maintenance.chooseBrandModel}</option>
                {(Object.keys(BIKE_BRAND_LABELS) as BikeMakeBrand[]).map((brand) => {
                  const models = BIKE_MODEL_PRESETS.filter((p) => p.brand === brand)
                  if (models.length === 0) return null
                  return (
                    <optgroup key={brand} label={BIKE_BRAND_LABELS[brand]}>
                      {models.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.model} ({t.disciplines[p.discipline]})
                        </option>
                      ))}
                    </optgroup>
                  )
                })}
              </Select>
            </Field>
          )}
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label={t.maintenance.name}>
              <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t.maintenance.namePlaceholder} />
            </Field>
            <Field label={t.maintenance.disciplineLabel}>
              <Select value={discipline} onChange={(e) => setDiscipline(e.target.value as Discipline)}>
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {t.disciplines[d.value]}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex gap-2">
              <Button type="submit">{t.maintenance.create}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                {t.common.cancel}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {bikes.length > 0 && (
        <Card>
          <Field label={t.login.defaultBike} hint={t.login.defaultBikeHint}>
            <Select value={defaultBikeId ?? ''} onChange={(e) => e.target.value && setDefaultBike(e.target.value)}>
              <option value="">{t.login.chooseBike}</option>
              {bikes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
        </Card>
      )}

      {bikes.length === 0 ? (
        <EmptyState
          title={t.maintenance.emptyTitle}
          description={t.maintenance.emptyDesc}
          action={
            !showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus size={16} /> {t.maintenance.addBike}
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
                    {t.disciplines[bike.discipline]} · {fmtKm(km, locale)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {t.maintenance.partsCount(componentCount)}
                    {overdue > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 text-red-400">
                        <AlertTriangle size={12} /> {t.maintenance.overdue(overdue)}
                      </span>
                    )}
                    {overdue === 0 && soon > 0 && <span className="ml-2 text-amber-400">{t.maintenance.soon(soon)}</span>}
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

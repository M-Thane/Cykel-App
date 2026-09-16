import { useEffect, useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { Button, Card, Field, Input, Select, SectionTitle } from '../components/ui'
import { calcTirePressure, RIDE_STYLES, SURFACES, TUBE_TYPES, type RideStyle, type Surface, type TubeType } from '../lib/tirePressure'
import { TIRE_PRESETS, tirePresetLabel, type TireDiscipline } from '../lib/tires'
import { WHEEL_PRESETS, wheelPresetLabel, type WheelDiscipline } from '../lib/wheels'
import { useLang } from '../lib/i18n/context'
import type { Dict } from '../lib/i18n/da'

function tireDisciplines(t: Dict): { value: TireDiscipline; label: string }[] {
  return [
    { value: 'landevej', label: t.disciplines.landevej },
    { value: 'gravel', label: t.disciplines.gravel },
    { value: 'mtb', label: t.disciplines.mtb },
  ]
}

function WheelPicker({ onApply }: { onApply: (mm: number) => void }) {
  const { t } = useLang()
  const TIRE_DISCIPLINES = tireDisciplines(t)
  const [discipline, setDiscipline] = useState<WheelDiscipline>('landevej')
  const available = useMemo(() => WHEEL_PRESETS.filter((p) => p.discipline === discipline), [discipline])
  const [presetId, setPresetId] = useState(available[0]?.id ?? '')
  const preset = available.find((p) => p.id === presetId) ?? available[0]

  useEffect(() => {
    if (available.length && !available.some((p) => p.id === presetId)) {
      setPresetId(available[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discipline, available])

  if (WHEEL_PRESETS.length === 0) return null

  return (
    <Card>
      <p className="mb-3 text-sm text-slate-400">{t.tirePressure.wheelPicker.intro}</p>
      <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
        <Field label={t.tirePressure.wheelPicker.disciplineLabel}>
          <Select value={discipline} onChange={(e) => setDiscipline(e.target.value as WheelDiscipline)}>
            {TIRE_DISCIPLINES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.tirePressure.wheelPicker.wheelLabel}>
          <Select value={preset?.id ?? ''} onChange={(e) => setPresetId(e.target.value)}>
            {available.map((p) => (
              <option key={p.id} value={p.id}>
                {wheelPresetLabel(p)} ({p.internalWidthMm}mm)
              </option>
            ))}
          </Select>
        </Field>
        {preset && (
          <Button variant="secondary" onClick={() => onApply(preset.internalWidthMm)}>
            {t.tirePressure.wheelPicker.useRimWidth}
          </Button>
        )}
      </div>
      {preset?.note && <p className="mt-2 text-xs text-slate-500">{preset.note}</p>}
    </Card>
  )
}

function TirePicker({ onApply }: { onApply: (mm: number) => void }) {
  const { t } = useLang()
  const TIRE_DISCIPLINES = tireDisciplines(t)
  const [discipline, setDiscipline] = useState<TireDiscipline>('landevej')
  const available = useMemo(() => TIRE_PRESETS.filter((p) => p.discipline === discipline), [discipline])
  const [presetId, setPresetId] = useState(available[0]?.id ?? '')
  const preset = available.find((p) => p.id === presetId) ?? available[0]
  const [widthIdx, setWidthIdx] = useState(0)

  useEffect(() => {
    if (available.length && !available.some((p) => p.id === presetId)) {
      setPresetId(available[0].id)
    }
    setWidthIdx(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discipline, available])

  if (TIRE_PRESETS.length === 0) return null

  return (
    <Card>
      <p className="mb-3 text-sm text-slate-400">{t.tirePressure.tirePicker.intro}</p>
      <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
        <Field label={t.tirePressure.tirePicker.disciplineLabel}>
          <Select value={discipline} onChange={(e) => setDiscipline(e.target.value as TireDiscipline)}>
            {TIRE_DISCIPLINES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.tirePressure.tirePicker.modelLabel}>
          <Select value={preset?.id ?? ''} onChange={(e) => setPresetId(e.target.value)}>
            {available.map((p) => (
              <option key={p.id} value={p.id}>
                {tirePresetLabel(p)}
              </option>
            ))}
          </Select>
        </Field>
        {preset && (
          <Field label={t.tirePressure.tirePicker.widthLabel}>
            <Select value={widthIdx} onChange={(e) => setWidthIdx(Number(e.target.value))}>
              {preset.widths.map((w, i) => (
                <option key={i} value={i}>
                  {w.label}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>
      {preset && (
        <div className="mt-3 flex items-center gap-3">
          <Button variant="secondary" onClick={() => onApply(preset.widths[widthIdx].mm)}>
            {t.tirePressure.tirePicker.useWidth}
          </Button>
          {(preset.tubelessReady || preset.note) && (
            <p className="text-xs text-slate-500">
              {preset.tubelessReady ? t.tirePressure.tirePicker.tubelessReady : ''}
              {preset.tubelessReady && preset.note ? ' · ' : ''}
              {preset.note}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}

export default function TirePressure() {
  const { t } = useLang()
  const [riderWeight, setRiderWeight] = useState('75')
  const [bikeWeight, setBikeWeight] = useState('9')
  const [tireWidth, setTireWidth] = useState('28')
  const [rimWidth, setRimWidth] = useState('')
  const [surface, setSurface] = useState<Surface>('asfalt_normal')
  const [style, setStyle] = useState<RideStyle>('endurance')
  const [tube, setTube] = useState<TubeType>('tubeless')

  const result = useMemo(() => {
    const r = parseFloat(riderWeight.replace(',', '.'))
    const b = parseFloat(bikeWeight.replace(',', '.'))
    const w = parseFloat(tireWidth.replace(',', '.'))
    const rim = rimWidth.trim() ? parseFloat(rimWidth.replace(',', '.')) : undefined
    if (!r || !w) return null
    return calcTirePressure({
      riderWeightKg: r,
      bikeWeightKg: b || 0,
      tireWidthMm: w,
      surface,
      style,
      tube,
      rimInternalWidthMm: rim,
    })
  }, [riderWeight, bikeWeight, tireWidth, rimWidth, surface, style, tube])

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle subtitle={t.tirePressure.subtitle}>{t.tirePressure.title}</SectionTitle>

      <TirePicker onApply={(mm) => setTireWidth(String(mm))} />
      <WheelPicker onApply={(mm) => setRimWidth(String(mm))} />

      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.tirePressure.form.riderWeight}>
            <Input inputMode="decimal" value={riderWeight} onChange={(e) => setRiderWeight(e.target.value)} />
          </Field>
          <Field label={t.tirePressure.form.bikeWeight} hint={t.tirePressure.form.bikeWeightHint}>
            <Input inputMode="decimal" value={bikeWeight} onChange={(e) => setBikeWeight(e.target.value)} />
          </Field>
          <Field label={t.tirePressure.form.tireWidth} hint={t.tirePressure.form.tireWidthHint}>
            <Input inputMode="decimal" value={tireWidth} onChange={(e) => setTireWidth(e.target.value)} />
          </Field>
          <Field label={t.tirePressure.form.rimWidth} hint={t.tirePressure.form.rimWidthHint}>
            <Input inputMode="decimal" placeholder={`${t.common.eg} 21`} value={rimWidth} onChange={(e) => setRimWidth(e.target.value)} />
          </Field>
          <Field label={t.tirePressure.form.tubeType}>
            <Select value={tube} onChange={(e) => setTube(e.target.value as TubeType)}>
              {TUBE_TYPES.map((ty) => (
                <option key={ty.value} value={ty.value}>
                  {t.tubeTypes[ty.value]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.tirePressure.form.surface}>
            <Select value={surface} onChange={(e) => setSurface(e.target.value as Surface)}>
              {SURFACES.map((s) => (
                <option key={s.value} value={s.value}>
                  {t.surfaces[s.value]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.tirePressure.form.rideStyle}>
            <Select value={style} onChange={(e) => setStyle(e.target.value as RideStyle)}>
              {RIDE_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {t.rideStyles[s.value].label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      {result && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.tirePressure.result.front}</p>
            <p className="mt-1 text-3xl font-semibold text-brand-400">{result.frontBar.toFixed(1)} bar</p>
            <p className="text-sm text-slate-500">{result.frontPsi} psi</p>
          </Card>
          <Card className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.tirePressure.result.rear}</p>
            <p className="mt-1 text-3xl font-semibold text-brand-400">{result.rearBar.toFixed(1)} bar</p>
            <p className="text-sm text-slate-500">{result.rearPsi} psi</p>
          </Card>
          {rimWidth.trim() && Math.abs(result.effectiveWidthMm - parseFloat(tireWidth.replace(',', '.'))) >= 0.1 && (
            <p className="sm:col-span-2 text-center text-xs text-slate-500">
              {t.tirePressure.result.effectiveWidthNote(result.effectiveWidthMm)}
            </p>
          )}
        </div>
      )}

      <Card className="flex gap-2.5 text-sm text-slate-400">
        <Info size={16} className="mt-0.5 shrink-0 text-slate-500" />
        <div>
          <p>
            {t.tirePressure.info.p1Pre}
            <strong className="text-slate-300">{t.tirePressure.info.p1Strong}</strong>
            {t.tirePressure.info.p1Post}
          </p>
          <p className="mt-1.5">{t.tirePressure.info.p2}</p>
          {(result?.clampedLow || result?.clampedHigh) && (
            <p className="mt-1.5 text-amber-400">{t.tirePressure.info.clampWarning}</p>
          )}
        </div>
      </Card>
    </div>
  )
}

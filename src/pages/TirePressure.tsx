import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { Card, Field, Input, Select, SectionTitle } from '../components/ui'
import { calcTirePressure, RIDE_STYLES, SURFACES, TUBE_TYPES, type RideStyle, type Surface, type TubeType } from '../lib/tirePressure'

export default function TirePressure() {
  const [riderWeight, setRiderWeight] = useState('75')
  const [bikeWeight, setBikeWeight] = useState('9')
  const [tireWidth, setTireWidth] = useState('28')
  const [surface, setSurface] = useState<Surface>('asfalt_normal')
  const [style, setStyle] = useState<RideStyle>('endurance')
  const [tube, setTube] = useState<TubeType>('tubeless')

  const result = useMemo(() => {
    const r = parseFloat(riderWeight.replace(',', '.'))
    const b = parseFloat(bikeWeight.replace(',', '.'))
    const w = parseFloat(tireWidth.replace(',', '.'))
    if (!r || !w) return null
    return calcTirePressure({
      riderWeightKg: r,
      bikeWeightKg: b || 0,
      tireWidthMm: w,
      surface,
      style,
      tube,
    })
  }, [riderWeight, bikeWeight, tireWidth, surface, style, tube])

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle subtitle="Find et vejledende udgangspunkt for dæktryk baseret på vægt, dækbredde, underlag og cykeltype.">
        Dæktryksberegner
      </SectionTitle>

      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Rytter-vægt (kg)">
            <Input inputMode="decimal" value={riderWeight} onChange={(e) => setRiderWeight(e.target.value)} />
          </Field>
          <Field label="Cykel + udstyr (kg)" hint="Inkl. bagagerum, drikkedunke mv. hvis relevant">
            <Input inputMode="decimal" value={bikeWeight} onChange={(e) => setBikeWeight(e.target.value)} />
          </Field>
          <Field label="Dækbredde (mm)" hint="Den faktiske monterede bredde, ikke kun tallet på dæksiden">
            <Input inputMode="decimal" value={tireWidth} onChange={(e) => setTireWidth(e.target.value)} />
          </Field>
          <Field label="Dæktype">
            <Select value={tube} onChange={(e) => setTube(e.target.value as TubeType)}>
              {TUBE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Underlag">
            <Select value={surface} onChange={(e) => setSurface(e.target.value as Surface)}>
              {SURFACES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Kørestil">
            <Select value={style} onChange={(e) => setStyle(e.target.value as RideStyle)}>
              {RIDE_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      {result && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Fordæk</p>
            <p className="mt-1 text-3xl font-semibold text-brand-400">{result.frontBar.toFixed(1)} bar</p>
            <p className="text-sm text-slate-500">{result.frontPsi} psi</p>
          </Card>
          <Card className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Bagdæk</p>
            <p className="mt-1 text-3xl font-semibold text-brand-400">{result.rearBar.toFixed(1)} bar</p>
            <p className="text-sm text-slate-500">{result.rearPsi} psi</p>
          </Card>
        </div>
      )}

      <Card className="flex gap-2.5 text-sm text-slate-400">
        <Info size={16} className="mt-0.5 shrink-0 text-slate-500" />
        <div>
          <p>
            Dette er et <strong className="text-slate-300">vejledende udgangspunkt</strong> — ikke en eksakt videnskab. Bagdæk
            får typisk lidt højere tryk end fordæk pga. vægtfordelingen. Finjustér ±0,2-0,3 bar efter fornemmelse, og
            overskrid aldrig producentens min./maks.-tryk angivet på dæksiden.
          </p>
          {(result?.clampedLow || result?.clampedHigh) && (
            <p className="mt-1.5 text-amber-400">
              Det beregnede tryk lå uden for et typisk sikkert interval og er justeret. Dobbelttjek dine input.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

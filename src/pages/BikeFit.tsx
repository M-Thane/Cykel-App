import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { Card, Field, Input, Select, SectionTitle } from '../components/ui'
import { calcBikeFit, FIT_DISCIPLINES, FLEXIBILITIES, type FitDiscipline, type Flexibility } from '../lib/bikeFit'

export default function BikeFit() {
  const [height, setHeight] = useState('178')
  const [inseam, setInseam] = useState('82')
  const [discipline, setDiscipline] = useState<FitDiscipline>('landevej')
  const [flexibility, setFlexibility] = useState<Flexibility>('normal')

  const result = useMemo(() => {
    const h = parseFloat(height.replace(',', '.'))
    const i = parseFloat(inseam.replace(',', '.'))
    if (!h || !i) return null
    return calcBikeFit({ heightCm: h, inseamCm: i, discipline, flexibility })
  }, [height, inseam, discipline, flexibility])

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle subtitle="Få et vejledende udgangspunkt for sadelhøjde, rammestørrelse og styrposition.">
        Bikefit-hjælp
      </SectionTitle>

      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Højde (cm)">
            <Input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} />
          </Field>
          <Field
            label="Skridtmål / inseam (cm)"
            hint="Stå med ryggen mod en væg, pres en bog op i skridtet og mål fra gulv til bogens overkant"
          >
            <Input inputMode="decimal" value={inseam} onChange={(e) => setInseam(e.target.value)} />
          </Field>
          <Field label="Type cykling">
            <Select value={discipline} onChange={(e) => setDiscipline(e.target.value as FitDiscipline)}>
              {FIT_DISCIPLINES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Smidighed">
            <Select value={flexibility} onChange={(e) => setFlexibility(e.target.value as Flexibility)}>
              {FLEXIBILITIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      {result && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sadelhøjde (LeMond-metode)</p>
            <p className="mt-1 text-2xl font-semibold text-brand-400">{result.saddleHeightLemondCm} cm</p>
            <p className="mt-1 text-xs text-slate-500">Fra midten af krankboksen til sadeltoppen, målt langs sadelrøret</p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sadelhøjde (Holmes-metode)</p>
            <p className="mt-1 text-2xl font-semibold text-slate-200">{result.saddleHeightHolmesCm} cm</p>
            <p className="mt-1 text-xs text-slate-500">Fra pedalaksel (i bund) til sadeltop — brug som krydstjek</p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Rammestørrelse</p>
            <p className="mt-1 text-2xl font-semibold text-slate-200">
              {result.frameLetter}
              {result.frameCmRange && <span className="ml-2 text-base text-slate-500">({result.frameCmRange} cm)</span>}
            </p>
            <p className="mt-1 text-xs text-slate-500">Varierer mellem mærker — brug altid producentens egen str. guide</p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Styr ift. sadelhøjde</p>
            <p className="mt-1 text-2xl font-semibold text-slate-200">
              {result.handlebarDrop[0]} – {result.handlebarDrop[1]} cm
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {result.handlebarDrop[0] < 0 ? 'Negativt tal = styret over sadeltop' : 'Styret lavere end sadeltop (drop)'}
            </p>
          </Card>
        </div>
      )}

      <Card className="flex gap-2.5 text-sm text-slate-400">
        <Info size={16} className="mt-0.5 shrink-0 text-slate-500" />
        <p>
          Disse tal er <strong className="text-slate-300">gode udgangspunkter</strong> baseret på gængse tommelfingerregler
          — ikke en erstatning for en professionel bikefit. Justér i småbidder (2-3 mm ad gangen på sadelhøjde) og giv kroppen
          et par ture til at vænne sig til ændringer, før du justerer igen.
        </p>
      </Card>
    </div>
  )
}

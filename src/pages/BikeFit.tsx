import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { Badge, Card, Field, Input, Select, SectionTitle } from '../components/ui'
import {
  calcBikeFit,
  recommendedHandlebarWidthMm,
  targetStrBand,
  FIT_DISCIPLINES,
  FLEXIBILITIES,
  type FitDiscipline,
  type Flexibility,
} from '../lib/bikeFit'
import { BIKE_BRAND_LABELS, BIKE_MODEL_PRESETS, bikeModelLabel, recommendedSize, type BikeMakeBrand } from '../lib/bikes'
import { geometryFor, stackReachRatio } from '../lib/bikeGeometry'

export default function BikeFit() {
  const [height, setHeight] = useState('178')
  const [inseam, setInseam] = useState('82')
  const [torso, setTorso] = useState('')
  const [arm, setArm] = useState('')
  const [shoulder, setShoulder] = useState('')
  const [discipline, setDiscipline] = useState<FitDiscipline>('landevej')
  const [flexibility, setFlexibility] = useState<Flexibility>('normal')
  const [modelId, setModelId] = useState('')

  const modelsForDiscipline = useMemo(
    () => BIKE_MODEL_PRESETS.filter((p) => p.discipline === discipline),
    [discipline],
  )
  const selectedModel = modelsForDiscipline.find((p) => p.id === modelId)
  const geometry = selectedModel ? geometryFor(selectedModel.id) : undefined

  const result = useMemo(() => {
    const h = parseFloat(height.replace(',', '.'))
    const i = parseFloat(inseam.replace(',', '.'))
    if (!h || !i) return null
    return calcBikeFit({ heightCm: h, inseamCm: i, discipline, flexibility })
  }, [height, inseam, discipline, flexibility])

  const heightCm = parseFloat(height.replace(',', '.'))
  const modelSize = selectedModel && heightCm ? recommendedSize(selectedModel, heightCm) : undefined

  const torsoCm = parseFloat(torso.replace(',', '.'))
  const armCm = parseFloat(arm.replace(',', '.'))
  const shoulderCm = parseFloat(shoulder.replace(',', '.'))
  const torsoPlusArm = torsoCm && armCm ? torsoCm + armCm : null
  const handlebarWidth = shoulderCm ? recommendedHandlebarWidthMm(shoulderCm) : null
  const strBand = targetStrBand(discipline, flexibility)

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle subtitle="Få et vejledende udgangspunkt for sadelhøjde, rammestørrelse og styrposition — og sammenlign mod cyklens egen geometri.">
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
          <Field label="Overkropslængde (cm, valgfri)" hint="Skulder (akromion) til sæde, siddende">
            <Input inputMode="decimal" placeholder="fx 58" value={torso} onChange={(e) => setTorso(e.target.value)} />
          </Field>
          <Field label="Armlængde (cm, valgfri)" hint="Skulder til håndled, arm strakt">
            <Input inputMode="decimal" placeholder="fx 62" value={arm} onChange={(e) => setArm(e.target.value)} />
          </Field>
          <Field label="Skulderbredde (cm, valgfri)" hint="Yderside til yderside af skulderleddene">
            <Input inputMode="decimal" placeholder="fx 42" value={shoulder} onChange={(e) => setShoulder(e.target.value)} />
          </Field>
          <Field label="Type cykling">
            <Select
              value={discipline}
              onChange={(e) => {
                setDiscipline(e.target.value as FitDiscipline)
                setModelId('')
              }}
            >
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
          {modelsForDiscipline.length > 0 && (
            <Field
              label="Cykel du har eller overvejer (valgfri)"
              hint="Viser mærkets anbefalede størrelse, og cyklens egen geometri hvis den findes"
            >
              <Select value={modelId} onChange={(e) => setModelId(e.target.value)}>
                <option value="">— Vælg mærke og model —</option>
                {(Object.keys(BIKE_BRAND_LABELS) as BikeMakeBrand[]).map((brand) => {
                  const models = modelsForDiscipline.filter((p) => p.brand === brand)
                  if (models.length === 0) return null
                  return (
                    <optgroup key={brand} label={BIKE_BRAND_LABELS[brand]}>
                      {models.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.model}
                        </option>
                      ))}
                    </optgroup>
                  )
                })}
              </Select>
            </Field>
          )}
        </div>
      </Card>

      {selectedModel && (
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Anbefalet størrelse — {bikeModelLabel(selectedModel)}
          </p>
          {modelSize ? (
            <>
              <p className="mt-1 text-2xl font-semibold text-brand-400">{modelSize.size}</p>
              <p className="mt-1 text-xs text-slate-500">
                Producentens egen guide for {heightCm}cm ({modelSize.heightMinCm}–{modelSize.heightMaxCm}cm)
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-400">
              Ingen bekræftet størrelsestabel for denne model endnu — brug det generelle skøn nedenfor i stedet.
            </p>
          )}
          {selectedModel.note && <p className="mt-1 text-xs text-slate-500">{selectedModel.note}</p>}
        </Card>
      )}

      {selectedModel && geometry && (
        <Card>
          <SectionTitle
            subtitle={
              strBand
                ? `Stack/reach-forhold (STR) per størrelse. Din smidighed peger på en STR mellem ${strBand.min.toFixed(2)}–${strBand.max.toFixed(2)} — grøn markering rammer den zone.`
                : 'Stack og reach per størrelse, hentet fra producentens egen geometritabel.'
            }
          >
            Geometri — {bikeModelLabel(selectedModel)}
          </SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500">
                  <th className="px-2 py-1.5">Str.</th>
                  <th className="px-2 py-1.5">Stack</th>
                  <th className="px-2 py-1.5">Reach</th>
                  <th className="px-2 py-1.5">STR</th>
                  {strBand && <th className="px-2 py-1.5">Match</th>}
                </tr>
              </thead>
              <tbody>
                {geometry.sizes.map((s) => {
                  const str = stackReachRatio(s.stackMm, s.reachMm)
                  const inBand = strBand ? str >= strBand.min && str <= strBand.max : false
                  const isRecommended = modelSize?.size === s.size
                  return (
                    <tr key={s.size} className={`border-t border-slate-800 ${isRecommended ? 'bg-brand-900/20' : ''}`}>
                      <td className="px-2 py-1.5 font-medium text-slate-100">
                        {s.size}
                        {isRecommended && <span className="ml-1.5 text-xs text-brand-400">(højde-match)</span>}
                      </td>
                      <td className="px-2 py-1.5 text-slate-300">{s.stackMm}mm</td>
                      <td className="px-2 py-1.5 text-slate-300">{s.reachMm}mm</td>
                      <td className="px-2 py-1.5 text-slate-300">{str.toFixed(2)}</td>
                      {strBand && (
                        <td className="px-2 py-1.5">{inBand ? <Badge tone="ok">God match</Badge> : <Badge>—</Badge>}</td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {torsoPlusArm && (
            <p className="mt-3 text-xs text-slate-500">
              Din overkrop + arm: {torsoPlusArm.toFixed(0)}cm — det tal en professionel bikefitter bruger sammen med
              reach-værdierne ovenfor. Appen omregner det ikke til et præcist mm-mål, da det kræver en fysisk fitting.
            </p>
          )}
          {geometry.note && <p className="mt-1 text-xs text-slate-500">{geometry.note}</p>}
        </Card>
      )}

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
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Rammestørrelse (generelt skøn)</p>
            <p className="mt-1 text-2xl font-semibold text-slate-200">
              {result.frameLetter}
              {result.frameCmRange && <span className="ml-2 text-base text-slate-500">({result.frameCmRange} cm)</span>}
            </p>
            <p className="mt-1 text-xs text-slate-500">Varierer mellem mærker — vælg en model ovenfor for et præcist bud</p>
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
          {handlebarWidth && (
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Styrbredde</p>
              <p className="mt-1 text-2xl font-semibold text-slate-200">
                {handlebarWidth[0]} – {handlebarWidth[1]} mm
              </p>
              <p className="mt-1 text-xs text-slate-500">Center-til-center, ud fra din skulderbredde</p>
            </Card>
          )}
        </div>
      )}

      <Card className="flex gap-2.5 text-sm text-slate-400">
        <Info size={16} className="mt-0.5 shrink-0 text-slate-500" />
        <div>
          <p>
            Disse tal er <strong className="text-slate-300">gode udgangspunkter</strong> baseret på gængse
            tommelfingerregler — ikke en erstatning for en professionel bikefit. Justér i småbidder (2-3 mm ad gangen på
            sadelhøjde) og giv kroppen et par ture til at vænne sig til ændringer, før du justerer igen.
          </p>
          <p className="mt-1.5">
            Stack/reach-matchen er ligeledes vejledende — den sammenligner cyklens egen geometri med en tommelfingerregel
            for hvor aggressiv/afslappet en position der typisk passer til din smidighed, ikke et fysisk opmålt fit.
          </p>
        </div>
      </Card>
    </div>
  )
}

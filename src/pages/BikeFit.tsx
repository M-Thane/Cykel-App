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
import { useLang } from '../lib/i18n/context'

export default function BikeFit() {
  const { t } = useLang()
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
      <SectionTitle subtitle={t.bikeFit.subtitle}>{t.bikeFit.title}</SectionTitle>

      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.bikeFit.form.height}>
            <Input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} />
          </Field>
          <Field label={t.bikeFit.form.inseam} hint={t.bikeFit.form.inseamHint}>
            <Input inputMode="decimal" value={inseam} onChange={(e) => setInseam(e.target.value)} />
          </Field>
          <Field label={t.bikeFit.form.torso} hint={t.bikeFit.form.torsoHint}>
            <Input inputMode="decimal" placeholder={`${t.common.eg} 58`} value={torso} onChange={(e) => setTorso(e.target.value)} />
          </Field>
          <Field label={t.bikeFit.form.arm} hint={t.bikeFit.form.armHint}>
            <Input inputMode="decimal" placeholder={`${t.common.eg} 62`} value={arm} onChange={(e) => setArm(e.target.value)} />
          </Field>
          <Field label={t.bikeFit.form.shoulder} hint={t.bikeFit.form.shoulderHint}>
            <Input inputMode="decimal" placeholder={`${t.common.eg} 42`} value={shoulder} onChange={(e) => setShoulder(e.target.value)} />
          </Field>
          <Field label={t.bikeFit.form.discipline}>
            <Select
              value={discipline}
              onChange={(e) => {
                setDiscipline(e.target.value as FitDiscipline)
                setModelId('')
              }}
            >
              {FIT_DISCIPLINES.map((d) => (
                <option key={d.value} value={d.value}>
                  {t.disciplines[d.value]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.bikeFit.form.flexibility}>
            <Select value={flexibility} onChange={(e) => setFlexibility(e.target.value as Flexibility)}>
              {FLEXIBILITIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {t.flexibilities[f.value]}
                </option>
              ))}
            </Select>
          </Field>
          {modelsForDiscipline.length > 0 && (
            <Field label={t.bikeFit.form.model} hint={t.bikeFit.form.modelHint}>
              <Select value={modelId} onChange={(e) => setModelId(e.target.value)}>
                <option value="">{t.bikeFit.form.chooseBrandModel}</option>
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
            {t.bikeFit.sizeCard.recommendedSize(bikeModelLabel(selectedModel))}
          </p>
          {modelSize ? (
            <>
              <p className="mt-1 text-2xl font-semibold text-brand-400">{modelSize.size}</p>
              <p className="mt-1 text-xs text-slate-500">
                {t.bikeFit.sizeCard.manufacturerGuide(String(heightCm), modelSize.heightMinCm, modelSize.heightMaxCm)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-400">{t.bikeFit.sizeCard.noSizeChart}</p>
          )}
          {selectedModel.note && <p className="mt-1 text-xs text-slate-500">{selectedModel.note}</p>}
        </Card>
      )}

      {selectedModel && geometry && (
        <Card>
          <SectionTitle
            subtitle={
              strBand
                ? t.bikeFit.geometry.subtitleWithBand(strBand.min.toFixed(2), strBand.max.toFixed(2))
                : t.bikeFit.geometry.subtitleNoBand
            }
          >
            {t.bikeFit.geometry.title(bikeModelLabel(selectedModel))}
          </SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500">
                  <th className="px-2 py-1.5">{t.bikeFit.geometry.size}</th>
                  <th className="px-2 py-1.5">{t.bikeFit.geometry.stack}</th>
                  <th className="px-2 py-1.5">{t.bikeFit.geometry.reach}</th>
                  <th className="px-2 py-1.5">{t.bikeFit.geometry.str}</th>
                  {strBand && <th className="px-2 py-1.5">{t.bikeFit.geometry.match}</th>}
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
                        {isRecommended && <span className="ml-1.5 text-xs text-brand-400">({t.bikeFit.geometry.heightMatch})</span>}
                      </td>
                      <td className="px-2 py-1.5 text-slate-300">{s.stackMm}mm</td>
                      <td className="px-2 py-1.5 text-slate-300">{s.reachMm}mm</td>
                      <td className="px-2 py-1.5 text-slate-300">{str.toFixed(2)}</td>
                      {strBand && (
                        <td className="px-2 py-1.5">{inBand ? <Badge tone="ok">{t.bikeFit.geometry.goodMatch}</Badge> : <Badge>—</Badge>}</td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {torsoPlusArm && (
            <p className="mt-3 text-xs text-slate-500">{t.bikeFit.geometry.torsoArmNote(torsoPlusArm.toFixed(0))}</p>
          )}
          {geometry.note && <p className="mt-1 text-xs text-slate-500">{geometry.note}</p>}
        </Card>
      )}

      {result && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.bikeFit.results.saddleLemond}</p>
            <p className="mt-1 text-2xl font-semibold text-brand-400">{result.saddleHeightLemondCm} cm</p>
            <p className="mt-1 text-xs text-slate-500">{t.bikeFit.results.saddleLemondNote}</p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.bikeFit.results.saddleHolmes}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-200">{result.saddleHeightHolmesCm} cm</p>
            <p className="mt-1 text-xs text-slate-500">{t.bikeFit.results.saddleHolmesNote}</p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.bikeFit.results.frameSize}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-200">
              {result.frameLetter}
              {result.frameCmRange && <span className="ml-2 text-base text-slate-500">({result.frameCmRange} cm)</span>}
            </p>
            <p className="mt-1 text-xs text-slate-500">{t.bikeFit.results.frameSizeNote}</p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.bikeFit.results.handlebarDrop}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-200">
              {result.handlebarDrop[0]} – {result.handlebarDrop[1]} cm
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {result.handlebarDrop[0] < 0 ? t.bikeFit.results.handlebarDropNegative : t.bikeFit.results.handlebarDropPositive}
            </p>
          </Card>
          {handlebarWidth && (
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.bikeFit.results.handlebarWidth}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-200">
                {handlebarWidth[0]} – {handlebarWidth[1]} mm
              </p>
              <p className="mt-1 text-xs text-slate-500">{t.bikeFit.results.handlebarWidthNote}</p>
            </Card>
          )}
        </div>
      )}

      <Card className="flex gap-2.5 text-sm text-slate-400">
        <Info size={16} className="mt-0.5 shrink-0 text-slate-500" />
        <div>
          <p>
            {t.bikeFit.info.p1Pre}
            <strong className="text-slate-300">{t.bikeFit.info.p1Strong}</strong>
            {t.bikeFit.info.p1Post}
          </p>
          <p className="mt-1.5">{t.bikeFit.info.p2}</p>
        </div>
      </Card>
    </div>
  )
}

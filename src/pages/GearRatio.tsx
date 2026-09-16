import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Field, Input, Select, SectionTitle } from '../components/ui'
import {
  WHEEL_PRESETS,
  calcCassetteSteps,
  calcGearMatrix,
  gearRangeSummary,
  parseTeethList,
  requiredCadenceRpm,
  speedAtCadenceKmh,
  wheelPresetDisplayLabel,
} from '../lib/gearRatio'
import {
  GROUPSET_PRESETS,
  cassetteLabel,
  chainringComboLabel,
  presetLabel,
  type GroupsetDiscipline,
} from '../lib/groupsets'
import { useLang } from '../lib/i18n/context'
import type { Dict } from '../lib/i18n/da'

function groupsetDisciplines(t: Dict): { value: GroupsetDiscipline; label: string }[] {
  return [
    { value: 'landevej', label: t.disciplines.landevej },
    { value: 'gravel', label: t.disciplines.gravel },
    { value: 'mtb', label: t.disciplines.mtb },
  ]
}

function GroupsetPicker({ onApply }: { onApply: (chainrings: number[], cogs: number[]) => void }) {
  const { t } = useLang()
  const GROUPSET_DISCIPLINES = groupsetDisciplines(t)
  const [discipline, setDiscipline] = useState<GroupsetDiscipline>('landevej')
  const available = useMemo(() => GROUPSET_PRESETS.filter((p) => p.discipline === discipline), [discipline])
  const [presetId, setPresetId] = useState(available[0]?.id ?? '')
  const preset = available.find((p) => p.id === presetId) ?? available[0]

  const [chainringIdx, setChainringIdx] = useState(0)
  const [cassetteIdx, setCassetteIdx] = useState(0)

  useEffect(() => {
    if (available.length && !available.some((p) => p.id === presetId)) {
      setPresetId(available[0].id)
    }
    setChainringIdx(0)
    setCassetteIdx(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discipline, available])

  if (GROUPSET_PRESETS.length === 0) return null

  return (
    <Card>
      <p className="mb-3 text-sm text-slate-400">{t.gearRatio.groupsetPicker.intro}</p>
      <div className="grid gap-3 sm:grid-cols-4 sm:items-end">
        <Field label={t.gearRatio.groupsetPicker.disciplineLabel}>
          <Select value={discipline} onChange={(e) => setDiscipline(e.target.value as GroupsetDiscipline)}>
            {GROUPSET_DISCIPLINES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.gearRatio.groupsetPicker.groupsetLabel}>
          <Select value={preset?.id ?? ''} onChange={(e) => setPresetId(e.target.value)}>
            {available.map((p) => (
              <option key={p.id} value={p.id}>
                {presetLabel(p)}
              </option>
            ))}
          </Select>
        </Field>
        {preset && (
          <>
            <Field label={t.gearRatio.groupsetPicker.chainrings}>
              <Select value={chainringIdx} onChange={(e) => setChainringIdx(Number(e.target.value))}>
                {preset.chainringOptions.map((teeth, i) => (
                  <option key={i} value={i}>
                    {chainringComboLabel(teeth)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.gearRatio.groupsetPicker.cassette}>
              <Select value={cassetteIdx} onChange={(e) => setCassetteIdx(Number(e.target.value))}>
                {preset.cassetteOptions.map((teeth, i) => (
                  <option key={i} value={i}>
                    {cassetteLabel(teeth)}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        )}
      </div>
      {preset && (
        <div className="mt-3 flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => onApply(preset.chainringOptions[chainringIdx], preset.cassetteOptions[cassetteIdx])}
          >
            {t.gearRatio.groupsetPicker.useCombo}
          </Button>
          {preset.note && <p className="text-xs text-slate-500">{preset.note}</p>}
        </div>
      )}
    </Card>
  )
}

type Mode = 'kadence' | 'fart'

function cadenceComfortClass(rpm: number): string {
  if (rpm < 50 || rpm > 120) return 'text-red-400'
  if (rpm < 65 || rpm > 105) return 'text-amber-400'
  return 'text-brand-400'
}

export default function GearRatio() {
  const { t } = useLang()
  const [chainringsRaw, setChainringsRaw] = useState('50, 34')
  const [cogsRaw, setCogsRaw] = useState('11, 13, 15, 17, 19, 21, 24, 28, 32')
  const [wheelPreset, setWheelPreset] = useState('700x28-landevej')
  const [customMm, setCustomMm] = useState('2105')
  const [crankLength, setCrankLength] = useState('172.5')
  const [cadence, setCadence] = useState('90')
  const [mode, setMode] = useState<Mode>('kadence')
  const [targetSpeed, setTargetSpeed] = useState('30')

  const chainrings = useMemo(() => parseTeethList(chainringsRaw), [chainringsRaw])
  const cogs = useMemo(() => parseTeethList(cogsRaw), [cogsRaw])
  const wheelMm = useMemo(() => {
    if (wheelPreset === 'custom') return parseFloat(customMm.replace(',', '.')) || 2105
    return WHEEL_PRESETS.find((w) => w.value === wheelPreset)?.circumferenceMm ?? 2105
  }, [wheelPreset, customMm])

  const crank = parseFloat(crankLength.replace(',', '.')) || 172.5
  const cad = parseFloat(cadence.replace(',', '.')) || 90
  const speed = parseFloat(targetSpeed.replace(',', '.')) || 30

  const matrix = useMemo(
    () => (chainrings.length && cogs.length ? calcGearMatrix(chainrings, cogs, wheelMm, crank, cad) : []),
    [chainrings, cogs, wheelMm, crank, cad],
  )

  const range = useMemo(() => gearRangeSummary(matrix), [matrix])
  const cassetteSteps = useMemo(() => (cogs.length > 1 ? calcCassetteSteps(cogs) : []), [cogs])

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle subtitle={t.gearRatio.subtitle}>{t.gearRatio.title}</SectionTitle>

      <GroupsetPicker
        onApply={(chainringsTeeth, cogsTeeth) => {
          setChainringsRaw(chainringsTeeth.join(', '))
          setCogsRaw(cogsTeeth.join(', '))
        }}
      />

      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.gearRatio.form.chainrings} hint={t.gearRatio.form.chainringsHint}>
            <Input value={chainringsRaw} onChange={(e) => setChainringsRaw(e.target.value)} />
          </Field>
          <Field label={t.gearRatio.form.cassette}>
            <Input value={cogsRaw} onChange={(e) => setCogsRaw(e.target.value)} />
          </Field>
          <Field label={t.gearRatio.form.wheelTire}>
            <Select value={wheelPreset} onChange={(e) => setWheelPreset(e.target.value)}>
              {WHEEL_PRESETS.map((w) => (
                <option key={w.value} value={w.value}>
                  {wheelPresetDisplayLabel(w, t)}
                </option>
              ))}
            </Select>
          </Field>
          {wheelPreset === 'custom' && (
            <Field label={t.gearRatio.form.circumference}>
              <Input inputMode="decimal" value={customMm} onChange={(e) => setCustomMm(e.target.value)} />
            </Field>
          )}
          <Field label={t.gearRatio.form.crankLength}>
            <Input inputMode="decimal" value={crankLength} onChange={(e) => setCrankLength(e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex gap-1.5">
          <Button variant={mode === 'kadence' ? 'primary' : 'ghost'} onClick={() => setMode('kadence')}>
            {t.gearRatio.mode.cadenceToSpeed}
          </Button>
          <Button variant={mode === 'fart' ? 'primary' : 'ghost'} onClick={() => setMode('fart')}>
            {t.gearRatio.mode.speedToCadence}
          </Button>
        </div>
        {mode === 'kadence' ? (
          <Field label={t.gearRatio.mode.cadenceLabel} hint={t.gearRatio.mode.cadenceHint}>
            <Input inputMode="decimal" value={cadence} onChange={(e) => setCadence(e.target.value)} className="max-w-40" />
          </Field>
        ) : (
          <Field label={t.gearRatio.mode.speedLabel} hint={t.gearRatio.mode.speedHint}>
            <Input inputMode="decimal" value={targetSpeed} onChange={(e) => setTargetSpeed(e.target.value)} className="max-w-40" />
          </Field>
        )}
      </Card>

      {matrix.length > 0 && (
        <Card>
          <p className="mb-3 text-sm text-slate-400">
            {mode === 'kadence' ? (
              <>
                {t.gearRatio.matrix.atCadence(String(cad))} <span className="text-slate-600">{t.gearRatio.matrix.rolloutNote}</span>
              </>
            ) : (
              <>
                {t.gearRatio.matrix.toHoldSpeed(String(speed))}
                <span className="text-slate-600">{t.gearRatio.matrix.colorNote}</span>
              </>
            )}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-slate-900 px-2 py-1.5 text-left text-xs font-medium text-slate-500">
                    {t.gearRatio.matrix.chainringVsCassette}
                  </th>
                  {matrix[0].map((cell) => (
                    <th key={cell.cog} className="px-2 py-1.5 text-center text-xs font-medium text-slate-500">
                      {cell.cog}T
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={chainrings[i]} className="border-t border-slate-800">
                    <td className="sticky left-0 bg-slate-950 px-2 py-1.5 text-xs font-medium text-slate-300">
                      {chainrings[i]}T
                    </td>
                    {row.map((cell) => {
                      const rpm = requiredCadenceRpm(speed, cell.developmentM)
                      return (
                        <td key={cell.cog} className="px-2 py-1.5 text-center">
                          {mode === 'kadence' ? (
                            <div className="font-medium text-slate-100">{cell.speedKmh.toFixed(1)}</div>
                          ) : (
                            <div className={`font-medium ${cadenceComfortClass(rpm)}`}>{rpm.toFixed(0)}</div>
                          )}
                          <div className="text-[10px] text-slate-600">{cell.developmentM.toFixed(2)}m</div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {range && (
        <Card>
          <SectionTitle subtitle={t.gearRatio.range.subtitle}>{t.gearRatio.range.title}</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.gearRatio.range.easiest}</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">
                {range.easiest.chainring}T / {range.easiest.cog}T
              </p>
              <p className="text-xs text-slate-500">{t.gearRatio.range.rollout(range.easiest.developmentM.toFixed(2))}</p>
              <p className="mt-2 text-sm text-slate-300">
                60 rpm: {speedAtCadenceKmh(range.easiest.developmentM, 60).toFixed(1)} km/t · 80 rpm:{' '}
                {speedAtCadenceKmh(range.easiest.developmentM, 80).toFixed(1)} km/t
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.gearRatio.range.hardest}</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">
                {range.hardest.chainring}T / {range.hardest.cog}T
              </p>
              <p className="text-xs text-slate-500">{t.gearRatio.range.rollout(range.hardest.developmentM.toFixed(2))}</p>
              <p className="mt-2 text-sm text-slate-300">
                90 rpm: {speedAtCadenceKmh(range.hardest.developmentM, 90).toFixed(1)} km/t · 110 rpm:{' '}
                {speedAtCadenceKmh(range.hardest.developmentM, 110).toFixed(1)} km/t
              </p>
            </div>
          </div>
        </Card>
      )}

      {cassetteSteps.length > 0 && (
        <Card>
          <SectionTitle subtitle={t.gearRatio.cassetteSteps.subtitle}>{t.gearRatio.cassetteSteps.title}</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {cassetteSteps.map((s) => (
              <span
                key={`${s.fromCog}-${s.toCog}`}
                className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300"
              >
                {s.fromCog}T → {s.toCog}T{' '}
                <span className={s.percentJump > 15 ? 'font-medium text-amber-400' : 'font-medium text-slate-400'}>
                  +{s.percentJump.toFixed(0)}%
                </span>
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

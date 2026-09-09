import { useMemo, useState } from 'react'
import { Card, Field, Input, Select, SectionTitle } from '../components/ui'
import { WHEEL_PRESETS, calcGearMatrix, parseTeethList } from '../lib/gearRatio'

export default function GearRatio() {
  const [chainringsRaw, setChainringsRaw] = useState('50, 34')
  const [cogsRaw, setCogsRaw] = useState('11, 13, 15, 17, 19, 21, 24, 28, 32')
  const [wheelPreset, setWheelPreset] = useState('700x28')
  const [customMm, setCustomMm] = useState('2105')
  const [crankLength, setCrankLength] = useState('172.5')
  const [cadence, setCadence] = useState('90')

  const chainrings = useMemo(() => parseTeethList(chainringsRaw), [chainringsRaw])
  const cogs = useMemo(() => parseTeethList(cogsRaw), [cogsRaw])
  const wheelMm = useMemo(() => {
    if (wheelPreset === 'custom') return parseFloat(customMm.replace(',', '.')) || 2105
    return WHEEL_PRESETS.find((w) => w.value === wheelPreset)?.circumferenceMm ?? 2105
  }, [wheelPreset, customMm])

  const crank = parseFloat(crankLength.replace(',', '.')) || 172.5
  const cad = parseFloat(cadence.replace(',', '.')) || 90

  const matrix = useMemo(
    () => (chainrings.length && cogs.length ? calcGearMatrix(chainrings, cogs, wheelMm, crank, cad) : []),
    [chainrings, cogs, wheelMm, crank, cad],
  )

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle subtitle="Se udvekslinger, meter-udrulning og hastighed ved given kadence for dine klinger og kassette.">
        Gearudregner
      </SectionTitle>

      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Klinger (tænder, kommasepareret)" hint="fx 50, 34 for kompakt racer">
            <Input value={chainringsRaw} onChange={(e) => setChainringsRaw(e.target.value)} />
          </Field>
          <Field label="Kassette (tænder, kommasepareret)">
            <Input value={cogsRaw} onChange={(e) => setCogsRaw(e.target.value)} />
          </Field>
          <Field label="Hjul + dæk">
            <Select value={wheelPreset} onChange={(e) => setWheelPreset(e.target.value)}>
              {WHEEL_PRESETS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </Select>
          </Field>
          {wheelPreset === 'custom' && (
            <Field label="Omkreds (mm)">
              <Input inputMode="decimal" value={customMm} onChange={(e) => setCustomMm(e.target.value)} />
            </Field>
          )}
          <Field label="Kranklængde (mm)">
            <Input inputMode="decimal" value={crankLength} onChange={(e) => setCrankLength(e.target.value)} />
          </Field>
          <Field label="Kadence (omdr./min)">
            <Input inputMode="decimal" value={cadence} onChange={(e) => setCadence(e.target.value)} />
          </Field>
        </div>
      </Card>

      {matrix.length > 0 && (
        <Card>
          <p className="mb-3 text-sm text-slate-400">
            Hastighed (km/t) ved {cad} omdr./min · <span className="text-slate-600">udrulning i meter under tallet</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-slate-900 px-2 py-1.5 text-left text-xs font-medium text-slate-500">
                    Klinge \ Kassette
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
                    {row.map((cell) => (
                      <td key={cell.cog} className="px-2 py-1.5 text-center">
                        <div className="font-medium text-slate-100">{cell.speedKmh.toFixed(1)}</div>
                        <div className="text-[10px] text-slate-600">{cell.developmentM.toFixed(2)}m</div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

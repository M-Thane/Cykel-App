import type { PmcPoint } from '../lib/training'
import { fmtDate } from '../lib/format'

interface PmcChartProps {
  points: PmcPoint[]
  locale: string
  ctlLabel: string
  atlLabel: string
}

const WIDTH = 600
const HEIGHT = 160
const PAD = 8

export function PmcChart({ points, locale, ctlLabel, atlLabel }: PmcChartProps) {
  if (points.length === 0) return null
  const maxVal = Math.max(1, ...points.map((p) => Math.max(p.ctl, p.atl)))
  const n = points.length
  const x = (i: number) => PAD + (i / Math.max(1, n - 1)) * (WIDTH - PAD * 2)
  const y = (v: number) => HEIGHT - PAD - (v / maxVal) * (HEIGHT - PAD * 2)

  const path = (key: 'ctl' | 'atl') => points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-40 w-full">
        <path d={path('ctl')} fill="none" stroke="#38bdf8" strokeWidth={2.5} />
        <path d={path('atl')} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" />
      </svg>
      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600">
        <span>{fmtDate(points[0].date, locale)}</span>
        <span>{fmtDate(points[points.length - 1].date, locale)}</span>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3 rounded bg-sky-400" />
          {ctlLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0 w-3 border-t-2 border-dashed border-amber-500" />
          {atlLabel}
        </span>
      </div>
    </div>
  )
}

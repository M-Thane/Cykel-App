import type { RideLog, TrainingGoal } from '../types'

export const TRAINING_GOALS: TrainingGoal[] = ['udholdenhed', 'fart', 'vaegttab', 'event', 'generel']

// --- Power zones (Coggan 7-zone model, % of FTP) ---
export interface PowerZone {
  zone: number
  minPct: number
  maxPct: number | null
  minW: number
  maxW: number | null
}

const POWER_ZONE_BOUNDS: { minPct: number; maxPct: number | null }[] = [
  { minPct: 0, maxPct: 55 },
  { minPct: 56, maxPct: 75 },
  { minPct: 76, maxPct: 90 },
  { minPct: 91, maxPct: 105 },
  { minPct: 106, maxPct: 120 },
  { minPct: 121, maxPct: 150 },
  { minPct: 151, maxPct: null },
]

export function calcPowerZones(ftpWatts: number): PowerZone[] {
  return POWER_ZONE_BOUNDS.map((b, i) => ({
    zone: i + 1,
    minPct: b.minPct,
    maxPct: b.maxPct,
    minW: Math.round((ftpWatts * b.minPct) / 100),
    maxW: b.maxPct === null ? null : Math.round((ftpWatts * b.maxPct) / 100),
  }))
}

// --- Heart rate zones (5-zone model, % of max HR) ---
export interface HrZone {
  zone: number
  minPct: number
  maxPct: number
  minBpm: number
  maxBpm: number
}

const HR_ZONE_BOUNDS: { minPct: number; maxPct: number }[] = [
  { minPct: 50, maxPct: 60 },
  { minPct: 60, maxPct: 70 },
  { minPct: 70, maxPct: 80 },
  { minPct: 80, maxPct: 90 },
  { minPct: 90, maxPct: 100 },
]

export function calcHrZones(maxHr: number): HrZone[] {
  return HR_ZONE_BOUNDS.map((b, i) => ({
    zone: i + 1,
    minPct: b.minPct,
    maxPct: b.maxPct,
    minBpm: Math.round((maxHr * b.minPct) / 100),
    maxBpm: Math.round((maxHr * b.maxPct) / 100),
  }))
}

// --- Weekly plan template ---
export type WorkoutType = 'hvile' | 'endurance' | 'interval' | 'tempo' | 'lang_tur' | 'restitution'

export interface PlanDay {
  dayIdx: number // 0 = Monday .. 6 = Sunday
  type: WorkoutType
}

const GOAL_TEMPLATES: Record<TrainingGoal, WorkoutType[]> = {
  udholdenhed: ['endurance', 'endurance', 'lang_tur', 'endurance', 'restitution', 'endurance'],
  fart: ['interval', 'endurance', 'tempo', 'endurance', 'interval', 'lang_tur'],
  vaegttab: ['endurance', 'endurance', 'tempo', 'endurance', 'endurance', 'lang_tur'],
  event: ['lang_tur', 'endurance', 'tempo', 'endurance', 'interval', 'endurance'],
  generel: ['endurance', 'tempo', 'endurance', 'interval', 'endurance', 'lang_tur'],
}

function evenDayIndices(n: number): number[] {
  const idx: number[] = []
  for (let i = 0; i < n; i++) idx.push(Math.round((i * 7) / n) % 7)
  return [...new Set(idx)]
}

/** A generic weekly workout-type template for a goal and training frequency (1-6 days/week). */
export function generateWeekPlan(goal: TrainingGoal, daysPerWeek: number): PlanDay[] {
  const n = Math.min(Math.max(Math.round(daysPerWeek), 1), 6)
  const template = GOAL_TEMPLATES[goal].slice(0, n)
  const dayIdx = evenDayIndices(n)
  const week: PlanDay[] = Array.from({ length: 7 }, (_, i) => ({ dayIdx: i, type: 'hvile' as WorkoutType }))
  dayIdx.forEach((d, i) => {
    week[d] = { dayIdx: d, type: template[i] ?? 'hvile' }
  })
  return week
}

// --- Ride analysis ---
export interface WeekSummary {
  weekStartIso: string
  km: number
  rideCount: number
  hours: number | null
}

function mondayOfIso(dateIso: string): string {
  const d = new Date(dateIso + 'T00:00:00')
  const dow = (d.getDay() + 6) % 7 // 0 = Monday
  d.setDate(d.getDate() - dow)
  return d.toISOString().slice(0, 10)
}

/** Groups all rides into ISO (Monday-start) weeks, returning the last `numWeeks` weeks oldest-first, including empty weeks. */
export function weeklySummaries(rides: RideLog[], numWeeks: number): WeekSummary[] {
  const today = new Date()
  const currentMonday = mondayOfIso(today.toISOString().slice(0, 10))

  const weeks: WeekSummary[] = []
  for (let i = numWeeks - 1; i >= 0; i--) {
    const d = new Date(currentMonday + 'T00:00:00')
    d.setDate(d.getDate() - i * 7)
    weeks.push({ weekStartIso: d.toISOString().slice(0, 10), km: 0, rideCount: 0, hours: null })
  }

  const byWeek = new Map(weeks.map((w) => [w.weekStartIso, w]))
  for (const r of rides) {
    const wk = byWeek.get(mondayOfIso(r.date))
    if (!wk) continue
    wk.km += r.km
    wk.rideCount += 1
    if (r.durationMin) wk.hours = (wk.hours ?? 0) + r.durationMin / 60
  }
  return weeks
}

/** Current (this Monday-start) week's summary from all rides. */
export function currentWeekSummary(rides: RideLog[]): WeekSummary {
  return weeklySummaries(rides, 1)[0]
}

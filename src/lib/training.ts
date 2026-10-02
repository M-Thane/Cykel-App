import type { RideLog, TrainingGoal, TrainingProfile } from '../types'

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

// All date math below is done with Date.UTC/getUTCDay/setUTCDate on purpose:
// mixing local-time Date methods with toISOString() (which is always UTC)
// silently shifts dates by a day in any timezone ahead of UTC, which broke
// week-matching for every ride for anyone not in UTC+0.
function mondayOfIso(dateIso: string): string {
  const [y, m, d] = dateIso.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d))
  const dow = (utc.getUTCDay() + 6) % 7 // 0 = Monday
  utc.setUTCDate(utc.getUTCDate() - dow)
  return utc.toISOString().slice(0, 10)
}

/** Today's calendar date (in the viewer's local timezone) as an ISO date string. */
function todayLocalIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Groups all rides into ISO (Monday-start) weeks, returning the last `numWeeks` weeks oldest-first, including empty weeks. */
export function weeklySummaries(rides: RideLog[], numWeeks: number): WeekSummary[] {
  const currentMonday = mondayOfIso(todayLocalIso())
  const [cy, cm, cd] = currentMonday.split('-').map(Number)

  const weeks: WeekSummary[] = []
  for (let i = numWeeks - 1; i >= 0; i--) {
    const utc = new Date(Date.UTC(cy, cm - 1, cd))
    utc.setUTCDate(utc.getUTCDate() - i * 7)
    weeks.push({ weekStartIso: utc.toISOString().slice(0, 10), km: 0, rideCount: 0, hours: null })
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

// --- Latest-ride vs. plan assessment ---

function dayIdxOfIso(dateIso: string): number {
  const [y, m, d] = dateIso.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d))
  return (utc.getUTCDay() + 6) % 7 // 0 = Monday
}

function zoneForPower(zones: PowerZone[], watts: number): number {
  for (const z of zones) {
    if (z.maxW === null || watts <= z.maxW) return z.zone
  }
  return zones[zones.length - 1].zone
}

function zoneForHr(zones: HrZone[], bpm: number): number {
  for (const z of zones) {
    if (bpm <= z.maxBpm) return z.zone
  }
  return zones[zones.length - 1].zone
}

// Expected average-intensity zone range per workout type. These are ranges
// for the whole-ride *average*, which is all Strava gives us -- for
// `interval`, the average can't show whether the hard efforts actually
// happened, only the overall load, so the UI adds a caveat for that type.
const EXPECTED_ZONE_POWER: Partial<Record<WorkoutType, [number, number]>> = {
  restitution: [1, 1],
  endurance: [1, 2],
  lang_tur: [1, 2],
  tempo: [3, 3],
  interval: [3, 5],
}

const EXPECTED_ZONE_HR: Partial<Record<WorkoutType, [number, number]>> = {
  restitution: [1, 1],
  endurance: [1, 2],
  lang_tur: [1, 2],
  tempo: [3, 3],
  interval: [2, 4],
}

export type IntensityOutcome = 'match' | 'too_hard' | 'too_easy'

export type AssessmentCheck =
  | { kind: 'intensity'; outcome: IntensityOutcome; source: 'power' | 'hr'; zone: number; zoneCount: number; expectedMin: number; expectedMax: number }
  | { kind: 'longest_of_week'; outcome: 'match' | 'mismatch' }

export interface RideAssessment {
  ride: RideLog
  plannedType: WorkoutType | null
  checks: AssessmentCheck[]
}

/**
 * Compares the most recent ride against the generated week plan for that
 * day. Only produces checks the data actually supports -- e.g. no intensity
 * check when the ride has no HR/power or the profile has no FTP/max HR --
 * so the UI never has to invent an assessment it can't back up.
 */
export function assessLatestRide(
  rides: RideLog[],
  weekPlan: PlanDay[] | null,
  powerZones: PowerZone[] | null,
  hrZones: HrZone[] | null,
): RideAssessment | null {
  if (rides.length === 0) return null
  const latest = [...rides].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))[0]

  const plannedType = weekPlan ? (weekPlan.find((d) => d.dayIdx === dayIdxOfIso(latest.date))?.type ?? null) : null
  const checks: AssessmentCheck[] = []

  if (plannedType && plannedType !== 'hvile') {
    if (latest.avgWatts != null && powerZones) {
      const zone = zoneForPower(powerZones, latest.avgWatts)
      const expected = EXPECTED_ZONE_POWER[plannedType]
      if (expected) {
        const outcome: IntensityOutcome = zone < expected[0] ? 'too_easy' : zone > expected[1] ? 'too_hard' : 'match'
        checks.push({ kind: 'intensity', outcome, source: 'power', zone, zoneCount: powerZones.length, expectedMin: expected[0], expectedMax: expected[1] })
      }
    } else if (latest.avgHeartrate != null && hrZones) {
      const zone = zoneForHr(hrZones, latest.avgHeartrate)
      const expected = EXPECTED_ZONE_HR[plannedType]
      if (expected) {
        const outcome: IntensityOutcome = zone < expected[0] ? 'too_easy' : zone > expected[1] ? 'too_hard' : 'match'
        checks.push({ kind: 'intensity', outcome, source: 'hr', zone, zoneCount: hrZones.length, expectedMin: expected[0], expectedMax: expected[1] })
      }
    }

    if (plannedType === 'lang_tur') {
      const monday = mondayOfIso(latest.date)
      const weekRides = rides.filter((r) => mondayOfIso(r.date) === monday)
      const maxKm = Math.max(...weekRides.map((r) => r.km))
      checks.push({ kind: 'longest_of_week', outcome: latest.km >= maxKm ? 'match' : 'mismatch' })
    }
  }

  return { ride: latest, plannedType, checks }
}

// --- Performance Management Chart: CTL (fitness) / ATL (fatigue) / TSB (form) ---
// Standard Banister-model exponentially-weighted rolling averages of daily
// Training Stress Score, as used by TrainingPeaks/Strava/intervals.icu.

const CTL_DAYS = 42
const ATL_DAYS = 7

function addDaysIso(dateIso: string, days: number): string {
  const [y, m, d] = dateIso.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d))
  utc.setUTCDate(utc.getUTCDate() + days)
  return utc.toISOString().slice(0, 10)
}

/**
 * Estimated TSS for a ride. Needs a duration plus either avg watts + FTP,
 * or avg heart rate + max HR -- returns null otherwise.
 *
 * This is a simplified estimate: real TSS uses Normalized Power (from a
 * second-by-second power stream), which Strava's activity summary doesn't
 * give us, so average power/HR is used as a stand-in for intensity. That
 * underestimates the true score for rides with hard, variable efforts
 * (intervals), which the UI calls out rather than presenting as exact.
 */
function estimateRideTss(ride: RideLog, profile: TrainingProfile): number | null {
  const hours = ride.durationMin ? ride.durationMin / 60 : null
  if (!hours || hours <= 0) return null
  if (ride.avgWatts != null && profile.ftpWatts) {
    const intensity = ride.avgWatts / profile.ftpWatts
    return hours * intensity * intensity * 100
  }
  if (ride.avgHeartrate != null && profile.maxHr) {
    const intensity = ride.avgHeartrate / profile.maxHr
    return hours * intensity * intensity * 100
  }
  return null
}

export interface PmcPoint {
  date: string
  tss: number
  ctl: number
  atl: number
  tsb: number
}

/**
 * Daily fitness (CTL), fatigue (ATL) and form (TSB) for the last `windowDays`
 * days, estimated from logged rides. Returns [] when there isn't enough data
 * to estimate TSS for any ride (no FTP/max HR in the profile, or no ride has
 * duration + power/HR) -- the UI should show an explicit "not enough data"
 * state rather than a flat, meaningless curve.
 *
 * The rolling averages are seeded from the earliest ride with usable data
 * (even if that's before the display window) so CTL/ATL have ramped up
 * realistically by the time the returned window starts.
 */
export function computePmc(rides: RideLog[], profile: TrainingProfile, windowDays = 90): PmcPoint[] {
  const tssByDate = new Map<string, number>()
  let hasAnyTss = false
  for (const r of rides) {
    const tss = estimateRideTss(r, profile)
    if (tss == null) continue
    hasAnyTss = true
    tssByDate.set(r.date, (tssByDate.get(r.date) ?? 0) + tss)
  }
  if (!hasAnyTss) return []

  const earliest = [...tssByDate.keys()].sort()[0]
  const today = todayLocalIso()

  const points: PmcPoint[] = []
  let ctl = 0
  let atl = 0
  let cursor = earliest
  while (cursor <= today) {
    const tss = tssByDate.get(cursor) ?? 0
    const tsb = ctl - atl // form entering this day, before today's session
    ctl = ctl + (tss - ctl) / CTL_DAYS
    atl = atl + (tss - atl) / ATL_DAYS
    points.push({ date: cursor, tss, ctl, atl, tsb })
    cursor = addDaysIso(cursor, 1)
  }

  const cutoff = addDaysIso(today, -windowDays)
  return points.filter((p) => p.date >= cutoff)
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, RefreshCw } from 'lucide-react'
import { Button, Card, EmptyState, Field, Input, Select, SectionTitle } from '../components/ui'
import { useAppStore } from '../store/useAppStore'
import { fmtKm } from '../lib/format'
import { api } from '../lib/api/client'
import {
  TRAINING_GOALS,
  adjustWeekPlanForFeeling,
  assessLatestRide,
  calcHrZones,
  calcPowerZones,
  computePmc,
  currentWeekSummary,
  generateWeekPlan,
  recentAvgRpe,
  weeklySummaries,
} from '../lib/training'
import type { RideLog, TrainingGoal } from '../types'
import { useLang } from '../lib/i18n/context'
import type { Dict } from '../lib/i18n/da'
import { fmtDate } from '../lib/format'
import { PmcChart } from '../components/PmcChart'

type LatestRideLabels = Dict['training']['latestRide']

function RideFeelingForm({ ride, labels, onSave }: { ride: RideLog; labels: LatestRideLabels; onSave: (rpe: number, note?: string) => void }) {
  const [rpeDraft, setRpeDraft] = useState<number | null>(ride.rpe ?? null)
  const [noteDraft, setNoteDraft] = useState(ride.feelingNote ?? '')

  return (
    <div className="mb-4 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
      <p className="mb-2 text-xs font-medium text-slate-300">{labels.feelingQuestion}</p>
      <div className="mb-2 flex gap-1.5">
        {labels.rpeScale.map((label, i) => {
          const value = i + 1
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRpeDraft(value)}
              className={`flex-1 rounded-lg border px-1 py-1.5 text-[10px] font-medium transition-colors ${
                rpeDraft === value ? 'border-brand-500 bg-brand-900/50 text-brand-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
      <Input value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder={labels.feelingNotePlaceholder} className="mb-2" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="secondary" onClick={() => rpeDraft != null && onSave(rpeDraft, noteDraft.trim() || undefined)} disabled={rpeDraft == null}>
          {labels.saveFeeling}
        </Button>
        {ride.rpe != null && <span className="text-xs text-slate-500">{labels.feelingSaved(labels.rpeScale[ride.rpe - 1])}</span>}
      </div>
      <p className="mt-2 text-[11px] text-slate-500">{labels.feelingInfo}</p>
    </div>
  )
}

export default function Training() {
  const { t, locale } = useLang()
  const profile = useAppStore((s) => s.trainingProfile)
  const rides = useAppStore((s) => s.rides)
  const defaultBikeId = useAppStore((s) => s.defaultBikeId)
  const updateTrainingProfile = useAppStore((s) => s.updateTrainingProfile)
  const logRideFeeling = useAppStore((s) => s.logRideFeeling)
  const refreshIfStale = useAppStore((s) => s.refreshIfStale)
  const loadState = useAppStore((s) => s.loadState)

  const [syncBusy, setSyncBusy] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  // Pick up Strava-synced rides from the last few minutes without requiring
  // a full app reload -- goals/zones/plan are all derived from `rides`.
  useEffect(() => {
    refreshIfStale()
  }, [refreshIfStale])

  async function handleSync() {
    setSyncBusy(true)
    setSyncResult(null)
    try {
      const { imported } = await api.importStravaHistory()
      setSyncResult(t.login.importHistoryResult(imported))
      await loadState()
    } catch {
      setSyncResult(t.login.importHistoryError)
    } finally {
      setSyncBusy(false)
    }
  }

  const powerZones = useMemo(() => (profile.ftpWatts ? calcPowerZones(profile.ftpWatts) : null), [profile.ftpWatts])
  const hrZones = useMemo(() => (profile.maxHr ? calcHrZones(profile.maxHr) : null), [profile.maxHr])

  const daysPerWeek = profile.weeklyGoalDays ?? 3
  const rawWeekPlan = useMemo(
    () => (profile.goal ? generateWeekPlan(profile.goal, daysPerWeek) : null),
    [profile.goal, daysPerWeek],
  )
  const avgRpe = useMemo(() => recentAvgRpe(rides, 10), [rides])
  const { plan: weekPlan, adjustment: planAdjustment } = useMemo(
    () => (rawWeekPlan ? adjustWeekPlanForFeeling(rawWeekPlan, avgRpe) : { plan: null, adjustment: 'none' as const }),
    [rawWeekPlan, avgRpe],
  )

  const weeks = useMemo(() => weeklySummaries(rides, 8), [rides])
  const thisWeek = useMemo(() => currentWeekSummary(rides), [rides])
  const maxWeekKm = Math.max(1, ...weeks.map((w) => w.km))
  const hasAnyRideInWindow = weeks.some((w) => w.rideCount > 0)

  const pmc = useMemo(() => computePmc(rides, profile, 90), [rides, profile])
  const latestPmc = pmc.length > 0 ? pmc[pmc.length - 1] : null
  const tsbTone = latestPmc ? (latestPmc.tsb >= 5 ? 'fresh' : latestPmc.tsb <= -10 ? 'tired' : 'neutral') : null

  const latestRide = useMemo(() => assessLatestRide(rides, rawWeekPlan, powerZones, hrZones), [rides, rawWeekPlan, powerZones, hrZones])
  const latestRideTypeName = latestRide?.plannedType ? t.workoutTypes[latestRide.plannedType].name : ''
  const wentWell: string[] = []
  const toImprove: string[] = []
  if (latestRide) {
    for (const c of latestRide.checks) {
      if (c.kind === 'intensity') {
        if (c.outcome === 'match') wentWell.push(t.training.latestRide.intensityMatch(latestRideTypeName, c.zone, c.zoneCount))
        else if (c.outcome === 'too_hard') toImprove.push(t.training.latestRide.intensityTooHard(latestRideTypeName, c.zone, c.expectedMax))
        else toImprove.push(t.training.latestRide.intensityTooEasy(latestRideTypeName, c.zone, c.expectedMin))
      } else if (c.kind === 'longest_of_week') {
        if (c.outcome === 'match') wentWell.push(t.training.latestRide.longestMatch)
        else toImprove.push(t.training.latestRide.longestMismatch)
      }
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionTitle subtitle={t.training.subtitle}>{t.training.title}</SectionTitle>
        {defaultBikeId ? (
          <div className="flex flex-col items-end gap-1">
            <Button variant="secondary" onClick={handleSync} disabled={syncBusy}>
              <RefreshCw size={14} className={syncBusy ? 'animate-spin' : ''} />
              {syncBusy ? t.login.importHistoryBusy : t.login.importHistory}
            </Button>
            {syncResult && <span className="text-xs text-slate-500">{syncResult}</span>}
          </div>
        ) : (
          <Link to="/sliddele" className="text-xs text-slate-500 underline hover:text-slate-300">
            {t.login.defaultBike}
          </Link>
        )}
      </div>

      <Card>
        <SectionTitle subtitle={t.training.profile.subtitle}>{t.training.profile.title}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.training.profile.ftp} hint={t.training.profile.ftpHint}>
            <Input
              inputMode="decimal"
              placeholder="fx 250"
              value={profile.ftpWatts ?? ''}
              onChange={(e) => updateTrainingProfile({ ftpWatts: e.target.value ? Number(e.target.value) : undefined })}
            />
          </Field>
          <Field label={t.training.profile.maxHr} hint={t.training.profile.maxHrHint}>
            <Input
              inputMode="decimal"
              placeholder="fx 185"
              value={profile.maxHr ?? ''}
              onChange={(e) => updateTrainingProfile({ maxHr: e.target.value ? Number(e.target.value) : undefined })}
            />
          </Field>
          <Field label={t.training.profile.weeklyGoalKm}>
            <Input
              inputMode="decimal"
              placeholder="fx 100"
              value={profile.weeklyGoalKm ?? ''}
              onChange={(e) => updateTrainingProfile({ weeklyGoalKm: e.target.value ? Number(e.target.value) : undefined })}
            />
          </Field>
          <Field label={t.training.profile.weeklyGoalDays}>
            <Input
              inputMode="decimal"
              placeholder="fx 3"
              value={profile.weeklyGoalDays ?? ''}
              onChange={(e) => updateTrainingProfile({ weeklyGoalDays: e.target.value ? Number(e.target.value) : undefined })}
            />
          </Field>
          <Field label={t.training.profile.goal}>
            <Select
              value={profile.goal ?? ''}
              onChange={(e) => updateTrainingProfile({ goal: (e.target.value || undefined) as TrainingGoal | undefined })}
            >
              <option value="">{t.training.profile.chooseGoal}</option>
              {TRAINING_GOALS.map((g) => (
                <option key={g} value={g}>
                  {t.trainingGoals[g]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <div>
        <SectionTitle>{t.training.zones.title}</SectionTitle>
        {!powerZones && !hrZones ? (
          <EmptyState title={t.training.zones.emptyTitle} description={t.training.zones.emptyDesc} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {powerZones && (
              <Card>
                <p className="mb-2 text-sm font-medium text-slate-200">{t.training.zones.powerTitle}</p>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500">
                      <th className="py-1 pr-2">{t.training.zones.zoneCol}</th>
                      <th className="py-1 pr-2">{t.training.zones.rangeCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {powerZones.map((z) => (
                      <tr key={z.zone} className="border-t border-slate-800">
                        <td className="py-1.5 pr-2 text-slate-200">
                          {z.zone}. {t.training.zones.powerZoneNames[z.zone - 1]}
                        </td>
                        <td className="py-1.5 pr-2 text-slate-300">
                          {z.maxW === null ? `${z.minW}+ W` : `${z.minW}–${z.maxW} W`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
            {hrZones && (
              <Card>
                <p className="mb-2 text-sm font-medium text-slate-200">{t.training.zones.hrTitle}</p>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500">
                      <th className="py-1 pr-2">{t.training.zones.zoneCol}</th>
                      <th className="py-1 pr-2">{t.training.zones.rangeCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hrZones.map((z) => (
                      <tr key={z.zone} className="border-t border-slate-800">
                        <td className="py-1.5 pr-2 text-slate-200">
                          {z.zone}. {t.training.zones.hrZoneNames[z.zone - 1]}
                        </td>
                        <td className="py-1.5 pr-2 text-slate-300">{`${z.minBpm}–${z.maxBpm} bpm`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        )}
      </div>

      <div>
        <SectionTitle subtitle={weekPlan ? t.training.plan.subtitle : undefined}>{t.training.plan.title}</SectionTitle>
        {!weekPlan ? (
          <EmptyState title={t.training.plan.emptyTitle} description={t.training.plan.emptyDesc} />
        ) : (
          <Card>
            {planAdjustment !== 'none' && avgRpe != null && (
              <p
                className={`mb-3 rounded-lg px-3 py-2 text-xs ${
                  planAdjustment === 'lightened' ? 'bg-amber-900/30 text-amber-300' : 'bg-sky-900/30 text-sky-300'
                }`}
              >
                {planAdjustment === 'lightened' ? t.training.plan.lightened(avgRpe.toFixed(1)) : t.training.plan.intensified(avgRpe.toFixed(1))}
              </p>
            )}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekPlan.map((day) => (
                <div key={day.dayIdx} className="flex flex-col items-center gap-1 rounded-lg border border-slate-800 p-1.5 text-center sm:p-2">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                    {t.training.plan.weekdaysShort[day.dayIdx]}
                  </span>
                  <span
                    className={`text-[11px] font-medium sm:text-sm ${day.type === 'hvile' ? 'text-slate-600' : 'text-brand-400'}`}
                  >
                    {t.workoutTypes[day.type].name}
                  </span>
                </div>
              ))}
            </div>
            <ul className="mt-3 flex flex-col gap-1.5 text-xs text-slate-500">
              {[...new Set(weekPlan.map((d) => d.type))]
                .filter((ty) => ty !== 'hvile')
                .map((ty) => (
                  <li key={ty}>
                    <span className="font-medium text-slate-400">{t.workoutTypes[ty].name}:</span> {t.workoutTypes[ty].desc}
                  </li>
                ))}
            </ul>
          </Card>
        )}
      </div>

      {latestRide && (
        <div>
          <SectionTitle subtitle={t.training.latestRide.subtitle}>{t.training.latestRide.title}</SectionTitle>
          <Card>
            <div className="mb-3 flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-slate-500">{t.training.latestRide.dateLabel}</p>
                <p className="text-sm text-slate-200">{fmtDate(latestRide.ride.date, locale)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.training.latestRide.kmLabel}</p>
                <p className="text-sm text-slate-200">{fmtKm(latestRide.ride.km, locale)}</p>
              </div>
              {latestRide.ride.durationMin != null && (
                <div>
                  <p className="text-xs text-slate-500">{t.training.latestRide.durationLabel}</p>
                  <p className="text-sm text-slate-200">{Math.round(latestRide.ride.durationMin)} min</p>
                </div>
              )}
              {latestRide.ride.durationMin && latestRide.ride.km > 0 && (
                <div>
                  <p className="text-xs text-slate-500">{t.training.latestRide.avgSpeedLabel}</p>
                  <p className="text-sm text-slate-200">{((latestRide.ride.km / latestRide.ride.durationMin) * 60).toFixed(1)} km/t</p>
                </div>
              )}
              {latestRide.ride.avgHeartrate != null && (
                <div>
                  <p className="text-xs text-slate-500">{t.training.latestRide.avgHrLabel}</p>
                  <p className="text-sm text-slate-200">{Math.round(latestRide.ride.avgHeartrate)} bpm</p>
                </div>
              )}
              {latestRide.ride.avgWatts != null && (
                <div>
                  <p className="text-xs text-slate-500">{t.training.latestRide.avgPowerLabel}</p>
                  <p className="text-sm text-slate-200">{Math.round(latestRide.ride.avgWatts)} W</p>
                </div>
              )}
            </div>

            <RideFeelingForm
              key={latestRide.ride.id}
              ride={latestRide.ride}
              labels={t.training.latestRide}
              onSave={(rpe, note) => logRideFeeling(latestRide.ride.id, rpe, note)}
            />

            {!weekPlan ? (
              <p className="text-sm text-slate-400">{t.training.latestRide.noPlanMessage}</p>
            ) : latestRide.plannedType === 'hvile' ? (
              <p className="text-sm text-slate-400">{t.training.latestRide.restDayMessage(fmtKm(latestRide.ride.km, locale))}</p>
            ) : (
              <>
                {latestRide.checks.length === 0 && (
                  <p className="text-sm text-slate-400">{t.training.latestRide.noIntensityMessage(latestRideTypeName)}</p>
                )}
                {wentWell.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-500">{t.training.latestRide.wentWellTitle}</p>
                    <ul className="mt-1 list-disc pl-4 text-sm text-slate-300">
                      {wentWell.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {toImprove.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-amber-500">{t.training.latestRide.improveTitle}</p>
                    <ul className="mt-1 list-disc pl-4 text-sm text-slate-300">
                      {toImprove.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {latestRide.plannedType === 'interval' && (
                  <p className="mt-2 text-xs text-slate-500">{t.training.latestRide.intervalCaveat}</p>
                )}
              </>
            )}
          </Card>
        </div>
      )}

      <div>
        <SectionTitle subtitle={t.training.analysis.subtitle}>{t.training.analysis.title}</SectionTitle>
        {!hasAnyRideInWindow ? (
          <EmptyState title={t.training.analysis.noRides} />
        ) : (
          <Card>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.training.analysis.thisWeek}</p>
                <p className="mt-1 text-2xl font-semibold text-brand-400">{fmtKm(thisWeek.km, locale)}</p>
                {profile.weeklyGoalKm && (
                  <p className="text-xs text-slate-500">
                    {t.training.analysis.vsGoal(fmtKm(thisWeek.km, locale), fmtKm(profile.weeklyGoalKm, locale))}
                  </p>
                )}
                {profile.weeklyGoalDays && (
                  <p className="text-xs text-slate-500">{t.training.analysis.daysRidden(thisWeek.rideCount, profile.weeklyGoalDays)}</p>
                )}
                {thisWeek.hours && thisWeek.km > 0 && (
                  <p className="text-xs text-slate-500">{t.training.analysis.avgPace((thisWeek.km / thisWeek.hours).toFixed(1))}</p>
                )}
              </div>
            </div>
            <div className="flex items-end gap-1.5 sm:gap-2">
              {weeks.map((w) => (
                <div key={w.weekStartIso} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-24 w-full items-end">
                    <div
                      className="w-full rounded-t bg-brand-600"
                      style={{ height: `${Math.max(2, (w.km / maxWeekKm) * 100)}%` }}
                      title={fmtKm(w.km, locale)}
                    />
                  </div>
                  <span className="text-[10px] text-slate-600">{w.km > 0 ? Math.round(w.km) : ''}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div>
        <SectionTitle subtitle={t.training.pmc.subtitle}>{t.training.pmc.title}</SectionTitle>
        {!latestPmc ? (
          <EmptyState title={t.training.pmc.emptyTitle} description={t.training.pmc.emptyDesc} />
        ) : (
          <Card>
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.training.pmc.ctl}</p>
                <p className="mt-1 text-2xl font-semibold text-sky-400">{latestPmc.ctl.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.training.pmc.atl}</p>
                <p className="mt-1 text-2xl font-semibold text-amber-500">{latestPmc.atl.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.training.pmc.tsb}</p>
                <p
                  className={`mt-1 text-2xl font-semibold ${
                    tsbTone === 'fresh' ? 'text-emerald-400' : tsbTone === 'tired' ? 'text-red-400' : 'text-slate-300'
                  }`}
                >
                  {latestPmc.tsb > 0 ? '+' : ''}
                  {latestPmc.tsb.toFixed(1)}
                </p>
                <p className="text-xs text-slate-500">
                  {tsbTone === 'fresh' ? t.training.pmc.tsbFresh : tsbTone === 'tired' ? t.training.pmc.tsbTired : t.training.pmc.tsbNeutral}
                </p>
              </div>
            </div>
            <PmcChart points={pmc} locale={locale} ctlLabel={t.training.pmc.ctl} atlLabel={t.training.pmc.atl} />
          </Card>
        )}
      </div>

      <Card className="flex gap-2.5 text-sm text-slate-400">
        <Info size={16} className="mt-0.5 shrink-0 text-slate-500" />
        <div>
          <p>{t.training.info.p1}</p>
          <p className="mt-1.5">{t.training.info.p2}</p>
          <p className="mt-1.5">{t.training.info.p3}</p>
        </div>
      </Card>
    </div>
  )
}

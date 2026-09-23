import { useEffect, useMemo } from 'react'
import { Info } from 'lucide-react'
import { Card, EmptyState, Field, Input, Select, SectionTitle } from '../components/ui'
import { useAppStore } from '../store/useAppStore'
import { fmtKm } from '../lib/format'
import {
  TRAINING_GOALS,
  calcHrZones,
  calcPowerZones,
  currentWeekSummary,
  generateWeekPlan,
  weeklySummaries,
} from '../lib/training'
import type { TrainingGoal } from '../types'
import { useLang } from '../lib/i18n/context'

export default function Training() {
  const { t, locale } = useLang()
  const profile = useAppStore((s) => s.trainingProfile)
  const rides = useAppStore((s) => s.rides)
  const updateTrainingProfile = useAppStore((s) => s.updateTrainingProfile)
  const refreshIfStale = useAppStore((s) => s.refreshIfStale)

  // Pick up Strava-synced rides from the last few minutes without requiring
  // a full app reload -- goals/zones/plan are all derived from `rides`.
  useEffect(() => {
    refreshIfStale()
  }, [refreshIfStale])

  const powerZones = useMemo(() => (profile.ftpWatts ? calcPowerZones(profile.ftpWatts) : null), [profile.ftpWatts])
  const hrZones = useMemo(() => (profile.maxHr ? calcHrZones(profile.maxHr) : null), [profile.maxHr])

  const daysPerWeek = profile.weeklyGoalDays ?? 3
  const weekPlan = useMemo(
    () => (profile.goal ? generateWeekPlan(profile.goal, daysPerWeek) : null),
    [profile.goal, daysPerWeek],
  )

  const weeks = useMemo(() => weeklySummaries(rides, 8), [rides])
  const thisWeek = useMemo(() => currentWeekSummary(rides), [rides])
  const maxWeekKm = Math.max(1, ...weeks.map((w) => w.km))
  const hasAnyRideInWindow = weeks.some((w) => w.rideCount > 0)

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle subtitle={t.training.subtitle}>{t.training.title}</SectionTitle>

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

      <Card className="flex gap-2.5 text-sm text-slate-400">
        <Info size={16} className="mt-0.5 shrink-0 text-slate-500" />
        <div>
          <p>{t.training.info.p1}</p>
          <p className="mt-1.5">{t.training.info.p2}</p>
        </div>
      </Card>
    </div>
  )
}

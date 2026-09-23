import { create } from 'zustand'
import type { Bike, Discipline, RideLog, WearComponent, ComponentType, TrainingProfile, TrainingGoal } from '../types'
import { defaultLifespan, componentLabel } from '../lib/componentDefs'
import { todayIso } from '../lib/format'
import { api, type ApiBike, type ApiComponent, type ApiRide, type ApiTrainingProfile } from '../lib/api/client'

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : 'Ukendt fejl'
}

function bikeFromApi(a: ApiBike): Bike {
  return { id: a.id, name: a.name, discipline: a.discipline as Discipline, createdAt: a.created_at, archived: a.archived }
}

function componentFromApi(a: ApiComponent): WearComponent {
  return {
    id: a.id,
    bikeId: a.bike_id,
    type: a.type as ComponentType,
    customLabel: a.custom_label ?? undefined,
    installedAtKm: Number(a.installed_at_km),
    installedAtDate: a.installed_at_date,
    lifespanKm: Number(a.lifespan_km),
    active: a.active,
    replacedAtKm: a.replaced_at_km ?? undefined,
    replacedAtDate: a.replaced_at_date ?? undefined,
    notes: a.notes ?? undefined,
  }
}

function rideFromApi(a: ApiRide): RideLog {
  return { id: a.id, bikeId: a.bike_id, date: a.date, km: Number(a.km), note: a.note ?? undefined, durationMin: a.duration_min ?? undefined }
}

function trainingProfileFromApi(a: ApiTrainingProfile): TrainingProfile {
  return {
    ftpWatts: a.ftp_watts ?? undefined,
    maxHr: a.max_hr ?? undefined,
    weeklyGoalKm: a.weekly_goal_km ?? undefined,
    weeklyGoalDays: a.weekly_goal_days ?? undefined,
    goal: (a.goal as TrainingGoal | undefined) ?? undefined,
  }
}

interface AppState {
  bikes: Bike[]
  components: WearComponent[]
  rides: RideLog[]
  trainingProfile: TrainingProfile
  defaultBikeId: string | null
  loading: boolean
  loaded: boolean
  error: string | null

  loadState: () => Promise<void>
  reset: () => void
  dismissError: () => void

  addBike: (name: string, discipline: Discipline) => void
  updateBike: (id: string, patch: Partial<Pick<Bike, 'name' | 'discipline' | 'archived'>>) => void
  removeBike: (id: string) => void
  setDefaultBike: (bikeId: string) => void

  addRide: (bikeId: string, km: number, date: string, note?: string, durationMin?: number) => void
  removeRide: (id: string) => void

  updateTrainingProfile: (patch: Partial<TrainingProfile>) => void

  addComponent: (
    bikeId: string,
    type: ComponentType,
    opts?: { customLabel?: string; lifespanKm?: number; installedAtDate?: string; installedAtKmOverride?: number },
  ) => void
  replaceComponent: (id: string, date?: string) => void
  removeComponent: (id: string) => void
  updateComponent: (id: string, patch: Partial<Pick<WearComponent, 'lifespanKm' | 'notes' | 'customLabel'>>) => void
}

export const useAppStore = create<AppState>()((set, get) => ({
  bikes: [],
  components: [],
  rides: [],
  trainingProfile: {},
  defaultBikeId: null,
  loading: false,
  loaded: false,
  error: null,

  loadState: async () => {
    set({ loading: true, error: null })
    try {
      const s = await api.getState()
      set({
        bikes: s.bikes.map(bikeFromApi),
        components: s.components.map(componentFromApi),
        rides: s.rides.map(rideFromApi),
        trainingProfile: trainingProfileFromApi(s.trainingProfile),
        defaultBikeId: s.defaultBikeId,
        loading: false,
        loaded: true,
      })
    } catch (err) {
      set({ loading: false, error: errMsg(err) })
    }
  },

  reset: () => set({ bikes: [], components: [], rides: [], trainingProfile: {}, defaultBikeId: null, loaded: false, error: null }),

  dismissError: () => set({ error: null }),

  addBike: (name, discipline) => {
    api
      .createBike({ name, discipline })
      .then((row) => set((s) => ({ bikes: [...s.bikes, bikeFromApi(row)] })))
      .catch((err) => set({ error: errMsg(err) }))
  },

  updateBike: (id, patch) => {
    set((s) => ({ bikes: s.bikes.map((b) => (b.id === id ? { ...b, ...patch } : b)) }))
    api.updateBike(id, patch).catch((err) => set({ error: errMsg(err) }))
  },

  removeBike: (id) => {
    set((s) => ({
      bikes: s.bikes.filter((b) => b.id !== id),
      components: s.components.filter((c) => c.bikeId !== id),
      rides: s.rides.filter((r) => r.bikeId !== id),
    }))
    api.deleteBike(id).catch((err) => set({ error: errMsg(err) }))
  },

  setDefaultBike: (bikeId) => {
    set({ defaultBikeId: bikeId })
    api.setDefaultBike(bikeId).catch((err) => set({ error: errMsg(err) }))
  },

  addRide: (bikeId, km, date, note, durationMin) => {
    if (km <= 0) return
    api
      .createRide({ bikeId, date, km, note, durationMin })
      .then((row) => set((s) => ({ rides: [...s.rides, rideFromApi(row)] })))
      .catch((err) => set({ error: errMsg(err) }))
  },

  removeRide: (id) => {
    set((s) => ({ rides: s.rides.filter((r) => r.id !== id) }))
    api.deleteRide(id).catch((err) => set({ error: errMsg(err) }))
  },

  updateTrainingProfile: (patch) => {
    set((s) => ({ trainingProfile: { ...s.trainingProfile, ...patch } }))
    api.updateTrainingProfile(patch).catch((err) => set({ error: errMsg(err) }))
  },

  addComponent: (bikeId, type, opts) => {
    const bikeKm = totalKmForBike(get().rides, bikeId)
    const installedAtKm = opts?.installedAtKmOverride ?? bikeKm
    const installedAtDate = opts?.installedAtDate ?? todayIso()
    const lifespanKm = opts?.lifespanKm ?? defaultLifespan(type)
    api
      .createComponent({ bikeId, type, customLabel: opts?.customLabel, installedAtKm, installedAtDate, lifespanKm })
      .then((row) => set((s) => ({ components: [...s.components, componentFromApi(row)] })))
      .catch((err) => set({ error: errMsg(err) }))
  },

  replaceComponent: (id, date) => {
    api
      .replaceComponent(id, date)
      .then(() => get().loadState())
      .catch((err) => set({ error: errMsg(err) }))
  },

  removeComponent: (id) => {
    set((s) => ({ components: s.components.filter((c) => c.id !== id) }))
    api.deleteComponent(id).catch((err) => set({ error: errMsg(err) }))
  },

  updateComponent: (id, patch) => {
    set((s) => ({ components: s.components.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
    api.updateComponent(id, patch).catch((err) => set({ error: errMsg(err) }))
  },
}))

export function totalKmForBike(rides: RideLog[], bikeId: string): number {
  return rides.filter((r) => r.bikeId === bikeId).reduce((sum, r) => sum + r.km, 0)
}

export function componentDisplayLabel(c: WearComponent, componentTypeLabels?: Record<ComponentType, string>): string {
  if (c.customLabel?.trim()) return c.customLabel
  return componentTypeLabels ? componentTypeLabels[c.type] : componentLabel(c.type)
}

export function componentCurrentKm(bikeKm: number, c: WearComponent): number {
  if (!c.active) return (c.replacedAtKm ?? c.installedAtKm) - c.installedAtKm
  return Math.max(0, bikeKm - c.installedAtKm)
}

export function componentWearPct(bikeKm: number, c: WearComponent): number {
  if (c.lifespanKm <= 0) return 0
  return (componentCurrentKm(bikeKm, c) / c.lifespanKm) * 100
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Bike, Discipline, RideLog, WearComponent, ComponentType } from '../types'
import { defaultLifespan, componentLabel } from '../lib/componentDefs'
import { todayIso } from '../lib/format'

function uid(): string {
  return crypto.randomUUID()
}

interface AppState {
  bikes: Bike[]
  components: WearComponent[]
  rides: RideLog[]

  addBike: (name: string, discipline: Discipline) => string
  updateBike: (id: string, patch: Partial<Pick<Bike, 'name' | 'discipline' | 'archived'>>) => void
  removeBike: (id: string) => void

  addRide: (bikeId: string, km: number, date: string, note?: string) => void
  removeRide: (id: string) => void

  addComponent: (
    bikeId: string,
    type: ComponentType,
    opts?: { customLabel?: string; lifespanKm?: number; installedAtDate?: string; installedAtKmOverride?: number },
  ) => void
  replaceComponent: (id: string, date?: string) => void
  removeComponent: (id: string) => void
  updateComponent: (id: string, patch: Partial<Pick<WearComponent, 'lifespanKm' | 'notes' | 'customLabel'>>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      bikes: [],
      components: [],
      rides: [],

      addBike: (name, discipline) => {
        const id = uid()
        const bike: Bike = { id, name, discipline, createdAt: todayIso() }
        set((s) => ({ bikes: [...s.bikes, bike] }))
        return id
      },

      updateBike: (id, patch) => {
        set((s) => ({ bikes: s.bikes.map((b) => (b.id === id ? { ...b, ...patch } : b)) }))
      },

      removeBike: (id) => {
        set((s) => ({
          bikes: s.bikes.filter((b) => b.id !== id),
          components: s.components.filter((c) => c.bikeId !== id),
          rides: s.rides.filter((r) => r.bikeId !== id),
        }))
      },

      addRide: (bikeId, km, date, note) => {
        if (km <= 0) return
        set((s) => ({ rides: [...s.rides, { id: uid(), bikeId, km, date, note }] }))
      },

      removeRide: (id) => {
        set((s) => ({ rides: s.rides.filter((r) => r.id !== id) }))
      },

      addComponent: (bikeId, type, opts) => {
        const bikeKm = totalKmForBike(get().rides, bikeId)
        const installedAtKm = opts?.installedAtKmOverride ?? bikeKm
        const comp: WearComponent = {
          id: uid(),
          bikeId,
          type,
          customLabel: opts?.customLabel,
          installedAtKm,
          installedAtDate: opts?.installedAtDate ?? todayIso(),
          lifespanKm: opts?.lifespanKm ?? defaultLifespan(type),
          active: true,
        }
        set((s) => ({ components: [...s.components, comp] }))
      },

      replaceComponent: (id, date) => {
        const comp = get().components.find((c) => c.id === id)
        if (!comp) return
        const bikeKm = totalKmForBike(get().rides, comp.bikeId)
        const replacedAtDate = date ?? todayIso()
        const newComp: WearComponent = {
          id: uid(),
          bikeId: comp.bikeId,
          type: comp.type,
          customLabel: comp.customLabel,
          installedAtKm: bikeKm,
          installedAtDate: replacedAtDate,
          lifespanKm: comp.lifespanKm,
          active: true,
        }
        set((s) => ({
          components: [
            ...s.components.map((c) =>
              c.id === id ? { ...c, active: false, replacedAtKm: bikeKm, replacedAtDate } : c,
            ),
            newComp,
          ],
        }))
      },

      removeComponent: (id) => {
        set((s) => ({ components: s.components.filter((c) => c.id !== id) }))
      },

      updateComponent: (id, patch) => {
        set((s) => ({ components: s.components.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
      },
    }),
    { name: 'cykel-app-storage', version: 1 },
  ),
)

export function totalKmForBike(rides: RideLog[], bikeId: string): number {
  return rides.filter((r) => r.bikeId === bikeId).reduce((sum, r) => sum + r.km, 0)
}

export function componentDisplayLabel(c: WearComponent): string {
  return c.customLabel?.trim() ? c.customLabel : componentLabel(c.type)
}

export function componentCurrentKm(bikeKm: number, c: WearComponent): number {
  if (!c.active) return (c.replacedAtKm ?? c.installedAtKm) - c.installedAtKm
  return Math.max(0, bikeKm - c.installedAtKm)
}

export function componentWearPct(bikeKm: number, c: WearComponent): number {
  if (c.lifespanKm <= 0) return 0
  return (componentCurrentKm(bikeKm, c) / c.lifespanKm) * 100
}

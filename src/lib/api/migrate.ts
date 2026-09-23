import type { Bike, RideLog, TrainingProfile, WearComponent } from '../../types'

const LEGACY_KEY = 'cykel-app-storage'

interface LegacyState {
  bikes: Bike[]
  components: WearComponent[]
  rides: RideLog[]
  trainingProfile?: TrainingProfile
}

function readLegacyRaw(): LegacyState | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: LegacyState }
    return parsed.state ?? null
  } catch {
    return null
  }
}

export function hasLegacyLocalData(): boolean {
  const s = readLegacyRaw()
  return !!s && (s.bikes?.length ?? 0) > 0
}

export function readLegacyLocalData(): LegacyState | null {
  return readLegacyRaw()
}

export function clearLegacyLocalData(): void {
  try {
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // ignore
  }
}

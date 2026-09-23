const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://cykel-app-api.mtandesen.workers.dev'
const TOKEN_KEY = 'cykel-app-token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // localStorage unavailable -- session just won't persist across reloads
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  })
  if (!res.ok) {
    if (res.status === 401) setToken(null)
    const body = await res.json().catch(() => ({}))
    throw new ApiError((body as { error?: string }).error ?? `request failed (${res.status})`, res.status)
  }
  return res.json() as Promise<T>
}

// -- Server row shapes (snake_case, as returned by PostgREST) --

export interface ApiBike {
  id: string
  name: string
  discipline: string
  archived: boolean
  created_at: string
}

export interface ApiComponent {
  id: string
  bike_id: string
  type: string
  custom_label: string | null
  installed_at_km: number
  installed_at_date: string
  lifespan_km: number
  active: boolean
  replaced_at_km: number | null
  replaced_at_date: string | null
  notes: string | null
}

export interface ApiRide {
  id: string
  bike_id: string
  date: string
  km: number
  note: string | null
  duration_min: number | null
}

export interface ApiTrainingProfile {
  ftp_watts?: number | null
  max_hr?: number | null
  weekly_goal_km?: number | null
  weekly_goal_days?: number | null
  goal?: string | null
}

export interface ApiState {
  bikes: ApiBike[]
  components: ApiComponent[]
  rides: ApiRide[]
  trainingProfile: ApiTrainingProfile
  defaultBikeId: string | null
}

export interface StravaLoginResult {
  token: string
  firstName: string | null
  lastName: string | null
  hasDefaultBike: boolean
}

export interface LocalImportPayload {
  bikes: { id: string; name: string; discipline: string; archived?: boolean }[]
  components: {
    bikeId: string
    type: string
    customLabel?: string
    installedAtKm: number
    installedAtDate: string
    lifespanKm: number
    active: boolean
    replacedAtKm?: number
    replacedAtDate?: string
  }[]
  rides: { bikeId: string; date: string; km: number; note?: string; durationMin?: number }[]
  trainingProfile?: object
}

export const api = {
  exchangeStravaCode: (code: string) => request<StravaLoginResult>(`/auth/strava/callback?code=${encodeURIComponent(code)}`),
  getState: () => request<ApiState>('/api/state'),

  createBike: (bike: { name: string; discipline: string }) =>
    request<ApiBike>('/api/bikes', { method: 'POST', body: JSON.stringify(bike) }),
  updateBike: (id: string, patch: Partial<{ name: string; discipline: string; archived: boolean }>) =>
    request<ApiBike>(`/api/bikes/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteBike: (id: string) => request<{ ok: true }>(`/api/bikes/${id}`, { method: 'DELETE' }),
  setDefaultBike: (bikeId: string) => request<{ ok: true }>('/api/default-bike', { method: 'PATCH', body: JSON.stringify({ bikeId }) }),
  importStravaHistory: () => request<{ imported: number }>('/api/import-strava-history', { method: 'POST' }),

  createRide: (ride: { bikeId: string; date: string; km: number; note?: string; durationMin?: number }) =>
    request<ApiRide>('/api/rides', {
      method: 'POST',
      body: JSON.stringify({ bike_id: ride.bikeId, date: ride.date, km: ride.km, note: ride.note, duration_min: ride.durationMin }),
    }),
  deleteRide: (id: string) => request<{ ok: true }>(`/api/rides/${id}`, { method: 'DELETE' }),

  createComponent: (c: {
    bikeId: string
    type: string
    customLabel?: string
    installedAtKm: number
    installedAtDate: string
    lifespanKm: number
  }) =>
    request<ApiComponent>('/api/components', {
      method: 'POST',
      body: JSON.stringify({
        bike_id: c.bikeId,
        type: c.type,
        custom_label: c.customLabel,
        installed_at_km: c.installedAtKm,
        installed_at_date: c.installedAtDate,
        lifespan_km: c.lifespanKm,
        active: true,
      }),
    }),
  updateComponent: (id: string, patch: Partial<{ lifespanKm: number; customLabel: string; notes: string }>) =>
    request<ApiComponent>(`/api/components/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        lifespan_km: patch.lifespanKm,
        custom_label: patch.customLabel,
        notes: patch.notes,
      }),
    }),
  deleteComponent: (id: string) => request<{ ok: true }>(`/api/components/${id}`, { method: 'DELETE' }),
  replaceComponent: (id: string, date?: string) =>
    request<ApiComponent>(`/api/components/${id}/replace`, { method: 'POST', body: JSON.stringify({ date }) }),

  updateTrainingProfile: (patch: Partial<{ ftpWatts: number; maxHr: number; weeklyGoalKm: number; weeklyGoalDays: number; goal: string }>) =>
    request<ApiTrainingProfile>('/api/training-profile', {
      method: 'PATCH',
      body: JSON.stringify({
        ftp_watts: patch.ftpWatts,
        max_hr: patch.maxHr,
        weekly_goal_km: patch.weeklyGoalKm,
        weekly_goal_days: patch.weeklyGoalDays,
        goal: patch.goal,
      }),
    }),

  importLocalData: (payload: LocalImportPayload) =>
    request<{ importedBikes: number; importedRides: number; importedComponents: number }>('/api/import', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

import type { Env } from './env'
import { pgUpdate } from './db'

export interface StravaTokenResponse {
  access_token: string
  refresh_token: string
  expires_at: number // unix seconds
  athlete?: { id: number; firstname: string; lastname: string }
}

export async function exchangeCodeForToken(env: Env, code: string): Promise<StravaTokenResponse> {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) throw new Error(`strava token exchange failed: ${res.status} ${await res.text()}`)
  return res.json()
}

interface AppUserRow {
  id: string
  strava_athlete_id: number
  strava_access_token: string
  strava_refresh_token: string
  strava_expires_at: string
}

/** Returns a valid (refreshed if needed) Strava access token for this user, updating the DB if it refreshed. */
export async function freshAccessToken(env: Env, user: AppUserRow): Promise<string> {
  const expiresAt = new Date(user.strava_expires_at).getTime()
  if (expiresAt - Date.now() > 5 * 60 * 1000) return user.strava_access_token

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: user.strava_refresh_token,
    }),
  })
  if (!res.ok) throw new Error(`strava token refresh failed: ${res.status} ${await res.text()}`)
  const token: StravaTokenResponse = await res.json()

  await pgUpdate(env, 'app_users', `id=eq.${user.id}`, {
    strava_access_token: token.access_token,
    strava_refresh_token: token.refresh_token,
    strava_expires_at: new Date(token.expires_at * 1000).toISOString(),
  })

  return token.access_token
}

export interface StravaActivity {
  id: number
  name: string
  distance: number // meters
  moving_time: number // seconds
  start_date: string // ISO
  type: string
}

export async function fetchActivity(accessToken: string, activityId: number): Promise<StravaActivity> {
  const res = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`strava fetch activity failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function fetchRecentActivities(accessToken: string, afterUnix: number): Promise<StravaActivity[]> {
  const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${afterUnix}&per_page=50`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`strava list activities failed: ${res.status} ${await res.text()}`)
  return res.json()
}

/** Only cycling-type activities are relevant to this app. */
export function isRideActivity(a: StravaActivity): boolean {
  return ['Ride', 'VirtualRide', 'GravelRide', 'MountainBikeRide', 'EBikeRide'].includes(a.type)
}

import type { Env } from './env'
import { corsHeaders, errorJson, json } from './cors'
import { newToken, signToken, verifyToken } from './jwt'
import { pgDelete, pgInsert, pgSelect, pgUpdate, pgUpsert } from './db'
import {
  exchangeCodeForToken,
  fetchActivitiesPage,
  fetchActivity,
  fetchRecentActivities,
  freshAccessToken,
  isRideActivity,
  type StravaActivity,
} from './strava'

interface AppUserRow {
  id: string
  strava_athlete_id: number
  strava_access_token: string
  strava_refresh_token: string
  strava_expires_at: string
  strava_last_synced_at: string
  default_bike_id: string | null
  first_name: string | null
  last_name: string | null
}

async function requireUser(req: Request, env: Env): Promise<AppUserRow | Response> {
  const auth = req.headers.get('Authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const payload = token ? await verifyToken(token, env.APP_JWT_SECRET) : null
  if (!payload) return errorJson(env, 'unauthorized', 401)
  const rows = await pgSelect<AppUserRow>(env, 'app_users', `id=eq.${payload.sub}&select=*`)
  if (!rows[0]) return errorJson(env, 'user not found', 401)
  return rows[0]
}

function isResponse(x: unknown): x is Response {
  return x instanceof Response
}

/** Inserts a Strava activity as a ride for this user, deduped by strava_activity_id. Skips if the user has no default bike set. */
async function importActivityAsRide(env: Env, user: AppUserRow, activity: StravaActivity) {
  if (!isRideActivity(activity)) return
  if (!user.default_bike_id) return
  await pgUpsert(
    env,
    'rides',
    {
      user_id: user.id,
      bike_id: user.default_bike_id,
      date: activity.start_date.slice(0, 10),
      km: Math.round((activity.distance / 1000) * 10) / 10,
      duration_min: Math.round(activity.moving_time / 60),
      note: activity.name,
      strava_activity_id: activity.id,
    },
    'strava_activity_id',
  )
}

async function handleStravaCallback(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  if (!code) return errorJson(env, 'missing code', 400)

  const token = await exchangeCodeForToken(env, code)
  if (!token.athlete) return errorJson(env, 'strava did not return athlete info', 502)

  const rows = await pgUpsert<AppUserRow>(
    env,
    'app_users',
    {
      strava_athlete_id: token.athlete.id,
      strava_access_token: token.access_token,
      strava_refresh_token: token.refresh_token,
      strava_expires_at: new Date(token.expires_at * 1000).toISOString(),
      first_name: token.athlete.firstname,
      last_name: token.athlete.lastname,
    },
    'strava_athlete_id',
  )
  const user = rows[0]
  const appToken = await signToken(newToken(user.id, user.strava_athlete_id), env.APP_JWT_SECRET)
  return json(env, { token: appToken, firstName: user.first_name, lastName: user.last_name, hasDefaultBike: !!user.default_bike_id })
}

async function handleStravaWebhookVerify(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url)
  const mode = url.searchParams.get('hub.mode')
  const verifyToken = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')
  if (mode === 'subscribe' && verifyToken === env.STRAVA_WEBHOOK_VERIFY_TOKEN && challenge) {
    return json(env, { 'hub.challenge': challenge })
  }
  return errorJson(env, 'invalid verification request', 403)
}

interface StravaWebhookEvent {
  object_type: 'activity' | 'athlete'
  object_id: number
  aspect_type: 'create' | 'update' | 'delete'
  owner_id: number
}

async function handleStravaWebhookEvent(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  // Strava requires a fast 200 ack; do the real work after responding.
  const event = (await req.json()) as StravaWebhookEvent
  ctx.waitUntil(processWebhookEvent(env, event))
  return json(env, { ok: true })
}

async function processWebhookEvent(env: Env, event: StravaWebhookEvent) {
  if (event.object_type !== 'activity') return
  const users = await pgSelect<AppUserRow>(env, 'app_users', `strava_athlete_id=eq.${event.owner_id}&select=*`)
  const user = users[0]
  if (!user) return

  if (event.aspect_type === 'delete') {
    await pgDelete(env, 'rides', `strava_activity_id=eq.${event.object_id}`)
    return
  }

  const accessToken = await freshAccessToken(env, user)
  const activity = await fetchActivity(accessToken, event.object_id)
  await importActivityAsRide(env, user, activity)
  await pgUpdate(env, 'app_users', `id=eq.${user.id}`, { strava_last_synced_at: new Date().toISOString() })
}

/** Cron fallback: catches activities whose webhook delivery was missed. */
async function handleScheduled(env: Env) {
  const users = await pgSelect<AppUserRow>(env, 'app_users', 'select=*')
  for (const user of users) {
    try {
      const accessToken = await freshAccessToken(env, user)
      const afterUnix = Math.floor(new Date(user.strava_last_synced_at).getTime() / 1000)
      const activities = await fetchRecentActivities(accessToken, afterUnix)
      for (const activity of activities) await importActivityAsRide(env, user, activity)
      await pgUpdate(env, 'app_users', `id=eq.${user.id}`, { strava_last_synced_at: new Date().toISOString() })
    } catch (err) {
      console.error(`scheduled sync failed for user ${user.id}`, err)
    }
  }
}

async function handleApi(req: Request, env: Env, path: string): Promise<Response> {
  const user = await requireUser(req, env)
  if (isResponse(user)) return user

  const method = req.method
  let body: Record<string, unknown> | null = null
  if (method === 'POST' || method === 'PATCH') {
    body = await req
      .json<Record<string, unknown>>()
      .catch(() => ({}) as Record<string, unknown>)
  }

  // /api/state
  if (path === '/api/state' && method === 'GET') {
    const [bikes, components, rides, trainingProfile] = await Promise.all([
      pgSelect(env, 'bikes', `user_id=eq.${user.id}&select=*&order=created_at.asc`),
      pgSelect(env, 'components', `user_id=eq.${user.id}&select=*`),
      pgSelect(env, 'rides', `user_id=eq.${user.id}&select=*&order=date.desc`),
      pgSelect(env, 'training_profiles', `user_id=eq.${user.id}&select=*`),
    ])
    return json(env, {
      bikes,
      components,
      rides,
      trainingProfile: trainingProfile[0] ?? {},
      defaultBikeId: user.default_bike_id,
    })
  }

  // /api/bikes
  if (path === '/api/bikes' && method === 'POST') {
    const rows = await pgInsert(env, 'bikes', { ...body, user_id: user.id })
    return json(env, rows[0], 201)
  }
  const bikeMatch = path.match(/^\/api\/bikes\/([^/]+)$/)
  if (bikeMatch && method === 'PATCH') {
    const rows = await pgUpdate(env, 'bikes', `id=eq.${bikeMatch[1]}&user_id=eq.${user.id}`, body!)
    return json(env, rows[0])
  }
  if (bikeMatch && method === 'DELETE') {
    await pgDelete(env, 'bikes', `id=eq.${bikeMatch[1]}&user_id=eq.${user.id}`)
    return json(env, { ok: true })
  }

  // /api/default-bike
  if (path === '/api/default-bike' && method === 'PATCH') {
    await pgUpdate(env, 'app_users', `id=eq.${user.id}`, { default_bike_id: body!.bikeId })
    return json(env, { ok: true })
  }

  // /api/rides
  if (path === '/api/rides' && method === 'POST') {
    const rows = await pgInsert(env, 'rides', { ...body, user_id: user.id })
    return json(env, rows[0], 201)
  }
  const rideMatch = path.match(/^\/api\/rides\/([^/]+)$/)
  if (rideMatch && method === 'DELETE') {
    await pgDelete(env, 'rides', `id=eq.${rideMatch[1]}&user_id=eq.${user.id}`)
    return json(env, { ok: true })
  }

  // /api/components
  if (path === '/api/components' && method === 'POST') {
    const rows = await pgInsert(env, 'components', { ...body, user_id: user.id })
    return json(env, rows[0], 201)
  }
  const compMatch = path.match(/^\/api\/components\/([^/]+)$/)
  if (compMatch && method === 'PATCH') {
    const rows = await pgUpdate(env, 'components', `id=eq.${compMatch[1]}&user_id=eq.${user.id}`, body!)
    return json(env, rows[0])
  }
  if (compMatch && method === 'DELETE') {
    await pgDelete(env, 'components', `id=eq.${compMatch[1]}&user_id=eq.${user.id}`)
    return json(env, { ok: true })
  }
  const compReplaceMatch = path.match(/^\/api\/components\/([^/]+)\/replace$/)
  if (compReplaceMatch && method === 'POST') {
    const old = (await pgSelect<Record<string, unknown>>(env, 'components', `id=eq.${compReplaceMatch[1]}&user_id=eq.${user.id}&select=*`))[0]
    if (!old) return errorJson(env, 'component not found', 404)
    const rides = await pgSelect<{ km: number }>(env, 'rides', `bike_id=eq.${old.bike_id}&user_id=eq.${user.id}&select=km`)
    const bikeKm = rides.reduce((sum, r) => sum + Number(r.km), 0)
    const date = (body?.date as string) ?? new Date().toISOString().slice(0, 10)
    await pgUpdate(env, 'components', `id=eq.${old.id}`, { active: false, replaced_at_km: bikeKm, replaced_at_date: date })
    const created = await pgInsert(env, 'components', {
      user_id: user.id,
      bike_id: old.bike_id,
      type: old.type,
      custom_label: old.custom_label,
      installed_at_km: bikeKm,
      installed_at_date: date,
      lifespan_km: old.lifespan_km,
      active: true,
    })
    return json(env, created[0], 201)
  }

  // /api/training-profile
  if (path === '/api/training-profile' && method === 'PATCH') {
    const rows = await pgUpsert(env, 'training_profiles', { ...body, user_id: user.id }, 'user_id')
    return json(env, rows[0])
  }

  // /api/import-strava-history -- one-time backfill of existing Strava activities
  // (the webhook only catches activities created after the subscription was set up).
  if (path === '/api/import-strava-history' && method === 'POST') {
    if (!user.default_bike_id) return errorJson(env, 'no default bike set', 400)
    const accessToken = await freshAccessToken(env, user)
    const MAX_PAGES = 10
    let imported = 0
    for (let page = 1; page <= MAX_PAGES; page++) {
      const activities = await fetchActivitiesPage(accessToken, page)
      if (activities.length === 0) break
      const rides = activities.filter(isRideActivity).map((a) => ({
        user_id: user.id,
        bike_id: user.default_bike_id,
        date: a.start_date.slice(0, 10),
        km: Math.round((a.distance / 1000) * 10) / 10,
        duration_min: Math.round(a.moving_time / 60),
        note: a.name,
        strava_activity_id: a.id,
      }))
      if (rides.length > 0) {
        await pgUpsert(env, 'rides', rides, 'strava_activity_id')
        imported += rides.length
      }
      if (activities.length < 100) break
    }
    return json(env, { imported })
  }

  // /api/import -- one-time migration of a browser's local data into the account.
  if (path === '/api/import' && method === 'POST') {
    const bikesIn = (body?.bikes as Record<string, unknown>[]) ?? []
    const componentsIn = (body?.components as Record<string, unknown>[]) ?? []
    const ridesIn = (body?.rides as Record<string, unknown>[]) ?? []
    const idMap = new Map<string, string>()

    for (const b of bikesIn) {
      const [row] = await pgInsert<{ id: string }>(env, 'bikes', {
        user_id: user.id,
        name: b.name,
        discipline: b.discipline,
        archived: b.archived ?? false,
      })
      idMap.set(b.id as string, row.id)
    }
    for (const r of ridesIn) {
      const bikeId = idMap.get(r.bikeId as string)
      if (!bikeId) continue
      await pgInsert(env, 'rides', {
        user_id: user.id,
        bike_id: bikeId,
        date: r.date,
        km: r.km,
        note: r.note ?? null,
        duration_min: r.durationMin ?? null,
      })
    }
    for (const c of componentsIn) {
      const bikeId = idMap.get(c.bikeId as string)
      if (!bikeId) continue
      await pgInsert(env, 'components', {
        user_id: user.id,
        bike_id: bikeId,
        type: c.type,
        custom_label: c.customLabel ?? null,
        installed_at_km: c.installedAtKm,
        installed_at_date: c.installedAtDate,
        lifespan_km: c.lifespanKm,
        active: c.active,
        replaced_at_km: c.replacedAtKm ?? null,
        replaced_at_date: c.replacedAtDate ?? null,
      })
    }
    if (body?.trainingProfile) {
      await pgUpsert(env, 'training_profiles', { ...(body.trainingProfile as object), user_id: user.id }, 'user_id')
    }
    return json(env, { importedBikes: bikesIn.length, importedRides: ridesIn.length, importedComponents: componentsIn.length })
  }

  return errorJson(env, 'not found', 404)
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url)
    try {
      if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(env) })
      if (url.pathname === '/health') return json(env, { ok: true })
      if (url.pathname === '/auth/strava/callback') return handleStravaCallback(req, env)
      if (url.pathname === '/webhooks/strava' && req.method === 'GET') return handleStravaWebhookVerify(req, env)
      if (url.pathname === '/webhooks/strava' && req.method === 'POST') return handleStravaWebhookEvent(req, env, ctx)
      if (url.pathname.startsWith('/api/')) return handleApi(req, env, url.pathname)

      return errorJson(env, 'not found', 404)
    } catch (err) {
      console.error(err)
      return errorJson(env, err instanceof Error ? err.message : 'internal error', 500)
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleScheduled(env))
  },
}

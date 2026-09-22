# Cykel-App API (Cloudflare Worker)

Backend for Strava sync: exchanges the Strava login, receives Strava's webhook
when a new ride is recorded, and serves the CRUD API the frontend will use
once the account/database layer is wired in.

## One-time setup

1. `npm install`
2. `npx wrangler login`
3. Fill in `wrangler.toml`'s `[vars]` (Strava Client ID, Supabase project URL — these are not secret).
4. Set the real secrets (never committed to git):
   ```
   npx wrangler secret put STRAVA_CLIENT_SECRET
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   npx wrangler secret put APP_JWT_SECRET        # any long random string, e.g. `openssl rand -hex 32`
   npx wrangler secret put STRAVA_WEBHOOK_VERIFY_TOKEN  # any string you make up
   ```
5. Run the SQL in `../supabase/schema.sql` once in the Supabase project's SQL editor.
6. `npm run deploy` — prints the Worker's URL (`https://cykel-app-api.<your-subdomain>.workers.dev`).
7. Register the Strava webhook subscription (one-time, via curl — see Strava's
   "Webhook Events" API docs), pointing at `https://<worker-url>/webhooks/strava`
   with the same verify token as step 4.

## Local dev

`npm run dev` runs the Worker locally via `wrangler dev`.

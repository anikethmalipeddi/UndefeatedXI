# Supabase and Vercel Setup

This project plays locally without an account. Supabase is only needed for sign in, leaderboard submissions, and durable shared result links.

## What The Project Key Means

In Supabase, the "project key" people usually mean the public API key from Project Settings > API. For this app:

- Use the `anon` or `publishable` key in Vercel as `VITE_SUPABASE_ANON_KEY`.
- Never put the `service_role` or secret key in Vercel frontend env vars.
- The backend `secret` key (`sb_secret_...`) or legacy `service_role` key belongs only in Supabase Edge Function secrets.

## Local Env

Copy `.env.local.example` to `.env.local` and fill in:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

Then restart `npm run dev`.

## Create The Supabase Project

1. Create a new Supabase project.
2. In Project Settings > API, copy:
   - Project URL
   - anon/publishable key
   - service_role key
3. In Authentication > Providers, keep Email enabled.
4. To enable Google sign-in:
   - Create a Google OAuth Web client in Google Cloud.
   - Add your site origin, for example `https://www.undefeatedxi.com`, under Authorized JavaScript origins.
   - Add the Supabase Google callback URL under Authorized redirect URIs. It looks like `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`.
   - In Supabase Authentication > Providers > Google, enable Google and paste the Google Client ID and Client Secret.
   - In Supabase Authentication > URL Configuration, allow your production URL, local dev URL, and any public paths that can start sign-in.
5. In Authentication > URL Configuration, set:
   - Site URL: your production Vercel URL once you have it
   - Redirect URLs: `http://localhost:5173`, `http://localhost:5173/**`, your Vercel preview URL, your production domain, and public app paths such as `https://www.undefeatedxi.com/leaderboard`

## Push Database And Functions

Use the Supabase CLI through `npx`, so no global install is required.

```bash
npm run supabase:login
npm run supabase:link -- --project-ref YOUR_PROJECT_REF
npm run supabase:db:push
```

Supabase automatically provides the Edge Functions with `SUPABASE_URL` and backend secret keys. For local function serving, create `supabase/.env` from `supabase/.env.example`.

```bash
cp supabase/.env.example supabase/.env
```

Use `SUPABASE_SECRET_KEY=sb_secret_...` for new projects, or `SUPABASE_SERVICE_ROLE_KEY=...` if your project still uses the legacy JWT-based service role key. Do not commit `supabase/.env`.

Deploy both functions:

```bash
npm run supabase:function:submit
npm run supabase:function:share
```

`submit-run` requires a signed-in user. `share-run` is intentionally public so signed-out players can still create durable share links. Both validate payloads and rate-limit writes server-side.

After deploy, run the live smoke check:

```bash
npm run smoke:supabase
```

## Vercel Settings

Create a Vercel project from the repo and use:

- Framework Preset: Vite
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Add these Vercel environment variables:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

Do not add `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to Vercel.

## Launch Smoke Test

Before sharing the deployment:

1. Open the Vercel URL.
2. Click Sign in, then `Continue as Guest`.
3. Start and finish a quick run.
4. Click `Share Link`; it should copy a `#/r/<share_id>` URL when Supabase is configured.
5. Open that URL in a private/incognito window.
6. Submit the run to the leaderboard while in the guest session.
7. Open Leaderboard and confirm the run appears.

If Supabase is missing or offline, share links fall back to compact local URLs like `#/r/local/<payload>`.

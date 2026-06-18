const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const validModeIds = new Set([
  'world_xi',
  'premier_league',
  'champions_league',
  'world_cup',
  'ball_knowledge',
  'english_top_flight',
  'laliga',
  'serie_a',
  'bundesliga',
  'ligue_1',
  'mls',
  'classic_european_cup',
  'euros',
  'copa_america',
  'afcon',
  'club_world_cup',
  'one_club',
  'nation_xi',
  'era_lock',
  'chaos',
  'manager',
])

const validGrades = new Set(['SS', 'S', 'A+', 'A', 'B', 'C', 'D'])

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

interface SupabaseEnv {
  url: string
  secretKey: string
}

interface AuthUser {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}

interface RateLimitRow {
  count: number
  window_start: string
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing ${name}.`)
  return value
}

function jsonSecret(name: string): string | undefined {
  const raw = Deno.env.get(name)
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as Record<string, string>
    return parsed.default
  } catch {
    return undefined
  }
}

function getSupabaseEnv(): SupabaseEnv {
  return {
    url: (Deno.env.get('SUPABASE_URL') ?? Deno.env.get('SB_URL') ?? requiredEnv('SUPABASE_URL')).replace(/\/$/, ''),
    secretKey:
      jsonSecret('SUPABASE_SECRET_KEYS')
      ?? Deno.env.get('SUPABASE_SECRET_KEY')
      ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      ?? Deno.env.get('SB_KEY')
      ?? requiredEnv('SUPABASE_SECRET_KEY'),
  }
}

function looksLikeJwt(value: string): boolean {
  return value.split('.').length === 3
}

function bearerToken(authHeader: string): string {
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? ''
}

function adminHeaders(env: SupabaseEnv, extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    apikey: env.secretKey,
    ...Object.fromEntries(new Headers(extra).entries()),
  }
  if (looksLikeJwt(env.secretKey)) headers.Authorization = `Bearer ${env.secretKey}`
  return headers
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function responseError(response: Response, body: unknown): Error {
  const message = body && typeof body === 'object' && 'message' in body
    ? String((body as { message: unknown }).message)
    : `Supabase request failed with ${response.status}.`
  return new Error(message)
}

async function adminFetch(env: SupabaseEnv, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${env.url}/rest/v1/${path}`, {
    ...init,
    headers: adminHeaders(env, init.headers),
  })
}

async function getUser(env: SupabaseEnv, authHeader: string): Promise<AuthUser | null> {
  const token = bearerToken(authHeader)
  if (!looksLikeJwt(token)) return null

  const response = await fetch(`${env.url}/auth/v1/user`, {
    headers: {
      apikey: env.secretKey,
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) return null
  const body = await readBody(response)
  return body && typeof body === 'object' && typeof (body as AuthUser).id === 'string' ? body as AuthUser : null
}

interface SubmitRunPayload {
  runId?: unknown
  modeId?: unknown
  modeName?: unknown
  formationId?: unknown
  score?: unknown
  grade?: unknown
  resultTier?: unknown
  scoringVersion?: unknown
  record?: { wins?: unknown; draws?: unknown; losses?: unknown }
  goalsFor?: unknown
  goalsAgainst?: unknown
  teamRating?: unknown
  picksDigest?: unknown
  shareText?: unknown
}

function numeric(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.NaN
}

function validate(payload: SubmitRunPayload | null): string | null {
  const total = numeric(payload?.record?.wins) + numeric(payload?.record?.draws) + numeric(payload?.record?.losses)
  if (!payload || JSON.stringify(payload).length > 8000) return 'Payload too large.'
  if (!/^IXI-[A-Z0-9]{4,16}$/.test(String(payload.runId ?? ''))) return 'Invalid run id.'
  if (!validModeIds.has(String(payload.modeId ?? ''))) return 'Invalid mode id.'
  if (String(payload.modeName ?? '').length < 2 || String(payload.modeName ?? '').length > 64) return 'Invalid mode name.'
  if (!/^\d-\d-\d(?:-\d)?$/.test(String(payload.formationId ?? ''))) return 'Invalid formation.'
  if (!validGrades.has(String(payload.grade ?? ''))) return 'Invalid grade.'
  if (numeric(payload.score) < -5000 || numeric(payload.score) > 50000) return 'Invalid score.'
  if (!/^[a-z_ -]{2,64}$/i.test(String(payload.resultTier ?? ''))) return 'Invalid result tier.'
  if (!Number.isInteger(numeric(payload.scoringVersion)) || numeric(payload.scoringVersion) < 1 || numeric(payload.scoringVersion) > 10) return 'Invalid scoring version.'
  if (!Number.isInteger(total) || total < 1 || total > 42) return 'Impossible record.'
  if (numeric(payload.goalsFor) < 0 || numeric(payload.goalsFor) > 250 || numeric(payload.goalsAgainst) < 0 || numeric(payload.goalsAgainst) > 250) return 'Invalid goals.'
  if (numeric(payload.teamRating) < 0 || numeric(payload.teamRating) > 100) return 'Invalid team rating.'
  if (String(payload.picksDigest ?? '').length > 2000 || String(payload.shareText ?? '').length > 1000) return 'Payload text too large.'
  return null
}

async function getRateLimit(env: SupabaseEnv, key: string): Promise<RateLimitRow | null> {
  const params = new URLSearchParams({
    select: 'count,window_start',
    key: `eq.${key}`,
  })
  const response = await adminFetch(env, `rate_limits?${params}`)
  const body = await readBody(response)
  if (!response.ok) throw responseError(response, body)
  return Array.isArray(body) && body.length > 0 ? body[0] as RateLimitRow : null
}

async function insertRateLimit(env: SupabaseEnv, key: string, now: number): Promise<void> {
  const response = await adminFetch(env, 'rate_limits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ key, count: 1, window_start: new Date(now).toISOString() }),
  })
  if (!response.ok && response.status !== 409) throw responseError(response, await readBody(response))
}

async function updateRateLimit(env: SupabaseEnv, key: string, count: number): Promise<void> {
  const params = new URLSearchParams({ key: `eq.${key}` })
  const response = await adminFetch(env, `rate_limits?${params}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ count }),
  })
  if (!response.ok) throw responseError(response, await readBody(response))
}

async function checkRateLimit(env: SupabaseEnv, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = Date.now()
  const data = await getRateLimit(env, key)
  const windowStart = data?.window_start ? new Date(data.window_start).getTime() : 0
  if (!data || now - windowStart > windowSeconds * 1000) {
    await insertRateLimit(env, key, now)
    return true
  }
  if (data.count >= limit) return false
  await updateRateLimit(env, key, data.count + 1)
  return true
}

function sanitizeDisplayName(value: string): string {
  const clean = value.replace(/[^\p{L}\p{N}\s._-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 32)
  return clean.length >= 2 ? clean : 'Player'
}

async function insertLeaderboardRun(env: SupabaseEnv, payload: SubmitRunPayload, user: AuthUser): Promise<Response> {
  const displayName = sanitizeDisplayName(
    typeof user.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name
      : user.email?.split('@')[0] ?? 'Player',
  )

  return adminFetch(env, 'leaderboard_runs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      run_id: payload.runId,
      user_id: user.id,
      display_name: displayName,
      mode_id: payload.modeId,
      mode_name: payload.modeName,
      formation_id: payload.formationId,
      score: payload.score,
      grade: payload.grade,
      result_tier: payload.resultTier,
      scoring_version: payload.scoringVersion,
      record: payload.record,
      goals_for: payload.goalsFor,
      goals_against: payload.goalsAgainst,
      team_rating: payload.teamRating,
      picks_digest: payload.picksDigest,
      share_text: payload.shareText,
    }),
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader) return json({ error: 'Sign in required.' }, 401)

  const env = getSupabaseEnv()
  const user = await getUser(env, authHeader)
  if (!user) return json({ error: 'Sign in required.' }, 401)
  if (!await checkRateLimit(env, `leaderboard:${user.id}`, 20, 3600)) return json({ error: 'Too many submissions. Try again later.' }, 429)

  const payload = await req.json().catch(() => null)
  const validationError = validate(payload)
  if (validationError) return json({ error: validationError }, 400)

  const response = await insertLeaderboardRun(env, payload, user)
  if (!response.ok) {
    const body = await readBody(response)
    if (body && typeof body === 'object' && (body as { code?: unknown }).code === '23505') return json({ ok: true, duplicate: true })
    return json({ error: responseError(response, body).message }, 400)
  }

  return json({ ok: true })
})

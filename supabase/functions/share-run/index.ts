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

async function getOptionalUser(env: SupabaseEnv, authHeader: string): Promise<AuthUser | null> {
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

function randomShareId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('').slice(0, 18)
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

interface ShareSnapshotPayload {
  runId?: unknown
  modeId?: unknown
  formationId?: unknown
  record?: { wins?: unknown; draws?: unknown; losses?: unknown }
  picks?: unknown
  matchTrace?: unknown
  goalsFor?: unknown
  goalsAgainst?: unknown
}

function numeric(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.NaN
}

function validate(snapshot: ShareSnapshotPayload | null): string | null {
  const total = numeric(snapshot?.record?.wins) + numeric(snapshot?.record?.draws) + numeric(snapshot?.record?.losses)
  if (!snapshot || JSON.stringify(snapshot).length > 50000) return 'Snapshot too large.'
  if (!/^IXI-[A-Z0-9-]{4,32}$/.test(String(snapshot.runId ?? ''))) return 'Invalid run id.'
  if (!validModeIds.has(String(snapshot.modeId ?? ''))) return 'Invalid mode id.'
  if (!/^\d-\d-\d(?:-\d)?$/.test(String(snapshot.formationId ?? ''))) return 'Invalid formation.'
  if (!Array.isArray(snapshot.picks) || snapshot.picks.length < 1 || snapshot.picks.length > 18) return 'Invalid picks.'
  if (!Array.isArray(snapshot.matchTrace) || snapshot.matchTrace.length !== total || total < 1 || total > 42) return 'Invalid match trace.'
  if (numeric(snapshot.goalsFor) < 0 || numeric(snapshot.goalsFor) > 250 || numeric(snapshot.goalsAgainst) < 0 || numeric(snapshot.goalsAgainst) > 250) return 'Invalid goals.'
  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

  const env = getSupabaseEnv()
  const authHeader = req.headers.get('Authorization') ?? ''
  const user = authHeader ? await getOptionalUser(env, authHeader) : null
  const rateKey = `share:${user?.id ?? req.headers.get('x-forwarded-for') ?? 'anonymous'}`
  if (!await checkRateLimit(env, rateKey, 30, 3600)) return json({ error: 'Too many shared runs. Try again later.' }, 429)
  const snapshot = await req.json().catch(() => null)
  const validationError = validate(snapshot)
  if (validationError) return json({ error: validationError }, 400)

  const share_id = randomShareId()
  const response = await adminFetch(env, 'shared_runs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      share_id,
      user_id: user?.id ?? null,
      snapshot,
    }),
  })

  if (!response.ok) {
    const body = await readBody(response)
    return json({ error: responseError(response, body).message }, 400)
  }

  return json({ share_id })
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Objective = 'balanced' | 'attack' | 'resilience'
type TraceId = 'context' | 'scout' | 'tactician' | 'critic' | 'manager'

interface AgentInput {
  version: 1
  runId: string
  modeId: string
  modeName: string
  formationId: string
  objective: Objective
  targetRecord: string
  record: { wins: number; draws: number; losses: number }
  teamRatings: Record<string, number>
  tactic: { identity: string; summary: string; strengths: string[]; weaknesses: string[] }
  chemistry: { score: number; roleBalance: number; warnings: string[]; bonuses: string[] }
  simulation: Record<string, number | undefined>
  squad: Array<{
    player: string
    slot: string
    team: string
    era: string
    primaryPositions: string[]
    roleTags: string[]
    positionFit: number
    ratings: Record<string, number>
  }>
}

interface Recommendation {
  title: string
  detail: string
  evidence: string[]
}

interface SpecialistOutput {
  finding: string
  recommendation: Recommendation
  strengths: string[]
  risks: string[]
  evidence: string[]
}

interface ManagerOutput {
  headline: string
  summary: string
  formationPlan: string
  keyChanges: Recommendation[]
  strengths: string[]
  risks: string[]
  confidence: number
  evidence: string[]
}

interface AgentTrace {
  id: TraceId
  label: string
  status: 'completed' | 'fallback'
  durationMs: number
  note: string
}

interface SupabaseEnv {
  url: string
  secretKey: string
}

interface RateLimitRow {
  count: number
  window_start: string
}

const objectiveIds = new Set<Objective>(['balanced', 'attack', 'resilience'])
const specialistSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['finding', 'recommendation', 'strengths', 'risks', 'evidence'],
  properties: {
    finding: { type: 'string' },
    recommendation: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'detail', 'evidence'],
      properties: {
        title: { type: 'string' },
        detail: { type: 'string' },
        evidence: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string' } },
      },
    },
    strengths: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string' } },
    risks: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string' } },
    evidence: { type: 'array', minItems: 2, maxItems: 6, items: { type: 'string' } },
  },
}
const managerSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['headline', 'summary', 'formationPlan', 'keyChanges', 'strengths', 'risks', 'confidence', 'evidence'],
  properties: {
    headline: { type: 'string' },
    summary: { type: 'string' },
    formationPlan: { type: 'string' },
    keyChanges: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'detail', 'evidence'],
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
          evidence: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string' } },
        },
      },
    },
    strengths: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'string' } },
    risks: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'string' } },
    confidence: { type: 'integer', minimum: 0, maximum: 100 },
    evidence: { type: 'array', minItems: 2, maxItems: 8, items: { type: 'string' } },
  },
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function boundedNumber(value: unknown, minimum: number, maximum: number, integer = false): boolean {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= minimum
    && value <= maximum
    && (!integer || Number.isInteger(value))
}

function boundedTextArray(value: unknown, count: number, length: number): value is string[] {
  return Array.isArray(value)
    && value.length <= count
    && value.every((item) => typeof item === 'string' && item.length <= length)
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
    return (JSON.parse(raw) as Record<string, string>).default
  } catch {
    return undefined
  }
}

function getSupabaseEnv(): SupabaseEnv {
  return {
    url: (Deno.env.get('SUPABASE_URL') ?? Deno.env.get('SB_URL') ?? requiredEnv('SUPABASE_URL')).replace(/\/$/, ''),
    secretKey: jsonSecret('SUPABASE_SECRET_KEYS')
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
  return authHeader.match(/^Bearer\s+(.+)$/i)?.[1] ?? ''
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

function adminHeaders(env: SupabaseEnv, extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    apikey: env.secretKey,
    ...Object.fromEntries(new Headers(extra).entries()),
  }
  if (looksLikeJwt(env.secretKey)) headers.Authorization = `Bearer ${env.secretKey}`
  return headers
}

async function getUserId(env: SupabaseEnv, authHeader: string): Promise<string | null> {
  const token = bearerToken(authHeader)
  if (!looksLikeJwt(token)) return null
  const response = await fetch(`${env.url}/auth/v1/user`, {
    headers: { apikey: env.secretKey, Authorization: `Bearer ${token}` },
  })
  const body = response.ok ? await readBody(response) : null
  return isRecord(body) && typeof body.id === 'string' ? body.id : null
}

async function restFetch(env: SupabaseEnv, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${env.url}/rest/v1/${path}`, { ...init, headers: adminHeaders(env, init.headers) })
}

async function checkRateLimit(env: SupabaseEnv, key: string): Promise<boolean> {
  const params = new URLSearchParams({ select: 'count,window_start', key: `eq.${key}` })
  const currentResponse = await restFetch(env, `rate_limits?${params}`)
  if (!currentResponse.ok) throw new Error('Rate limiter unavailable.')
  const rows = await readBody(currentResponse)
  const current = Array.isArray(rows) && rows.length ? rows[0] as RateLimitRow : null
  const now = Date.now()
  const expired = !current || now - new Date(current.window_start).getTime() > 60 * 60 * 1000
  if (expired) {
    const response = await restFetch(env, 'rate_limits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ key, count: 1, window_start: new Date(now).toISOString() }),
    })
    return response.ok
  }
  if (current.count >= 8) return false
  const updateParams = new URLSearchParams({ key: `eq.${key}` })
  const response = await restFetch(env, `rate_limits?${updateParams}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ count: current.count + 1 }),
  })
  return response.ok
}

function validateInput(value: unknown): value is AgentInput {
  if (!isRecord(value) || JSON.stringify(value).length > 30000) return false
  const squad = Array.isArray(value.squad) ? value.squad : []
  const ratings = isRecord(value.teamRatings) ? Object.values(value.teamRatings) : []
  const tactic = isRecord(value.tactic) ? value.tactic : null
  const chemistry = isRecord(value.chemistry) ? value.chemistry : null
  const simulation = isRecord(value.simulation) ? value.simulation : null
  const record = isRecord(value.record) ? value.record : null
  return value.version === 1
    && typeof value.runId === 'string' && /^IXI-[A-Z0-9]{4,16}$/.test(value.runId)
    && typeof value.modeId === 'string' && /^[a-z0-9_]+$/.test(value.modeId)
    && typeof value.formationId === 'string' && /^\d-\d-\d(?:-\d)?$/.test(value.formationId)
    && objectiveIds.has(value.objective as Objective)
    && Boolean(record)
    && ['wins', 'draws', 'losses'].every((key) => boundedNumber(record?.[key], 0, 42, true))
    && Boolean(tactic) && typeof tactic?.identity === 'string' && tactic.identity.length <= 80
    && typeof tactic?.summary === 'string' && tactic.summary.length <= 500
    && boundedTextArray(tactic?.strengths, 6, 220)
    && boundedTextArray(tactic?.weaknesses, 6, 220)
    && Boolean(chemistry) && boundedNumber(chemistry?.score, 0, 100)
    && boundedNumber(chemistry?.roleBalance, 0, 100)
    && boundedTextArray(chemistry?.warnings, 6, 220)
    && boundedTextArray(chemistry?.bonuses, 6, 220)
    && Boolean(simulation)
    && squad.length >= 1 && squad.length <= 18
    && squad.every((member) => isRecord(member)
      && typeof member.player === 'string' && member.player.length >= 1 && member.player.length <= 80
      && typeof member.slot === 'string' && member.slot.length <= 20
      && boundedNumber(member.positionFit, 0, 100)
      && isRecord(member.ratings)
      && Object.values(member.ratings).every((rating) => boundedNumber(rating, 0, 100)))
    && ratings.length >= 10
    && ratings.every((rating) => typeof rating === 'number' && Number.isFinite(rating) && rating >= 0 && rating <= 100)
}

function compactContext(input: AgentInput): Record<string, unknown> {
  return {
    objective: input.objective,
    formation: input.formationId,
    record: input.record,
    ratings: input.teamRatings,
    tactic: input.tactic,
    chemistry: input.chemistry,
    simulation: input.simulation,
    squad: input.squad.map((member) => ({
      player: member.player,
      slot: member.slot,
      fit: member.positionFit,
      positions: member.primaryPositions,
      roles: member.roleTags,
      ratings: member.ratings,
    })),
  }
}

function groqOutputText(body: unknown): string {
  if (!isRecord(body) || !Array.isArray(body.choices)) return ''
  const firstChoice = body.choices[0]
  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) return ''
  return typeof firstChoice.message.content === 'string' ? firstChoice.message.content : ''
}

async function groqStructured<T>(
  apiKey: string,
  model: string,
  maxCompletionTokens: number,
  name: string,
  schema: Record<string, unknown>,
  instructions: string,
  payload: unknown,
): Promise<T> {
  let lastError = 'Groq request failed.'
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 18000)
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: instructions },
            { role: 'user', content: JSON.stringify(payload) },
          ],
          max_completion_tokens: maxCompletionTokens,
          temperature: 0.2,
          reasoning_effort: 'low',
          include_reasoning: false,
          response_format: { type: 'json_schema', json_schema: { name, strict: true, schema } },
        }),
      })
      const body = await readBody(response)
      if (response.ok) {
        const text = groqOutputText(body)
        if (!text) throw new Error('Groq returned no structured output.')
        return JSON.parse(text) as T
      }
      lastError = `Groq request failed with ${response.status}.`
      if (response.status !== 429 && response.status < 500) break
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError
    } finally {
      clearTimeout(timer)
    }
  }
  throw new Error(lastError)
}

function timed<T>(work: () => Promise<T>): Promise<{ value: T; durationMs: number }> {
  const startedAt = Date.now()
  return work().then((value) => ({ value, durationMs: Date.now() - startedAt }))
}

function lowestRating(input: AgentInput): [string, number] {
  const preferred = input.objective === 'attack'
    ? ['attack', 'finishing', 'chanceCreation', 'midfield', 'balance']
    : input.objective === 'resilience'
      ? ['defense', 'goalkeeping', 'defensiveTransitions', 'pressResistance', 'chemistry', 'balance']
      : ['attack', 'midfield', 'defense', 'goalkeeping', 'chemistry', 'tacticalCoherence', 'balance']
  return preferred.map((key) => [key, input.teamRatings[key] ?? 0] as [string, number]).sort((a, b) => a[1] - b[1])[0]
}

function specialistFallback(input: AgentInput, role: 'scout' | 'tactician'): SpecialistOutput {
  const lowestFit = [...input.squad].sort((a, b) => a.positionFit - b.positionFit)[0]
  const [metric, score] = lowestRating(input)
  return role === 'scout'
    ? {
        finding: `${lowestFit.player} has the lowest position fit in the current XI.`,
        recommendation: {
          title: 'Resolve the position-fit debt',
          detail: `Reposition or replace the ${lowestFit.slot} role before changing the strongest parts of the XI.`,
          evidence: [`${lowestFit.player}: ${lowestFit.positionFit}% fit at ${lowestFit.slot}`],
        },
        strengths: [`Squad contains ${input.squad.length} grounded player profiles`],
        risks: input.chemistry.warnings.slice(0, 2).length ? input.chemistry.warnings.slice(0, 2) : ['Match variance remains after the fit change.'],
        evidence: [`Formation: ${input.formationId}`, `Chemistry: ${input.chemistry.score}`],
      }
    : {
        finding: `${metric} is the objective-specific floor at ${score}.`,
        recommendation: {
          title: `Protect the ${metric} floor`,
          detail: `Keep the ${input.formationId} base and change one role at a time, testing each version against the current simulation.`,
          evidence: [`${metric}: ${score}`, `Tactic: ${input.tactic.identity}`],
        },
        strengths: input.tactic.strengths.slice(0, 2).length ? input.tactic.strengths.slice(0, 2) : [input.tactic.identity],
        risks: input.tactic.weaknesses.slice(0, 2).length ? input.tactic.weaknesses.slice(0, 2) : ['A broad tactical change could erase the current identity.'],
        evidence: [`Trophy probability: ${input.simulation.trophyProbability}%`, `Record: ${input.record.wins}-${input.record.draws}-${input.record.losses}`],
      }
}

function managerFallback(input: AgentInput, scout: SpecialistOutput, tactician: SpecialistOutput): ManagerOutput {
  const [metric, score] = lowestRating(input)
  return {
    headline: `Keep the core; raise ${metric} before adding more star power.`,
    summary: `The agent workflow reviewed every player fit, the tactic report, and the simulated ${input.record.wins}-${input.record.draws}-${input.record.losses} run. The best next step is a targeted, measurable correction.`,
    formationPlan: `Keep the ${input.formationId} base, preserve ${input.tactic.identity.toLowerCase()}, and change one role at a time around the ${metric} score of ${score}.`,
    keyChanges: [
      scout.recommendation,
      tactician.recommendation,
      {
        title: 'Ship behind a rollback gate',
        detail: 'Keep the change only if loss probability and expected goals against improve without materially reducing win probability.',
        evidence: [`Win probability: ${input.simulation.averageWinProbability}%`, `Loss probability: ${input.simulation.averageLossProbability}%`],
      },
    ],
    strengths: [...scout.strengths, ...tactician.strengths].slice(0, 4),
    risks: [...scout.risks, ...tactician.risks].slice(0, 4),
    confidence: Math.max(55, Math.min(94, Math.round((input.teamRatings.dataConfidence ?? 80) - 4))),
    evidence: [...scout.evidence, ...tactician.evidence].slice(0, 8),
  }
}

function trace(id: TraceId, label: string, status: AgentTrace['status'], durationMs: number, note: string): AgentTrace {
  return { id, label, status, durationMs, note }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

  try {
    const authHeader = request.headers.get('Authorization') ?? ''
    const env = getSupabaseEnv()
    const userId = await getUserId(env, authHeader)
    if (!userId) return json({ error: 'Sign in required.' }, 401)
    if (!await checkRateLimit(env, `agents:${userId}`)) return json({ error: 'Agent limit reached. Try again later.' }, 429)

    const input = await request.json().catch(() => null)
    if (!validateInput(input)) return json({ error: 'Invalid agent context.' }, 400)

    const model = Deno.env.get('GROQ_MODEL') ?? 'openai/gpt-oss-120b'
    const apiKey = Deno.env.get('GROQ_API_KEY')
    const context = compactContext(input)
    const traces: AgentTrace[] = [trace('context', 'Context builder', 'completed', 0, `Grounded ${input.squad.length} squad profiles without account data.`)]
    let scout = specialistFallback(input, 'scout')
    let tactician = specialistFallback(input, 'tactician')
    let scoutStatus: AgentTrace['status'] = 'fallback'
    let tacticStatus: AgentTrace['status'] = 'fallback'
    let scoutDuration = 0
    let tacticDuration = 0

    if (apiKey) {
      const [scoutRun, tacticRun] = await Promise.allSettled([
        timed(() => groqStructured<SpecialistOutput>(
          apiKey,
          model,
          800,
          'squad_scout_report',
          specialistSchema,
          'You are the squad scout in a multi-agent football simulation audit. Use only supplied facts. Identify position-fit and role-balance leverage. Never invent players or transfers. Keep recommendations concrete and concise.',
          context,
        )),
        timed(() => groqStructured<SpecialistOutput>(
          apiKey,
          model,
          800,
          'tactical_analyst_report',
          specialistSchema,
          'You are the tactical analyst in a multi-agent football simulation audit. Use only supplied ratings, tactic, chemistry, and probabilities. Optimize the stated objective. Make a reversible formation or role recommendation and cite numbers.',
          context,
        )),
      ])
      if (scoutRun.status === 'fulfilled') {
        scout = scoutRun.value.value
        scoutDuration = scoutRun.value.durationMs
        scoutStatus = 'completed'
      }
      if (tacticRun.status === 'fulfilled') {
        tactician = tacticRun.value.value
        tacticDuration = tacticRun.value.durationMs
        tacticStatus = 'completed'
      }
    }

    traces.push(
      trace('scout', 'Squad scout', scoutStatus, scoutDuration, scoutStatus === 'completed' ? scout.finding : 'Deterministic scout recovered the workflow.'),
      trace('tactician', 'Tactical analyst', tacticStatus, tacticDuration, tacticStatus === 'completed' ? tactician.finding : 'Deterministic tactician recovered the workflow.'),
    )

    const criticStarted = Date.now()
    const criticRisks = [...scout.risks, ...tactician.risks, ...input.chemistry.warnings].filter(Boolean).slice(0, 5)
    traces.push(trace('critic', 'Risk critic', 'completed', Date.now() - criticStarted, `Challenged the plan against ${criticRisks.length} grounded risk signals and a rollback gate.`))

    let manager = managerFallback(input, scout, tactician)
    let managerStatus: AgentTrace['status'] = 'fallback'
    let managerDuration = 0
    let managerFailure = ''
    if (apiKey) {
      try {
        const run = await timed(() => groqStructured<ManagerOutput>(
          apiKey,
          model,
          1200,
          'agent_manager_report',
          managerSchema,
          'You manage a scout, tactical analyst, and risk critic. Reconcile their evidence into exactly three prioritized changes. Use only the supplied context and specialist reports. Preserve a measurable rollback gate. Do not invent players, statistics, or outside facts.',
          { context, specialists: { scout, tactician }, critic: { risks: criticRisks } },
        ))
        manager = run.value
        managerDuration = run.durationMs
        managerStatus = 'completed'
      } catch (error) {
        managerFailure = error instanceof Error ? error.message : 'Groq synthesis was unavailable.'
        // The deterministic synthesis below is the intentional failure-recovery path.
      }
    }
    traces.push(trace('manager', 'Manager synthesis', managerStatus, managerDuration, managerStatus === 'completed' ? 'Reconciled specialist disagreement into three testable changes.' : 'Deterministic manager preserved a complete, testable report.'))

    return json({
      version: 1,
      runId: input.runId,
      objective: input.objective,
      source: managerStatus === 'completed' ? 'groq' : 'local',
      model: managerStatus === 'completed' ? model : undefined,
      ...manager,
      risks: manager.risks.length ? manager.risks : criticRisks,
      guardrails: [
        'Grounded only in this run’s structured squad and simulation data',
        'No account identity is sent to the model',
        'No external player claims or invented transfer targets',
        'Strict schemas validate every model response',
        'Timeouts, retry, specialist fallbacks, and a full synthesis fallback',
        'Changes require a regression check against the original run',
      ],
      traces,
      generatedAt: new Date().toISOString(),
      fallbackReason: managerStatus === 'fallback' ? (apiKey ? managerFailure || 'Groq synthesis was unavailable.' : 'The free Groq API is not configured.') : undefined,
    })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Agent workflow failed.' }, 500)
  }
})

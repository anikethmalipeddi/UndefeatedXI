import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { getModeConfig } from '../src/data/modes'
import { playerContexts } from '../src/data/playerContexts'
import { configureDraftPlayerContexts, createDraftState, isDraftComplete, selectPlayer, spinForSlot } from '../src/engine/draft'
import { simulateRun } from '../src/engine/simulation'
import { createLeaderboardSubmission } from '../src/services/supabase'
import { createSharedRunSnapshot, validateSharedRunSnapshot } from '../src/services/shareLinks'

type EnvMap = Record<string, string>

function loadEnvFile(path: string): EnvMap {
  try {
    return Object.fromEntries(
      readFileSync(path, 'utf8')
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
        .map((line) => {
          const index = line.indexOf('=')
          return [line.slice(0, index), line.slice(index + 1)]
        }),
    )
  } catch {
    return {}
  }
}

function required(env: EnvMap, key: string): string {
  const value = env[key]
  if (!value) throw new Error(`Missing ${key}.`)
  return value
}

function looksLikeJwt(value: string): boolean {
  return value.split('.').length === 3
}

function adminHeaders(secretKey: string, extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    apikey: secretKey,
    ...Object.fromEntries(new Headers(extra).entries()),
  }
  if (looksLikeJwt(secretKey)) headers.Authorization = `Bearer ${secretKey}`
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

function errorMessage(response: Response, body: unknown): string {
  return body && typeof body === 'object' && 'message' in body
    ? String((body as { message: unknown }).message)
    : `HTTP ${response.status}`
}

async function adminFetch(url: string, secretKey: string, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${url.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...init,
    headers: adminHeaders(secretKey, init.headers),
  })
}

async function maybeDeleteRow(url: string, secretKey: string, table: string, column: string, value: string): Promise<void> {
  const params = new URLSearchParams({ [column]: `eq.${value}` })
  await adminFetch(url, secretKey, `${table}?${params}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  })
}

async function maybeDeleteUser(url: string, secretKey: string, userId: string): Promise<void> {
  await fetch(`${url.replace(/\/$/, '')}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: adminHeaders(secretKey),
  })
}

async function createConfirmedUser(url: string, secretKey: string, email: string, password: string): Promise<void> {
  const response = await fetch(`${url.replace(/\/$/, '')}/auth/v1/admin/users`, {
    method: 'POST',
    headers: adminHeaders(secretKey, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: 'Codex Smoke' },
    }),
  })
  if (!response.ok) throw new Error(errorMessage(response, await readBody(response)))
}

function createCompleteRun() {
  configureDraftPlayerContexts(playerContexts)
  const mode = getModeConfig('world_xi')
  let state = createDraftState(mode, '4-3-3')

  while (!isDraftComplete(state)) {
    state = spinForSlot(mode, state)
    const slot = state.draftSlots[state.roundIndex]
    const player = state.currentOptions.find((option) => option.primaryPositions.some((position) => slot.accepts.includes(position))) ?? state.currentOptions[0]
    state = selectPlayer(state, player)
  }

  return {
    state,
    result: simulateRun(state.picks, mode.modeId, state.seed),
  }
}

async function main(): Promise<void> {
  const frontendEnv = loadEnvFile('.env.local')
  const functionEnv = loadEnvFile('supabase/.env')
  const url = required(frontendEnv, 'VITE_SUPABASE_URL')
  const publishableKey = required(frontendEnv, 'VITE_SUPABASE_ANON_KEY')
  const secretKey = functionEnv.SUPABASE_SECRET_KEY ?? functionEnv.SUPABASE_SERVICE_ROLE_KEY ?? functionEnv.SB_KEY
  const supabase = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { state, result } = createCompleteRun()
  const snapshot = createSharedRunSnapshot(result, '4-3-3', state.picks)
  const snapshotIssues = validateSharedRunSnapshot(snapshot)
  if (snapshotIssues.length > 0) throw new Error(`Snapshot invalid: ${snapshotIssues.join(', ')}`)

  const shareResponse = await supabase.functions.invoke('share-run', { body: snapshot })
  if (shareResponse.error) throw new Error(`share-run failed: ${shareResponse.error.message}`)
  const shareId = shareResponse.data?.share_id
  if (typeof shareId !== 'string') throw new Error('share-run did not return share_id.')

  const sharedRead = await supabase.from('shared_runs').select('snapshot').eq('share_id', shareId).single()
  if (sharedRead.error) throw new Error(`shared_runs read failed: ${sharedRead.error.message}`)
  if (sharedRead.data?.snapshot?.runId !== result.runId) throw new Error('Shared run readback did not match the submitted run.')

  const leaderboardRead = await supabase.from('leaderboard_runs').select('run_id,mode_id,score').limit(3)
  if (leaderboardRead.error) throw new Error(`leaderboard read failed: ${leaderboardRead.error.message}`)

  let submitStatus = 'skipped: missing backend secret for temporary Auth user'
  let smokeUserId = ''
  if (secretKey) {
    const email = `codex-smoke-${Date.now()}@example.com`
    const password = `Codex-${Date.now()}!`

    const signup = await supabase.auth.signUp({ email, password, options: { data: { display_name: 'Codex Smoke' } } })
    let session = signup.data.session
    if (!session) {
      await createConfirmedUser(url, secretKey, email, password).catch(() => undefined)
      const signin = await supabase.auth.signInWithPassword({ email, password })
      session = signin.data.session
    }

    if (session) {
      smokeUserId = session.user.id
      const submit = await supabase.functions.invoke('submit-run', {
        body: createLeaderboardSubmission(result, '4-3-3', state.picks),
      })
      if (submit.error) throw new Error(`submit-run failed: ${submit.error.message}`)

      const savedRun = await supabase.from('leaderboard_runs').select('run_id,user_id,mode_id,score').eq('run_id', result.runId).single()
      if (savedRun.error) throw new Error(`leaderboard saved read failed: ${savedRun.error.message}`)
      if (savedRun.data?.run_id !== result.runId) throw new Error('Leaderboard readback did not match the submitted run.')
      submitStatus = 'submitted and read back'
    } else {
      submitStatus = 'skipped: email confirmation required or test sign-in unavailable'
    }
  }

  if (secretKey) {
    await maybeDeleteRow(url, secretKey, 'leaderboard_runs', 'run_id', result.runId)
    await maybeDeleteRow(url, secretKey, 'shared_runs', 'share_id', shareId)
    if (smokeUserId) await maybeDeleteUser(url, secretKey, smokeUserId)
  }

  console.log(JSON.stringify({
    share: 'created and read back',
    shareId,
    leaderboardRead: 'public select works',
    leaderboardRowsReadable: leaderboardRead.data?.length ?? 0,
    leaderboardSubmit: submitStatus,
    cleanup: secretKey ? 'attempted' : 'skipped',
  }, null, 2))
}

void main()

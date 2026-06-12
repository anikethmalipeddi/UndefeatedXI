import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'
import type { DraftPick, RunResult } from '../types'
import { scoreRun, summarizeRun } from '../engine/storage'

const viteEnv = import.meta.env ?? {}
const supabaseUrl = viteEnv.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = viteEnv.VITE_SUPABASE_ANON_KEY as string | undefined

export const hasSupabaseConfig = viteEnv.MODE !== 'test' && Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient | null = hasSupabaseConfig
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

export interface AuthProfile {
  id: string
  email?: string
  displayName: string
}

export interface LeaderboardRun {
  run_id: string
  user_id: string
  display_name: string
  mode_id: string
  mode_name: string
  formation_id: string
  score: number
  grade: string
  record: RunResult['record']
  goals_for: number
  goals_against: number
  team_rating: number
  picks_digest: string
  share_text: string
  created_at: string
}

export type LeaderboardView = 'global' | 'mode' | 'mine'

export interface LeaderboardSubmission {
  runId: string
  modeId: string
  modeName: string
  formationId: string
  score: number
  grade: string
  record: RunResult['record']
  goalsFor: number
  goalsAgainst: number
  teamRating: number
  picksDigest: string
  shareText: string
}

export type FeedbackCategory = 'bug' | 'player_data' | 'feature' | 'general'

export interface FeedbackSubmission {
  category: FeedbackCategory
  message: string
  contactEmail?: string
  modeId?: string
  runId?: string
  pageUrl?: string
}

export function sanitizeDisplayName(value: string): string {
  return value.replace(/[^\p{L}\p{N}\s._-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 32)
}

function sanitizeOptionalText(value: string | undefined, limit: number): string | null {
  const clean = value?.replace(/\s+/g, ' ').trim().slice(0, limit) ?? ''
  return clean || null
}

function sanitizeFeedbackMessage(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 2000)
}

function sanitizeFeedbackEmail(value: string | undefined): string | null {
  const clean = value?.trim().slice(0, 254) ?? ''
  if (!clean) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw new Error('Enter a valid email or leave it blank.')
  return clean
}

export function profileFromSession(session: Session | null): AuthProfile | null {
  if (!session?.user) return null
  const metadataName = typeof session.user.user_metadata?.display_name === 'string' ? session.user.user_metadata.display_name : ''
  const emailName = session.user.email?.split('@')[0] ?? 'Player'
  return {
    id: session.user.id,
    email: session.user.email,
    displayName: sanitizeDisplayName(metadataName || emailName) || 'Player',
  }
}

function isValidRecord(record: RunResult['record']): boolean {
  return (
    Number.isInteger(record.wins) &&
    Number.isInteger(record.draws) &&
    Number.isInteger(record.losses) &&
    record.wins >= 0 &&
    record.draws >= 0 &&
    record.losses >= 0 &&
    record.wins + record.draws + record.losses <= 42
  )
}

export function buildPicksDigest(picks: DraftPick[]): string {
  return picks
    .map((pick) => `${pick.slot.label}:${pick.player.displayName}@${pick.roll.team.label}/${pick.roll.era}`)
    .join(' | ')
    .slice(0, 1800)
}

export function createLeaderboardSubmission(result: RunResult, formationId: string, picks: DraftPick[]): LeaderboardSubmission {
  const summary = summarizeRun(result, formationId)
  return {
    runId: result.runId,
    modeId: result.modeId,
    modeName: result.modeName,
    formationId,
    score: scoreRun(result),
    grade: result.grade,
    record: result.record,
    goalsFor: result.goalsFor,
    goalsAgainst: result.goalsAgainst,
    teamRating: result.teamRatings.overall,
    picksDigest: buildPicksDigest(picks),
    shareText: result.shareText || `${summary.modeName}: ${summary.record.wins}-${summary.record.draws}-${summary.record.losses}`,
  }
}

export function validateLeaderboardSubmission(payload: LeaderboardSubmission): string[] {
  const issues: string[] = []
  if (!/^IXI-[A-Z0-9]{4,16}$/.test(payload.runId)) issues.push('Invalid run id.')
  if (!/^[a-z0-9_]+$/.test(payload.modeId)) issues.push('Invalid mode id.')
  if (!/^\d-\d-\d(?:-\d)?$/.test(payload.formationId)) issues.push('Invalid formation id.')
  if (!Number.isFinite(payload.score) || payload.score < -5000 || payload.score > 20000) issues.push('Invalid score.')
  if (!isValidRecord(payload.record)) issues.push('Impossible record.')
  if (!Number.isFinite(payload.goalsFor) || payload.goalsFor < 0 || payload.goalsFor > 250) issues.push('Invalid goals for.')
  if (!Number.isFinite(payload.goalsAgainst) || payload.goalsAgainst < 0 || payload.goalsAgainst > 250) issues.push('Invalid goals against.')
  if (!Number.isFinite(payload.teamRating) || payload.teamRating < 0 || payload.teamRating > 100) issues.push('Invalid team rating.')
  if (payload.picksDigest.length > 2000) issues.push('Picks digest too large.')
  if (payload.shareText.length > 1000) issues.push('Share text too large.')
  return issues
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function signUp(email: string, password: string, displayName: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const cleanName = sanitizeDisplayName(displayName)
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: cleanName || 'Player' } },
  })
  if (error) throw error
}

export async function signIn(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const redirectTo = typeof window === 'undefined' ? undefined : `${window.location.origin}${window.location.pathname}`
  const { error } = await supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined)
  if (error) throw error
}

export async function updateDisplayName(displayName: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const cleanName = sanitizeDisplayName(displayName)
  if (cleanName.length < 2) throw new Error('Display name must be at least 2 characters.')
  const { error } = await supabase.auth.updateUser({ data: { display_name: cleanName } })
  if (error) throw error
}

export async function submitLeaderboardRun(payload: LeaderboardSubmission): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const issues = validateLeaderboardSubmission(payload)
  if (issues.length > 0) throw new Error(issues[0])
  const { error } = await supabase.functions.invoke('submit-run', { body: payload })
  if (!error) return

  const context = 'context' in error ? error.context : undefined
  if (context instanceof Response) {
    const body = await context.clone().json().catch(() => null) as { error?: string } | null
    if (body?.error) throw new Error(body.error)
  }
  throw error
}

export async function fetchLeaderboardRuns(view: LeaderboardView, modeId?: string): Promise<LeaderboardRun[]> {
  if (!supabase) return []
  let query = supabase
    .from('leaderboard_runs')
    .select('run_id,user_id,display_name,mode_id,mode_name,formation_id,score,grade,record,goals_for,goals_against,team_rating,picks_digest,share_text,created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (view === 'mode' && modeId) query = query.eq('mode_id', modeId)
  if (view === 'mine') {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return []
    query = query.eq('user_id', data.user.id)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as LeaderboardRun[]
}

export async function submitFeedback(payload: FeedbackSubmission): Promise<void> {
  if (!supabase) throw new Error('Feedback is not configured on this build.')

  const message = sanitizeFeedbackMessage(payload.message)
  if (message.length < 8) throw new Error('Feedback must be at least 8 characters.')

  const contactEmail = sanitizeFeedbackEmail(payload.contactEmail)
  const { data: userData } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('feedback_submissions')
    .insert({
      category: payload.category,
      message,
      contact_email: contactEmail,
      mode_id: sanitizeOptionalText(payload.modeId, 64),
      run_id: sanitizeOptionalText(payload.runId, 32),
      page_url: sanitizeOptionalText(payload.pageUrl, 500),
      user_agent: typeof navigator === 'undefined' ? null : sanitizeOptionalText(navigator.userAgent, 500),
      user_id: userData.user?.id ?? null,
    })

  if (error) throw error
}
